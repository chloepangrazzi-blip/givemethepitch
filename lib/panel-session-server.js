import { cookies } from "next/headers";
import { getAccessRequestByCode } from "./access-repository";

export async function getCurrentPanelAccessCode() {
  const cookieStore = await cookies();

  return String(cookieStore.get("gmtp_access_code")?.value || "")
    .trim()
    .toUpperCase();
}

export async function getCurrentPanelAccessRecord() {
  const accessCode = await getCurrentPanelAccessCode();

  if (!accessCode) {
    return null;
  }

  return getAccessRequestByCode(accessCode);
}

