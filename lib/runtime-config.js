const DEFAULT_TEST_ACCESS_CODE = "THEROOM01";

export function getTestAccessCode() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const configured = String(process.env.TEST_ACCESS_CODE || "").trim().toUpperCase();
  return configured || DEFAULT_TEST_ACCESS_CODE;
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function isDebugLoggingEnabled() {
  return !isProduction();
}
