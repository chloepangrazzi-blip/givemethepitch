import { generateAccessCode } from "./access-store";
import { PANEL_PUBLIC_KEYACCESS_PATH } from "./public-paths";
import { createEvent, hasSupabase, restRequest, selectOne } from "./supabase-client";

const DEFAULT_SESSION_SLUG = "mareenoire";
const DEFAULT_COUNTRY = "France";
const PANEL_SOURCE_DETAIL = "phase1_panel_recrute";

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
  nda_version: "v1",
  notes: "Default THE ROOM testing campaign.",
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeLaunchCode(value) {
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

function buildFullName(prenom, nom) {
  return [prenom, nom]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

async function getContactEnrolmentMetrics(contactId) {
  if (!contactId || !hasSupabase()) {
    return {
      totalCampaigns: 0,
      completedTests: 0,
      hasCompletedPath: false,
      hasReturned: false,
    };
  }

  const rows = await restRequest({
    schema: "ops",
    table: "enrolments",
    query: `?contact_id=eq.${contactId}&select=campaign_id,completed_at`,
    method: "GET",
  });

  const enrolments = Array.isArray(rows) ? rows : [];
  const completedTests = enrolments.filter((row) => row?.completed_at).length;

  return {
    totalCampaigns: enrolments.length,
    completedTests,
    hasCompletedPath: completedTests > 0,
    hasReturned: enrolments.length > 1 || completedTests > 1,
  };
}

export async function ensurePanelContactRole(contactId) {
  if (!contactId || !hasSupabase()) {
    return null;
  }

  try {
    const existing = await selectOne(
      "core",
      "contact_roles",
      `?contact_id=eq.${contactId}&role=eq.paneliste&limit=1`
    );

    if (existing?.actif) {
      return existing;
    }

    if (existing) {
      const rows = await restRequest({
        schema: "core",
        table: "contact_roles",
        query: `?id=eq.${existing.id}`,
        method: "PATCH",
        body: {
          actif: true,
          date_fin: null,
        },
      });

      return rows?.[0] || { ...existing, actif: true, date_fin: null };
    }

    const rows = await restRequest({
      schema: "core",
      table: "contact_roles",
      method: "POST",
      body: {
        contact_id: contactId,
        role: "paneliste",
        actif: true,
        date_debut: new Date().toISOString(),
      },
    });

    return rows?.[0] || null;
  } catch (error) {
    return null;
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
      cible_campagne: "paneliste",
      canal_principal: "contact_direct",
      ...DEFAULT_CAMPAIGN,
    },
  });

  return rows[0];
}

async function upsertLaunchContact({
  fullName,
  email,
  city = "",
  country = DEFAULT_COUNTRY,
  notes = "",
}) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await selectOne(
    "core",
    "contacts",
    `?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`
  );
  const { firstName, lastName } = splitFullName(fullName);

  const contactBody = {
    contact_kind:
      existing?.contact_kind && existing.contact_kind !== "other"
        ? existing.contact_kind
        : "panelist",
    first_name: firstName,
    last_name: lastName,
    email: normalizedEmail,
    city: String(city || "").trim() || existing?.city || null,
    country: String(country || "").trim() || existing?.country || DEFAULT_COUNTRY,
    origin_initiale: "contact_direct",
    source_detail: PANEL_SOURCE_DETAIL,
    notes_contact: String(notes || "").trim() || existing?.notes_contact || null,
    consent_email: existing?.consent_email || false,
    consent_research: existing?.consent_research || false,
    status: existing?.status || "active",
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
    payload: { source: "launch_panel" },
  });

  return contact;
}

async function ensureLaunchEnrolment({ contactId, campaignId, accessCode }) {
  const existing = await selectOne(
    "ops",
    "enrolments",
    `?contact_id=eq.${contactId}&campaign_id=eq.${campaignId}&limit=1`
  );

  const nextAccessCode = String(existing?.access_code || accessCode || generateAccessCode())
    .trim()
    .toUpperCase();
  const now = new Date().toISOString();
  const enrolmentBody = {
    contact_id: contactId,
    campaign_id: campaignId,
    invited_at: existing?.invited_at || now,
    access_granted: true,
    access_code: nextAccessCode,
    canal_entree: "contact_direct",
    status: existing?.completed_at ? existing.status : "access_granted",
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

async function upsertContactEngagementStatus(contactId, patch = {}) {
  const metrics = await getContactEnrolmentMetrics(contactId);
  const existing = await selectOne(
    "ops",
    "contact_engagement_status",
    `?contact_id=eq.${contactId}&limit=1`
  );

  const derivedMetrics = {
    parcours_complet: metrics.hasCompletedPath,
    est_revenu: metrics.hasReturned,
    nombre_campagnes: metrics.totalCampaigns,
    nombre_tests: metrics.completedTests,
  };

  const body = existing
    ? {
        ...derivedMetrics,
        ...patch,
      }
    : {
        contact_id: contactId,
        statut_engagement: "passif",
        parcours_complet: false,
        est_revenu: false,
        nombre_campagnes: 0,
        nombre_tests: 0,
        nombre_abandons: 0,
        nombre_absences: 0,
        absences_consecutives: 0,
        a_relancer: false,
        blackliste: false,
        notes: null,
        ...derivedMetrics,
        ...patch,
      };

  if (existing) {
    const rows = await restRequest({
      schema: "ops",
      table: "contact_engagement_status",
      query: `?id=eq.${existing.id}`,
      method: "PATCH",
      body,
    });

    return rows?.[0] || { ...existing, ...body };
  }

  const rows = await restRequest({
    schema: "ops",
    table: "contact_engagement_status",
    method: "POST",
    body,
  });

  return rows?.[0] || body;
}

async function createLaunchOperation({ contact, fullName, email, city = "", country = DEFAULT_COUNTRY, notes = "" }) {
  const rows = await restRequest({
    schema: "ops",
    table: "launch_operations",
    method: "POST",
    body: {
      contact_id: contact.id,
      cible_role: "paneliste",
      nom_snapshot: fullName,
      email_snapshot: normalizeEmail(email),
      statut_operation: "a_envoyer",
      notes: String(notes || "").trim() || null,
    },
  });

  return rows[0];
}

async function patchLaunchOperation(record, patch) {
  const rows = await restRequest({
    schema: "ops",
    table: "launch_operations",
    query: `?id=eq.${record.id}`,
    method: "PATCH",
    body: patch,
  });

  return rows?.[0] || { ...record, ...patch };
}

async function getLatestPanelLaunchByContactId(contactId) {
  if (!contactId || !hasSupabase()) {
    return null;
  }

  const operation = await selectOne(
    "ops",
    "launch_operations",
    `?contact_id=eq.${contactId}&cible_role=eq.paneliste&order=created_at.desc&limit=1`
  );

  if (!operation) {
    return null;
  }

  return {
    id: operation.id,
    operationCode: operation.operation_lancement_code,
    contactId: operation.contact_id,
    email: operation.email_snapshot || null,
    fullName: operation.nom_snapshot || null,
    status: operation.statut_operation,
    sentAt: operation.envoye_le,
    clickedAt: operation.clique_le,
    keyActivatedAt: operation.cle_activee_le,
    formStartedAt: operation.formulaire_commence_le,
    formCompletedAt: operation.formulaire_termine_le,
    reminderCount: Number(operation.nombre_relances || 0),
    reminderLastSentAt: operation.derniere_relance_le,
    reminderPending: Boolean(operation.relance_a_faire),
  };
}

async function getContactById(contactId) {
  if (!contactId) {
    return null;
  }

  return selectOne("core", "contacts", `?id=eq.${contactId}&limit=1`);
}

async function getContactByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !hasSupabase()) {
    return null;
  }

  return selectOne(
    "core",
    "contacts",
    `?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`
  );
}

async function getContactEngagementStatus(contactId) {
  if (!contactId || !hasSupabase()) {
    return null;
  }

  return selectOne("ops", "contact_engagement_status", `?contact_id=eq.${contactId}&limit=1`);
}

async function getLatestPanelEnrolmentByContactId(contactId) {
  if (!contactId || !hasSupabase()) {
    return null;
  }

  return selectOne(
    "ops",
    "enrolments",
    `?contact_id=eq.${contactId}&order=created_at.desc&limit=1`
  );
}

export async function getPanelLaunchRecipientStateByEmail(email) {
  if (!hasSupabase()) {
    return {
      contactId: null,
      latestLaunch: null,
      latestEnrolment: null,
      alreadySent: false,
      alreadyCompleted: false,
    };
  }

  const contact = await getContactByEmail(email);
  if (!contact?.id) {
    return {
      contactId: null,
      latestLaunch: null,
      latestEnrolment: null,
      alreadySent: false,
      alreadyCompleted: false,
    };
  }

  const [latestLaunch, latestEnrolment] = await Promise.all([
    getLatestPanelLaunchByContactId(contact.id),
    getLatestPanelEnrolmentByContactId(contact.id),
  ]);

  return {
    contactId: contact.id,
    latestLaunch,
    latestEnrolment,
    alreadySent: Boolean(latestLaunch?.sentAt),
    alreadyCompleted: Boolean(latestEnrolment?.completed_at),
  };
}

export function buildPanelLaunchUrl(origin, { operationCode, accessCode }) {
  const base = String(origin || "").replace(/\/$/, "");
  const params = new URLSearchParams();

  if (operationCode) {
    params.set("invite", String(operationCode).trim().toUpperCase());
  }

  if (accessCode) {
    params.set("code", String(accessCode).trim().toUpperCase());
  }

  const query = params.toString();
  return `${base}/theroom${query ? `?${query}` : ""}`;
}

export function buildPanelKeyAccessUrl(origin, { accessCode }) {
  const base = String(origin || "").replace(/\/$/, "");
  const params = new URLSearchParams();

  if (accessCode) {
    params.set("code", String(accessCode).trim().toUpperCase());
  }

  const query = params.toString();
  return `${base}${PANEL_PUBLIC_KEYACCESS_PATH}${query ? `?${query}` : ""}`;
}

export function buildPanelVoteUrl(origin, { operationCode, projectId }) {
  const base = String(origin || "").replace(/\/$/, "");
  const params = new URLSearchParams();

  if (operationCode) {
    params.set("invite", String(operationCode).trim().toUpperCase());
  }

  if (projectId) {
    params.set("project", String(projectId).trim());
  }

  return `${base}/api/panel/launch/vote?${params.toString()}`;
}

export function buildPanelUnsubscribeUrl(origin, { operationCode }) {
  const base = String(origin || "").replace(/\/$/, "");
  const params = new URLSearchParams();

  if (operationCode) {
    params.set("invite", String(operationCode).trim().toUpperCase());
  }

  return `${base}/api/panel/launch/unsubscribe?${params.toString()}`;
}

export async function createPanelLaunchInvitation({
  fullName,
  email,
  city = "",
  country = DEFAULT_COUNTRY,
  notes = "",
}) {
  if (!hasSupabase()) {
    throw new Error("launch_requires_supabase");
  }

  const project = await ensureDefaultProject();
  const campaign = await ensureDefaultCampaign(project.id);
  const contact = await upsertLaunchContact({ fullName, email, city, country, notes });
  const enrolment = await ensureLaunchEnrolment({
    contactId: contact.id,
    campaignId: campaign.id,
    accessCode: generateAccessCode(),
  });
  const operation = await createLaunchOperation({
    contact,
    fullName,
    email,
    city,
    country,
    notes,
  });

  await upsertContactEngagementStatus(contact.id, {
    statut_engagement: "passif",
    derniere_action: "invitation_preparee",
    date_derniere_action: new Date().toISOString(),
    a_relancer: false,
  });

  return {
    operationId: operation.id,
    operationCode: operation.operation_lancement_code,
    accessCode: enrolment.access_code,
    contactId: contact.id,
    fullName,
    email: normalizeEmail(email),
    sessionSlug: project.slug || DEFAULT_SESSION_SLUG,
  };
}

export async function getPublicPanelProcheInvitees() {
  if (!hasSupabase()) {
    return [];
  }

  const rows = await restRequest({
    schema: "public",
    table: "panel_proche",
    query: "?select=prenom,nom,email,created_at&order=created_at.asc",
    method: "GET",
  });

  const seenEmails = new Set();

  return rows
    .map((row) => {
      const email = normalizeEmail(row?.email);
      if (!email || seenEmails.has(email)) {
        return null;
      }

      seenEmails.add(email);

      return {
        fullName: buildFullName(row?.prenom, row?.nom),
        email,
        city: "",
        country: DEFAULT_COUNTRY,
        notes: `panel_proche_import${row?.created_at ? `:${row.created_at}` : ""}`,
      };
    })
    .filter(Boolean)
    .filter((item) => item.fullName);
}

export async function getPanelLaunchByCode(launchCode) {
  if (!hasSupabase()) {
    return null;
  }

  const normalizedCode = normalizeLaunchCode(launchCode);
  if (!normalizedCode) {
    return null;
  }

  const operation = await selectOne(
    "ops",
    "launch_operations",
    `?operation_lancement_code=eq.${encodeURIComponent(normalizedCode)}&limit=1`
  );

  if (!operation) {
    return null;
  }

  const contact = await getContactById(operation.contact_id);

  return {
    id: operation.id,
    operationCode: operation.operation_lancement_code,
    contactId: operation.contact_id,
    email: contact?.email || operation.email_snapshot || null,
    fullName:
      [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") ||
      operation.nom_snapshot ||
      null,
    status: operation.statut_operation,
    sentAt: operation.envoye_le,
    clickedAt: operation.clique_le,
    keyActivatedAt: operation.cle_activee_le,
    formStartedAt: operation.formulaire_commence_le,
    formCompletedAt: operation.formulaire_termine_le,
    reminderCount: Number(operation.nombre_relances || 0),
    reminderLastSentAt: operation.derniere_relance_le,
    reminderPending: Boolean(operation.relance_a_faire),
  };
}

export async function upsertPanelContactEngagementStatus(contactId, patch = {}) {
  if (!contactId || !hasSupabase()) {
    return null;
  }

  return upsertContactEngagementStatus(contactId, patch);
}

export async function isPanelLaunchEmailSuppressed(contactId) {
  if (!contactId || !hasSupabase()) {
    return false;
  }

  const status = await getContactEngagementStatus(contactId);
  return Boolean(status?.blackliste);
}

export async function getPanelLaunchMailPayload(launchCode) {
  const launchRecord = await getPanelLaunchByCode(launchCode);
  if (!launchRecord) {
    return null;
  }

  const contact = await getContactById(launchRecord.contactId);
  const enrolment = await getLatestPanelEnrolmentByContactId(launchRecord.contactId);

  return {
    operationCode: launchRecord.operationCode,
    contactId: launchRecord.contactId,
    fullName: launchRecord.fullName || [contact?.first_name, contact?.last_name].filter(Boolean).join(" "),
    email: launchRecord.email || contact?.email || null,
    accessCode: enrolment?.access_code || null,
    campaignId: enrolment?.campaign_id || null,
    verifiedAt: enrolment?.started_at || null,
    ndaSignedAt: enrolment?.nda_accepted_at || null,
    launchStatus: launchRecord.status,
    keyActivatedAt: launchRecord.keyActivatedAt || null,
    formStartedAt: launchRecord.formStartedAt || null,
    formCompletedAt: launchRecord.formCompletedAt || null,
    reminderCount: launchRecord.reminderCount,
  };
}

export async function getPanelCampaignVote({ contactId, campaignId }) {
  if (!contactId || !campaignId || !hasSupabase()) {
    return null;
  }

  return selectOne(
    "ops",
    "events",
    `?contact_id=eq.${contactId}&campaign_id=eq.${campaignId}&event_type=eq.panel_campaign_vote&order=created_at.desc&limit=1`
  );
}

export async function recordPanelCampaignVote({ launchCode, projectId }) {
  const launch = await getPanelLaunchMailPayload(launchCode);

  if (!launch?.contactId || !launch?.campaignId) {
    return { ok: false, reason: "missing_launch_context" };
  }

  const existingVote = await getPanelCampaignVote({
    contactId: launch.contactId,
    campaignId: launch.campaignId,
  });

  if (existingVote) {
    return {
      ok: true,
      status: "already_voted",
      existingProjectId: existingVote?.payload?.project_id || null,
      launch,
    };
  }

  const rows = await restRequest({
    schema: "ops",
    table: "events",
    method: "POST",
    body: {
      contact_id: launch.contactId,
      campaign_id: launch.campaignId,
      event_type: "panel_campaign_vote",
      payload: {
        operation_code: launch.operationCode,
        project_id: projectId,
      },
    },
  });

  return {
    ok: true,
    status: "recorded",
    voteEventId: rows?.[0]?.id || null,
    launch,
  };
}

export async function markPanelLaunchSent(launchCode) {
  const record = await getPanelLaunchByCode(launchCode);
  if (!record) {
    return null;
  }

  const sentAt = record.sentAt || new Date().toISOString();
  const updated = await patchLaunchOperation(record, {
    envoye_le: sentAt,
    statut_operation: record.formCompletedAt ? "inscription_terminee" : "envoyee",
  });

  await upsertContactEngagementStatus(record.contactId, {
    statut_engagement: "passif",
    derniere_action: "invitation_envoyee",
    date_derniere_action: sentAt,
    a_relancer: false,
  });

  await createEvent({
    contactId: record.contactId,
    eventType: "panel_launch_sent",
    payload: { operation_code: record.operationCode },
  });

  return updated;
}

export async function markPanelLaunchClicked(launchCode) {
  const record = await getPanelLaunchByCode(launchCode);
  if (!record) {
    return null;
  }

  if (record.clickedAt || record.formCompletedAt) {
    return record;
  }

  const clickedAt = new Date().toISOString();
  const updated = await patchLaunchOperation(record, {
    clique_le: clickedAt,
    statut_operation: record.formStartedAt ? "formulaire_commence" : "cliquee",
  });

  await upsertContactEngagementStatus(record.contactId, {
    statut_engagement: "actif",
    derniere_action: "invitation_cliquee",
    date_derniere_action: clickedAt,
    a_relancer: false,
  });

  await createEvent({
    contactId: record.contactId,
    eventType: "panel_launch_clicked",
    payload: { operation_code: record.operationCode },
  });

  return updated;
}

export async function markPanelLaunchFormStarted(launchCode) {
  const record = await getPanelLaunchByCode(launchCode);
  if (!record) {
    return null;
  }

  if (record.formStartedAt || record.formCompletedAt) {
    return record;
  }

  const startedAt = new Date().toISOString();
  const updated = await patchLaunchOperation(record, {
    formulaire_commence_le: startedAt,
    statut_operation: "formulaire_commence",
  });

  await upsertContactEngagementStatus(record.contactId, {
    statut_engagement: "actif",
    derniere_action: "formulaire_commence",
    date_derniere_action: startedAt,
    a_relancer: false,
  });

  await createEvent({
    contactId: record.contactId,
    eventType: "panel_form_started",
    payload: { operation_code: record.operationCode },
  });

  return updated;
}

export async function markPanelLaunchCompleted(launchCode) {
  const record = await getPanelLaunchByCode(launchCode);
  if (!record) {
    return null;
  }

  if (record.formCompletedAt) {
    return record;
  }

  const completedAt = new Date().toISOString();
  const updated = await patchLaunchOperation(record, {
    formulaire_termine_le: completedAt,
    statut_operation: "inscription_terminee",
  });

  await upsertContactEngagementStatus(record.contactId, {
    statut_engagement: "actif",
    derniere_action: "inscription_terminee",
    date_derniere_action: completedAt,
    a_relancer: false,
  });

  await createEvent({
    contactId: record.contactId,
    eventType: "panel_launch_completed",
    payload: { operation_code: record.operationCode },
  });

  return updated;
}

export async function markPanelLaunchKeyActivatedByContact(contactId, activatedAt = new Date().toISOString()) {
  const record = await getLatestPanelLaunchByContactId(contactId);
  if (!record) {
    return null;
  }

  const nextActivatedAt = record.keyActivatedAt || activatedAt;
  const status = record.formCompletedAt ? "inscription_terminee" : "cle_activee";

  const updated = await patchLaunchOperation(record, {
    cle_activee_le: nextActivatedAt,
    statut_operation: status,
  });

  await upsertContactEngagementStatus(record.contactId, {
    statut_engagement: "actif",
    derniere_action: "cle_verifiee",
    date_derniere_action: nextActivatedAt,
    a_relancer: false,
  });

  return updated;
}

export async function markPanelLaunchReminderSent(launchCode, remindedAt = new Date().toISOString()) {
  const record = await getPanelLaunchByCode(launchCode);
  if (!record) {
    return null;
  }

  const updated = await patchLaunchOperation(record, {
    nombre_relances: record.reminderCount + 1,
    derniere_relance_le: remindedAt,
    relance_a_faire: false,
    statut_operation: record.status || (record.sentAt ? "envoyee" : "a_envoyer"),
  });

  await createEvent({
    contactId: record.contactId,
    eventType: "panel_launch_reminder_sent",
    payload: { operation_code: record.operationCode },
  });

  return updated;
}

export async function unsubscribePanelLaunchByCode(launchCode) {
  if (!hasSupabase()) {
    return { ok: false, reason: "launch_requires_supabase" };
  }

  const record = await getPanelLaunchByCode(launchCode);
  if (!record) {
    return { ok: false, reason: "missing_launch" };
  }

  const unsubscribedAt = new Date().toISOString();

  await patchLaunchOperation(record, {
    relance_a_faire: false,
  });

  await upsertContactEngagementStatus(record.contactId, {
    blackliste: true,
    a_relancer: false,
    derniere_action: "email_unsubscribed",
    date_derniere_action: unsubscribedAt,
  });

  await createEvent({
    contactId: record.contactId,
    eventType: "panel_email_unsubscribed",
    payload: { operation_code: record.operationCode },
  });

  return {
    ok: true,
    operationCode: record.operationCode,
    contactId: record.contactId,
    email: record.email || null,
    unsubscribedAt,
  };
}
