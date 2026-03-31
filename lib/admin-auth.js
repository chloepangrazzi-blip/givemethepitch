import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "gmtp_admin_session";
const ADMIN_COOKIE_SCOPE = "gmtp-admin";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.GMTP_ADMIN_PASSWORD || "";
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

function buildDigest() {
  return createHmac("sha256", getAdminPassword()).update(ADMIN_COOKIE_SCOPE).digest("hex");
}

export function createAdminSessionToken() {
  return `v1.${buildDigest()}`;
}

export function isValidAdminSession(token) {
  if (!isAdminConfigured() || !token) {
    return false;
  }

  const expected = createAdminSessionToken();
  const actualBuffer = Buffer.from(String(token));
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
