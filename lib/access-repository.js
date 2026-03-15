import {
  createAccessRequest as createLocalAccessRequest,
  getAccessRequestByCode as getLocalAccessRequestByCode,
  markAccessVerified as markLocalAccessVerified,
  markNdaSigned as markLocalNdaSigned,
} from "./access-store";

const TABLE = "room_access_requests";

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseBaseUrl() {
  return `${process.env.SUPABASE_URL}/rest/v1/${TABLE}`;
}

function getSupabaseHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function supabaseRequest(path = "", init = {}) {
  const response = await fetch(`${getSupabaseBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getSupabaseHeaders(),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase error ${response.status}: ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function createAccessRequest(payload) {
  if (!hasSupabase()) {
    return createLocalAccessRequest(payload);
  }

  const accessCode = payload.accessCode;
  const body = {
    access_code: accessCode,
    email: String(payload.email || "").trim().toLowerCase(),
    created_at: new Date().toISOString(),
    verified_at: null,
    nda_signed_at: null,
    session_slug: "mareenoire",
    profile: {
      fullName: payload.fullName || "",
      mobile: payload.mobile || "",
      city: payload.city || "",
      consent: Boolean(payload.consent),
    },
    answers: payload.answers || {},
  };

  const [record] = await supabaseRequest("", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    id: record.id,
    accessCode: record.access_code,
    email: record.email,
    createdAt: record.created_at,
    verifiedAt: record.verified_at,
    ndaSignedAt: record.nda_signed_at,
    sessionSlug: record.session_slug,
    profile: record.profile || {},
    answers: record.answers || {},
    ndaIdentity: record.nda_identity || null,
  };
}

export async function getAccessRequestByCode(accessCode) {
  if (!hasSupabase()) {
    return getLocalAccessRequestByCode(accessCode);
  }

  const code = String(accessCode || "").trim().toUpperCase();
  const rows = await supabaseRequest(`?access_code=eq.${encodeURIComponent(code)}&limit=1`);
  const record = rows[0];

  if (!record) {
    return null;
  }

  return {
    id: record.id,
    accessCode: record.access_code,
    email: record.email,
    createdAt: record.created_at,
    verifiedAt: record.verified_at,
    ndaSignedAt: record.nda_signed_at,
    sessionSlug: record.session_slug,
    profile: record.profile || {},
    answers: record.answers || {},
    ndaIdentity: record.nda_identity || null,
  };
}

export async function markAccessVerified(accessCode) {
  if (!hasSupabase()) {
    return markLocalAccessVerified(accessCode);
  }

  const code = String(accessCode || "").trim().toUpperCase();
  const [record] = await supabaseRequest(`?access_code=eq.${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: JSON.stringify({
      verified_at: new Date().toISOString(),
    }),
  });

  if (!record) {
    return null;
  }

  return {
    id: record.id,
    accessCode: record.access_code,
    email: record.email,
    createdAt: record.created_at,
    verifiedAt: record.verified_at,
    ndaSignedAt: record.nda_signed_at,
    sessionSlug: record.session_slug,
    profile: record.profile || {},
    answers: record.answers || {},
    ndaIdentity: record.nda_identity || null,
  };
}

export async function markNdaSigned(accessCode, identity) {
  if (!hasSupabase()) {
    return markLocalNdaSigned(accessCode, identity);
  }

  const code = String(accessCode || "").trim().toUpperCase();
  const [record] = await supabaseRequest(`?access_code=eq.${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: JSON.stringify({
      nda_signed_at: new Date().toISOString(),
      nda_identity: {
        prenom: identity.prenom || "",
        nom: identity.nom || "",
      },
    }),
  });

  if (!record) {
    return null;
  }

  return {
    id: record.id,
    accessCode: record.access_code,
    email: record.email,
    createdAt: record.created_at,
    verifiedAt: record.verified_at,
    ndaSignedAt: record.nda_signed_at,
    sessionSlug: record.session_slug,
    profile: record.profile || {},
    answers: record.answers || {},
    ndaIdentity: record.nda_identity || null,
  };
}
