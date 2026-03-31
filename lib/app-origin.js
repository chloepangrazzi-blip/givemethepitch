function normalizeOrigin(value) {
  const origin = String(value || "").trim();
  if (!origin) {
    return "";
  }

  return origin.replace(/\/$/, "");
}

export function getAppOrigin(request) {
  const configuredOrigin = normalizeOrigin(
    process.env.APP_ORIGIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL
  );

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const requestOrigin = normalizeOrigin(
    request?.headers?.get("origin") || new URL(request.url).origin
  );

  return requestOrigin;
}
