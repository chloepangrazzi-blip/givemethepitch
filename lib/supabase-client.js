export function getSupabaseUrl() {
  return process.env.SUPABASE_URL || "";
}

export function getSupabaseServiceKey() {
  // Prefer the legacy service_role key when both are present so a stale
  // secret key does not mask a valid server key during migrations.
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
}

export function hasSupabase() {
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

export async function restRequest({ schema, table, query = "", method = "GET", body, prefer }) {
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

export async function selectOne(schema, table, query) {
  const rows = await restRequest({
    schema,
    table,
    query,
    method: "GET",
    prefer: "return=representation",
  });

  return rows?.[0] || null;
}

export async function createEvent({
  contactId = null,
  campaignId = null,
  enrolmentId = null,
  eventType,
  payload = {},
}) {
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
