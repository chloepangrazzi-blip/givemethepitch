import {
  createAccessRequest as createLocalAccessRequest,
  getAccessRequestByCode as getLocalAccessRequestByCode,
  markAccessVerified as markLocalAccessVerified,
  markNdaSigned as markLocalNdaSigned,
} from "./access-store";
import { createEvent, hasSupabase, restRequest, selectOne } from "./supabase-client";
import { getTestAccessCode } from "./runtime-config";
import {
  ensurePanelContactRole,
  markPanelLaunchKeyActivatedByContact,
  upsertPanelContactEngagementStatus,
} from "./panel-launch";

const DEFAULT_SESSION_SLUG = "mareenoire";
const DEFAULT_COUNTRY = "France";
const DEFAULT_NDA_VERSION = "v1";

const DEFAULT_PROJECT = {
  name: "Maree Noire",
  slug: DEFAULT_SESSION_SLUG,
  main_genre: "thriller",
  format: null,
  format_editorial: process.env.DEFAULT_PROJECT_EDITORIAL_FORMAT || null,
  status: "active",
  short_description: "Campaign default project for THE ROOM session 01.",
};

const DEFAULT_CAMPAIGN = {
  name: "Session 01",
  status: "active",
  campaign_type: "scoring",
  nda_version: DEFAULT_NDA_VERSION,
  notes: "Default THE ROOM testing campaign.",
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function splitFullName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
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
    `?project_id=eq.${projectId}&campaign_type=eq.${encodeURIComponent(
      DEFAULT_CAMPAIGN.campaign_type
    )}&order=created_at.desc&limit=1`
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
    country: String(payload.country || DEFAULT_COUNTRY).trim() || null,
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

    const contact = rows[0] || { ...existing, ...contactBody };
    await ensurePanelContactRole(contact.id);
    return contact;
  }

  const rows = await restRequest({
    schema: "core",
    table: "contacts",
    method: "POST",
    body: contactBody,
  });

  const contact = rows[0];
  await ensurePanelContactRole(contact.id);

  await createEvent({
    contactId: contact.id,
    eventType: "contact_created",
    payload: { source: "the_room" },
  });

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

  if (!campaign.project_id) {
    return { campaign, project: null };
  }

  const project = await selectOne(
    "catalog",
    "projects",
    `?id=eq.${campaign.project_id}&limit=1`
  );

  return { campaign, project };
}

function mapEnrolmentRecord({ enrolment, contact, campaign, project }) {
  return {
    id: enrolment.id,
    accessCode: enrolment.access_code,
    email: contact?.email || null,
    createdAt: enrolment.created_at,
    verifiedAt: enrolment.started_at,
    ndaSignedAt: enrolment.nda_accepted_at,
    sessionSlug: project?.slug || DEFAULT_SESSION_SLUG,
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

export async function ensureTestAccessRequest(accessCode = getTestAccessCode()) {
  const normalizedCode = normalizeCode(accessCode);

  if (!normalizedCode) {
    throw new Error("test_access_disabled");
  }

  const existing = await getAccessRequestByCode(normalizedCode);
  if (existing) {
    return existing;
  }

  return createAccessRequest({
    accessCode: normalizedCode,
    fullName: "Test Access",
    email: "test-access@givemethepitch.local",
    mobile: "0600000000",
    city: "Paris",
    country: DEFAULT_COUNTRY,
    consent: true,
    answers: { source: "test_access" },
    panelProfile: {
      ageBand: "25-34",
      viewingFrequency: "Souvent",
      platforms: ["Netflix"],
      likedGenres: ["Polar"],
      mainGenre: "Polar",
      frenchSeriesPerception: "Positive",
      frenchSeriesReason: "Test access",
      recommendationFrequency: "Souvent",
    },
  });
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

  return mapEnrolmentRecord({ enrolment, contact, campaign, project });
}

export async function getAccessRequestByCode(accessCode) {
  if (!hasSupabase()) {
    return getLocalAccessRequestByCode(accessCode);
  }

  const normalizedCode = normalizeCode(accessCode);
  if (!normalizedCode) {
    return null;
  }

  const enrolment = await selectOne(
    "ops",
    "enrolments",
    `?access_code=eq.${encodeURIComponent(normalizedCode)}&limit=1`
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
  return mapEnrolmentRecord({ enrolment, contact, campaign, project });
}

export async function markAccessVerified(accessCode) {
  if (!hasSupabase()) {
    return markLocalAccessVerified(accessCode);
  }

  const record = await getAccessRequestByCode(accessCode);
  if (!record) {
    return null;
  }

  const verifiedAt = record.verifiedAt || new Date().toISOString();
  const rows = await restRequest({
    schema: "ops",
    table: "enrolments",
    query: `?id=eq.${record.id}`,
    method: "PATCH",
    body: {
      started_at: verifiedAt,
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

  const updated = rows[0] || { id: record.id };

  await markPanelLaunchKeyActivatedByContact(record.contactId, verifiedAt);

  return {
    ...record,
    id: updated.id,
    verifiedAt: updated.started_at || verifiedAt,
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
  const ndaIdentity = {
    prenom: identity?.prenom || "",
    nom: identity?.nom || "",
  };

  const rows = await restRequest({
    schema: "ops",
    table: "enrolments",
    query: `?id=eq.${record.id}`,
    method: "PATCH",
    body: {
      nda_accepted: true,
      nda_accepted_at: acceptedAt,
      nda_version: DEFAULT_NDA_VERSION,
      status: "nda_signed",
    },
  });

  await createEvent({
    contactId: record.contactId,
    campaignId: record.campaignId,
    enrolmentId: record.id,
    eventType: "nda_signed",
    payload: {
      ...ndaIdentity,
      nda_version: DEFAULT_NDA_VERSION,
    },
  });

  await upsertPanelContactEngagementStatus(record.contactId, {
    statut_engagement: "actif",
    derniere_action: "nda_signee",
    date_derniere_action: acceptedAt,
    a_relancer: false,
  });

  const updated = rows[0] || { id: record.id };
  return {
    ...record,
    id: updated.id,
    ndaSignedAt: updated.nda_accepted_at || acceptedAt,
    ndaIdentity,
  };
}
