import { hasSupabase, restRequest, selectOne } from "./supabase-client";

const DASHBOARD_SCHEMA = "analytics";
const CAMPAIGN_SCHEMA = "ops";
const V3_PROJECT_VERSION = "maree_noire_v2";
const V3_FORM_VERSION = "signal_v3";
const V3_SCORING_MODEL_VERSION = "signal_v3";

const DIMENSIONS = [
  {
    key: "hook",
    label: "Hook",
    scoreKey: "hook_score",
    items: [
      { key: "hook_discovery_score", label: "Accroche de découverte" },
      { key: "curiosity_score", label: "Curiosité" },
    ],
  },
  {
    key: "feel",
    label: "Feel",
    scoreKey: "feel_score",
    items: [
      { key: "felt_something_score", label: "Quelque chose ressenti" },
      { key: "atmosphere_stay_score", label: "Envie de rester dans l’atmosphère" },
    ],
  },
  {
    key: "care",
    label: "Care",
    scoreKey: "care_score",
    items: [
      { key: "character_intrigue_score", label: "Intrigue des personnages" },
      { key: "character_fate_interest_score", label: "Intérêt pour leur destin" },
    ],
  },
  {
    key: "continue",
    label: "Continue",
    scoreKey: "continue_score",
    items: [
      { key: "continue_intent_score", label: "Envie de continuer" },
      { key: "watch_intent_score", label: "Intention de regarder" },
    ],
  },
  {
    key: "share",
    label: "Share",
    scoreKey: "share_score",
    items: [
      { key: "recommendation_score", label: "Recommandation" },
      { key: "talkability_score", label: "Capacité à en parler" },
    ],
  },
];

const VERBATIM_GROUPS = [
  {
    key: "continue_moteur_frein",
    title: "MOTEUR / FREIN",
    empty: "Aucun moteur ou frein exprimé pour l’instant.",
  },
  {
    key: "share_pitch",
    title: "LE PROJET RACONTÉ PAR LE PUBLIC",
    empty: "Aucune reformulation du projet pour l’instant.",
  },
  {
    key: "care_pourquoi",
    title: "PERSONNAGES",
    empty: "Aucun développement personnage pour l’instant.",
  },
  {
    key: "feel_emotion",
    title: "ÉMOTION",
    empty: "Aucune émotion formulée pour l’instant.",
  },
];

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value) {
  if (value == null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function orderDimensionNames(values) {
  const order = new Map(DIMENSIONS.map((dimension, index) => [dimension.label, index]));

  return toArray(values).sort((first, second) => {
    const firstIndex = order.has(first) ? order.get(first) : Number.MAX_SAFE_INTEGER;
    const secondIndex = order.has(second) ? order.get(second) : Number.MAX_SAFE_INTEGER;
    return firstIndex - secondIndex || String(first).localeCompare(String(second));
  });
}

function average(rows, key) {
  const values = rows.map((row) => toNumber(row?.[key])).filter((value) => value != null);

  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function encodeEq(value) {
  return encodeURIComponent(String(value || "").trim());
}

function normalizeCampaignCode(campaignCode) {
  return String(campaignCode || "").trim().toUpperCase();
}

function mapCampaign(campaign) {
  if (!campaign) {
    return null;
  }

  return {
    id: campaign.id || null,
    code: campaign.campagne_code || campaign.campaign_code || null,
    name: campaign.name || campaign.campaign_name || null,
    status: campaign.status || campaign.campaign_status || null,
    projectVersion: campaign.project_version || null,
    formVersion: campaign.form_version || null,
    analyseStatus: campaign.analyse_status ?? null,
  };
}

function mapSummary(summary) {
  if (!summary) {
    return null;
  }

  return {
    campaignId: summary.campaign_id,
    campaignCode: summary.campaign_code,
    campaignName: summary.campaign_name,
    campaignStatus: summary.campaign_status,
    projectVersion: summary.project_version,
    formVersion: summary.form_version,
    scoringModelVersion: summary.scoring_model_version,
    sampleSize: toNumber(summary.sample_size) ?? 0,
    desirabilityScore: toNumber(summary.desirability_score),
    dimensions: DIMENSIONS.map((dimension) => ({
      key: dimension.key,
      label: dimension.label,
      score: toNumber(summary[dimension.scoreKey]),
    })),
    strongestDimension: summary.strongest_dimension || null,
    strongestDimensions: orderDimensionNames(summary.strongest_dimensions),
    weakestDimension: summary.weakest_dimension || null,
    weakestDimensions: orderDimensionNames(summary.weakest_dimensions),
  };
}

function mapDimensionDetails(summary, dimensionItems) {
  return DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    score: toNumber(summary?.[dimension.scoreKey]),
    items: dimension.items.map((item) => ({
      key: item.key,
      label: item.label,
      average: average(dimensionItems, item.key),
      values: dimensionItems
        .map((row) => ({
          responseCode: row.response_code || null,
          value: toNumber(row[item.key]),
        }))
        .filter((itemValue) => itemValue.value != null),
    })),
  }));
}

function mapDiagnostics(rows) {
  return rows.map((row) => ({
    enrolmentId: row.enrolment_id,
    responseCode: row.response_code,
    submittedAt: row.submitted_at,
    immediateReactionLabel: row.immediate_reaction_label || null,
    promiseClarityScore: toNumber(row.promise_clarity_score),
    worldClarityScore: toNumber(row.world_clarity_score),
    dramaticClarityScore: toNumber(row.dramatic_clarity_score),
    emotionalClarityScore: toNumber(row.emotional_clarity_score),
    feelEmotion: row.feel_emotion || null,
    carePersonnages: row.care_personnages || null,
    carePersonnagesOptions: toArray(row.care_personnages_options),
    continueDecroche: row.continue_decroche || null,
    continueDecrocheOptions: toArray(row.continue_decroche_options),
    aucunPersonnagePourLInstant: Boolean(row.aucun_personnage_pour_l_instant),
    risquePersonnagesPeuEngageants: Boolean(row.risque_personnages_peu_engageants),
  }));
}

function groupVerbatims(rows) {
  const rowsByCode = new Map();

  for (const row of rows) {
    const code = row.question_code;
    if (!rowsByCode.has(code)) {
      rowsByCode.set(code, []);
    }

    rowsByCode.get(code).push({
      id: row.verbatim_id,
      responseCode: row.response_code,
      text: row.verbatim,
      createdAt: row.created_at,
    });
  }

  return VERBATIM_GROUPS.map((group) => ({
    ...group,
    items: rowsByCode.get(group.key) || [],
  }));
}

function mapRoomExperience(rows) {
  return rows.map((row) => ({
    roomFeedbackId: row.room_feedback_id,
    responseCode: row.response_code,
    submittedAt: row.submitted_at,
    readingFluidityScore: toNumber(row.reading_fluidity_score),
    materialSufficiencyScore: toNumber(row.material_sufficiency_score),
    durationRelevanceScore: toNumber(row.duration_relevance_score),
    freeComment: row.free_comment || null,
  }));
}

async function getViewRows(table, campaignCode, order = "") {
  return toArray(
    await restRequest({
      schema: DASHBOARD_SCHEMA,
      table,
      query: `?campaign_code=eq.${encodeEq(campaignCode)}${order}`,
      method: "GET",
    })
  );
}

export async function getSignalV3DashboardData(campaignCode) {
  const normalizedCampaignCode = normalizeCampaignCode(campaignCode);

  if (!normalizedCampaignCode) {
    return {
      state: "missing_campaign",
      campaignCode: "",
      campaign: null,
      error: null,
    };
  }

  if (!hasSupabase()) {
    return {
      state: "error",
      campaignCode: normalizedCampaignCode,
      campaign: null,
      error: "Supabase n’est pas configuré côté serveur.",
    };
  }

  try {
    const campaignRecord = await selectOne(
      CAMPAIGN_SCHEMA,
      "campaigns",
      `?campagne_code=eq.${encodeEq(normalizedCampaignCode)}&limit=1`
    );

    if (!campaignRecord) {
      return {
        state: "missing_campaign",
        campaignCode: normalizedCampaignCode,
        campaign: null,
        error: null,
      };
    }

    const campaign = mapCampaign(campaignRecord);
    const isSignalV3Campaign =
      campaign.projectVersion === V3_PROJECT_VERSION && campaign.formVersion === V3_FORM_VERSION;

    if (!isSignalV3Campaign) {
      return {
        state: "wrong_version",
        campaignCode: normalizedCampaignCode,
        campaign,
        error: null,
      };
    }

    const [summaryRows, dimensionItems, diagnosticsRows, verbatimRows, roomRows] =
      await Promise.all([
        getViewRows("signal_v3_campaign_summary", normalizedCampaignCode, "&limit=1"),
        getViewRows(
          "signal_v3_dimension_items",
          normalizedCampaignCode,
          "&order=submitted_at.desc"
        ),
        getViewRows("signal_v3_diagnostics", normalizedCampaignCode, "&order=submitted_at.desc"),
        getViewRows("signal_v3_verbatims", normalizedCampaignCode, "&order=created_at.desc"),
        getViewRows("signal_v3_room_experience", normalizedCampaignCode, "&order=submitted_at.desc"),
      ]);

    const rawSummary = summaryRows[0] || null;
    const summary = mapSummary(rawSummary);
    const hasResponses = Boolean(summary?.sampleSize);

    return {
      state: hasResponses ? "ready" : "no_responses",
      campaignCode: normalizedCampaignCode,
      campaign: {
        ...campaign,
        name: summary?.campaignName || campaign.name,
        status: summary?.campaignStatus || campaign.status,
      },
      expectedVersion: {
        projectVersion: V3_PROJECT_VERSION,
        formVersion: V3_FORM_VERSION,
        scoringModelVersion: V3_SCORING_MODEL_VERSION,
      },
      summary,
      dimensionDetails: mapDimensionDetails(rawSummary, dimensionItems),
      diagnostics: mapDiagnostics(diagnosticsRows),
      verbatimGroups: groupVerbatims(verbatimRows),
      roomExperience: mapRoomExperience(roomRows),
      counts: {
        dimensionItems: dimensionItems.length,
        diagnostics: diagnosticsRows.length,
        verbatims: verbatimRows.length,
        roomExperience: roomRows.length,
      },
      error: null,
    };
  } catch (error) {
    return {
      state: "error",
      campaignCode: normalizedCampaignCode,
      campaign: null,
      error: error?.message || "Lecture dashboard SIGNAL V3 impossible.",
    };
  }
}
