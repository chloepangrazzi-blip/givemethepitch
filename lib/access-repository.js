import {
  createAccessRequest as createLocalAccessRequest,
  getAccessRequestByCode as getLocalAccessRequestByCode,
  markAccessVerified as markLocalAccessVerified,
  markNdaSigned as markLocalNdaSigned,
} from "./access-store";

const DEFAULT_PROJECT = {
  name: "Maree Noire",
  slug: "mareenoire",
  main_genre: "thriller",
  format: "series",
  status: "active",
  short_description: "Campaign default project for THE ROOM session 01.",
};

const DEFAULT_CAMPAIGN = {
  name: "Session 01",
  status: "active",
  campaign_type: "the_room_session_01",
  nda_version: "v1",
  notes: "Default THE ROOM testing campaign.",
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function splitFullName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

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

async function selectOne(schema, table, query) {
  const rows = await restRequest({ schema, table, query, method: "GET", prefer: "return=representation" });
  return rows?.[0] || null;
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
    // Non-blocking in V1: event logging must not break the user flow.
  }
}

async function ensureDefaultProject() {
  const existing = await selectOne(
    "catalog",
    "projects",
    `?slug=eq.${encodeURIComponent(DEFAULT_PROJECT.slug)}&limit=1`
  );

  if (existing) {
    return existing;
  }

  const rows = await restRequest({
    schema: "catalog",
    table: "projects",
    method: "POST",
    body: DEFAULT_PROJECT,
  });

  return rows[0];
}

async function ensureDefaultCampaign(projectId) {
  const existing = await selectOne(
    "ops",
    "campaigns",
    `?project_id=eq.${projectId}&campaign_type=eq.${encodeURIComponent(DEFAULT_CAMPAIGN.campaign_type)}&order=created_at.desc&limit=1`
  );

  if (existing) {
    return existing;
  }

  const rows = await restRequest({
    schema: "ops",
    table: "campaigns",
    method: "POST",
    body: {
      project_id: projectId,
      ...DEFAULT_CAMPAIGN,
    },
  });

  return rows[0];
}

async function upsertPanelProfile(contactId, panelProfile = {}) {
  const existing = await selectOne(
    "core",
    "panel_profiles",
    `?contact_id=eq.${contactId}&limit=1`
  );

  const profileBody = {
    contact_id: contactId,
    age_band: panelProfile.ageBand || null,
    gender: panelProfile.gender || null,
    viewing_frequency: panelProfile.viewingFrequency || null,
    platforms: panelProfile.platforms || [],
    liked_genres: panelProfile.likedGenres || [],
    main_genre: panelProfile.mainGenre || null,
    french_series_perception: panelProfile.frenchSeriesPerception || null,
    french_series_reason: panelProfile.frenchSeriesReason || null,
    recommendation_frequency: panelProfile.recommendationFrequency || null,
  };

  if (existing) {
    const rows = await restRequest({
      schema: "core",
      table: "panel_profiles",
      query: `?id=eq.${existing.id}`,
      method: "PATCH",
      body: profileBody,
    });
    return rows[0] || { ...existing, ...profileBody };
  }

  const rows = await restRequest({
    schema: "core",
    table: "panel_profiles",
    method: "POST",
    body: profileBody,
  });

  return rows[0];
}

async function upsertContact(payload) {
  const email = normalizeEmail(payload.email);
  const existing = await selectOne(
    "core",
    "contacts",
    `?email=eq.${encodeURIComponent(email)}&limit=1`
  );

  const { firstName, lastName } = splitFullName(payload.fullName);
  const contactBody = {
    contact_kind: "panelist",
    first_name: firstName,
    last_name: lastName,
    email,
    phone: String(payload.mobile || "").trim() || null,
    city: String(payload.city || "").trim() || null,
    country: String(payload.country || "France").trim() || null,
    consent_email: Boolean(payload.consent),
    consent_research: Boolean(payload.consent),
    status: "active",
  };

  if (existing) {
    const rows = await restRequest({
      schema: "core",
      table: "contacts",
      query: `?id=eq.${existing.id}`,
      method: "PATCH",
      body: contactBody,
    });
    return rows[0] || { ...existing, ...contactBody };
  }

  const rows = await restRequest({
    schema: "core",
    table: "contacts",
    method: "POST",
    body: contactBody,
  });

  const contact = rows[0];
  await createEvent({ contactId: contact.id, eventType: "contact_created", payload: { source: "the_room" } });
  return contact;
}

async function upsertEnrolment({ contactId, campaignId, accessCode }) {
  const existing = await selectOne(
    "ops",
    "enrolments",
    `?contact_id=eq.${contactId}&campaign_id=eq.${campaignId}&limit=1`
  );

  const enrolmentBody = {
    contact_id: contactId,
    campaign_id: campaignId,
    invited_at: new Date().toISOString(),
    access_granted: true,
    access_code: normalizeCode(accessCode),
    status: "access_granted",
  };

  if (existing) {
    const rows = await restRequest({
      schema: "ops",
      table: "enrolments",
      query: `?id=eq.${existing.id}`,
      method: "PATCH",
      body: enrolmentBody,
    });
    return rows[0] || { ...existing, ...enrolmentBody };
  }

  const rows = await restRequest({
    schema: "ops",
    table: "enrolments",
    method: "POST",
    body: enrolmentBody,
  });

  return rows[0];
}

async function getCampaignWithProjectByEnrolment(enrolment) {
  const campaign = await selectOne(
    "ops",
    "campaigns",
    `?id=eq.${enrolment.campaign_id}&limit=1`
  );

  if (!campaign) {
    return { campaign: null, project: null };
  }

  const project = await selectOne(
    "catalog",
    "projects",
    `?id=eq.${campaign.project_id}&limit=1`
  );

  return { campaign, project };
}

function mapLegacyRecord({ enrolment, contact, campaign, project }) {
  return {
    id: enrolment.id,
    accessCode: enrolment.access_code,
    email: contact?.email || null,
    createdAt: enrolment.created_at,
    verifiedAt: enrolment.started_at,
    ndaSignedAt: enrolment.nda_accepted_at,
    sessionSlug: project?.slug || "mareenoire",
    profile: {
      fullName: [contact?.first_name, contact?.last_name].filter(Boolean).join(" "),
      mobile: contact?.phone || "",
      city: contact?.city || "",
      country: contact?.country || "",
      consent: Boolean(contact?.consent_research),
    },
    answers: {},
    ndaIdentity: null,
    campaignId: campaign?.id || enrolment.campaign_id,
    contactId: contact?.id || enrolment.contact_id,
  };
}

export async function createAccessRequest(payload) {
  if (!hasSupabase()) {
    return createLocalAccessRequest(payload);
  }

  const project = await ensureDefaultProject();
  const campaign = await ensureDefaultCampaign(project.id);
  const contact = await upsertContact(payload);
  await upsertPanelProfile(contact.id, payload.panelProfile || {});

  const enrolment = await upsertEnrolment({
    contactId: contact.id,
    campaignId: campaign.id,
    accessCode: payload.accessCode,
  });

  await createEvent({
    contactId: contact.id,
    campaignId: campaign.id,
    enrolmentId: enrolment.id,
    eventType: "access_invited",
    payload: {
      source: "the_room",
      access_code: enrolment.access_code,
      qualification_answers: payload.answers || {},
    },
  });

  return mapLegacyRecord({ enrolment, contact, campaign, project });
}

export async function getAccessRequestByCode(accessCode) {
  if (!hasSupabase()) {
    return getLocalAccessRequestByCode(accessCode);
  }

  const enrolment = await selectOne(
    "ops",
    "enrolments",
    `?access_code=eq.${encodeURIComponent(normalizeCode(accessCode))}&limit=1`
  );

  if (!enrolment) {
    return null;
  }

  const contact = await selectOne(
    "core",
    "contacts",
    `?id=eq.${enrolment.contact_id}&limit=1`
  );

  const { campaign, project } = await getCampaignWithProjectByEnrolment(enrolment);
  return mapLegacyRecord({ enrolment, contact, campaign, project });
}

export async function markAccessVerified(accessCode) {
  if (!hasSupabase()) {
    return markLocalAccessVerified(accessCode);
  }

  const record = await getAccessRequestByCode(accessCode);
  if (!record) {
    return null;
  }

  const rows = await restRequest({
    schema: "ops",
    table: "enrolments",
    query: `?id=eq.${record.id}`,
    method: "PATCH",
    body: {
      started_at: record.verifiedAt || new Date().toISOString(),
      status: "started",
    },
  });

  await createEvent({
    contactId: record.contactId,
    campaignId: record.campaignId,
    enrolmentId: record.id,
    eventType: "access_verified",
    payload: { access_code: normalizeCode(accessCode) },
  });

  const updated = rows[0] || { id: record.id, ...record };
  return {
    ...record,
    id: updated.id,
    verifiedAt: updated.started_at || record.verifiedAt,
  };
}

export async function markNdaSigned(accessCode, identity) {
  if (!hasSupabase()) {
    return markLocalNdaSigned(accessCode, identity);
  }

  const record = await getAccessRequestByCode(accessCode);
  if (!record) {
    return null;
  }

  const acceptedAt = new Date().toISOString();
  const rows = await restRequest({
    schema: "ops",
    table: "enrolments",
    query: `?id=eq.${record.id}`,
    method: "PATCH",
    body: {
      nda_accepted: true,
      nda_accepted_at: acceptedAt,
      nda_version: "v1",
      status: "started",
    },
  });

  await createEvent({
    contactId: record.contactId,
    campaignId: record.campaignId,
    enrolmentId: record.id,
    eventType: "nda_signed",
    payload: {
      prenom: identity.prenom || "",
      nom: identity.nom || "",
      nda_version: "v1",
    },
  });

  const updated = rows[0] || { id: record.id };
  return {
    ...record,
    id: updated.id,
    ndaSignedAt: updated.nda_accepted_at || acceptedAt,
    ndaIdentity: {
      prenom: identity.prenom || "",
      nom: identity.nom || "",
    },
  };
}
