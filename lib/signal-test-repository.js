import { getAccessRequestByCode } from "./access-repository";

const TEST_ACCESS_CODE = "THEROOM01";

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || "";
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function hasSupabase() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

function getRestUrl(table, query = "") {
  return `${getSupabaseUrl()}/rest/v1/${table}${query}`;
}

function getBaseHeaders(schema, prefer = "return=representation") {
  const serviceKey = getSupabaseServiceKey();
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Profile": schema,
    "Content-Profile": schema,
    Prefer: prefer,
  };
}

async function restRequest({ schema, table, query = "", method = "GET", body, prefer }) {
  const response = await fetch(getRestUrl(table, query), {
    method,
    headers: getBaseHeaders(schema, prefer),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${schema}.${table} ${method} failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function createEvent({ contactId = null, campaignId = null, enrolmentId = null, eventType, payload = {} }) {
  try {
    await restRequest({
      schema: "ops",
      table: "events",
      method: "POST",
      body: {
        contact_id: contactId,
        campaign_id: campaignId,
        enrolment_id: enrolmentId,
        event_type: eventType,
        payload,
      },
    });
  } catch (error) {
    // Non-blocking in V1.
  }
}

function parseScale(value) {
  if (value == null || value === "") {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function averageScales(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) {
    return null;
  }
  return Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 100) / 100;
}

function mapReactionScore(value) {
  const map = {
    "Je veux voir ça": 5,
    "Je suis curieux·se": 4,
    Bof: 2,
    "Pas pour moi": 1,
  };
  return map[value] || null;
}

function mapBinaryScore(value) {
  if (value === "oui") {
    return 5;
  }
  if (value === "non") {
    return 1;
  }
  return null;
}

function mapRoomReadingScore(value) {
  const map = {
    "Trop long": 1,
    "Un peu long": 2,
    "Bien comme il faut": 4,
    "Rapide & fluide": 5,
  };
  return map[value] || null;
}

function buildTestResponseRow(enrolmentId, answers) {
  return {
    enrolment_id: enrolmentId,
    submitted_at: new Date().toISOString(),
    immediate_reaction_score: mapReactionScore(answers.reaction),
    promise_clarity_score: parseScale(answers.clarte),
    watch_intent_score: parseScale(answers.envie_regarder),
    emotional_intensity_score: parseScale(answers.intensite),
    mood_clarity_score: averageScales([
      parseScale(answers.clarte_univers),
      parseScale(answers.clarte_dramatique),
      parseScale(answers.clarte_emotionnel),
    ]),
    character_interest_score: parseScale(answers.interet_perso),
    character_projection_score: parseScale(answers.projection_perso),
    continue_intent_score: parseScale(answers.questions),
    recommendation_score: parseScale(answers.reco),
    talkability_score: parseScale(answers.conversation),
  };
}

function buildRoomFeedbackRow(enrolmentId, answers) {
  return {
    enrolment_id: enrolmentId,
    submitted_at: new Date().toISOString(),
    reading_fluidity_score: mapRoomReadingScore(answers.room_lecture),
    material_sufficiency_score: mapBinaryScore(answers.room_suffisant),
    usefulness_score: parseScale(answers.room_utilite),
    experience_quality_score: parseScale(answers.room_xp),
    duration_relevance_score: mapRoomReadingScore(answers.room_duree),
    device_recommendation_score: parseScale(answers.room_reco),
    free_comment: answers.room_plus || null,
  };
}

function buildVerbatims(testResponseId, answers) {
  const rows = [];

  const pushRow = (questionCode, value) => {
    if (!value) {
      return;
    }

    const text = Array.isArray(value) ? value.join(", ") : String(value).trim();
    if (!text) {
      return;
    }

    rows.push({
      test_response_id: testResponseId,
      question_code: questionCode,
      verbatim_text: text,
    });
  };

  pushRow("hook_accroche", answers.accroche);
  pushRow("feel_verbatim", answers.feel_verbatim);
  pushRow("feel_emotion", answers.emotionAutre || answers.emotion);
  pushRow("care_attachement", answers.attachement);
  pushRow("care_personnages", answers.care_perso);
  pushRow("care_pourquoi", answers.care_pourquoi);
  pushRow("continue_raisons", answers.continue_raison);
  pushRow("continue_decroche", answers.decroche);
  pushRow("continue_binge", answers.binge);
  pushRow("continue_drop", answers.drop);
  pushRow("share_cible", answers.cible);
  pushRow("share_pitch", answers.pitch_mots);

  return rows;
}

export async function submitSignalTest({ accessCode = TEST_ACCESS_CODE, answers }) {
  if (!hasSupabase()) {
    return { ok: true, mode: "local" };
  }

  const accessRecord = await getAccessRequestByCode(accessCode || TEST_ACCESS_CODE);
  if (!accessRecord) {
    throw new Error("unknown_access");
  }

  const enrolmentId = accessRecord.id;
  const testResponseBody = buildTestResponseRow(enrolmentId, answers || {});

  const testResponseRows = await restRequest({
    schema: "signal",
    table: "test_responses",
    query: "?on_conflict=enrolment_id",
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: testResponseBody,
  });

  const testResponse = testResponseRows[0];
  const verbatims = buildVerbatims(testResponse.id, answers || {});

  await restRequest({
    schema: "signal",
    table: "test_verbatims",
    query: `?test_response_id=eq.${testResponse.id}`,
    method: "DELETE",
    prefer: "return=representation",
  });

  if (verbatims.length) {
    await restRequest({
      schema: "signal",
      table: "test_verbatims",
      method: "POST",
      body: verbatims,
    });
  }

  const roomFeedbackRows = await restRequest({
    schema: "signal",
    table: "room_feedback",
    query: "?on_conflict=enrolment_id",
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: buildRoomFeedbackRow(enrolmentId, answers || {}),
  });

  await restRequest({
    schema: "ops",
    table: "enrolments",
    query: `?id=eq.${enrolmentId}`,
    method: "PATCH",
    body: {
      completed_at: new Date().toISOString(),
      status: "completed",
    },
  });

  await createEvent({
    contactId: accessRecord.contactId,
    campaignId: accessRecord.campaignId,
    enrolmentId,
    eventType: "test_submitted",
    payload: {
      test_response_id: testResponse.id,
      room_feedback_id: roomFeedbackRows?.[0]?.id || null,
    },
  });

  return {
    ok: true,
    enrolmentId,
    testResponseId: testResponse.id,
  };
}
