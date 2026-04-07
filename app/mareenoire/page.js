export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import MareeNoirePageClient from "../../components/mareenoire/MareeNoirePageClient";
import { getAccessRequestByCode } from "../../lib/access-repository";
import { getMareeNoirePageData } from "../../lib/mareenoire-page";

export function generateMetadata() {
  const page = getMareeNoirePageData();

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

async function resolveAccessGate() {
  const cookieStore = await cookies();
  const accessCode = String(cookieStore.get("gmtp_access_code")?.value || "")
    .trim()
    .toUpperCase();

  if (!accessCode) {
    return "/theroom";
  }

  const record = await getAccessRequestByCode(accessCode);

  if (!record) {
    return "/theroom";
  }

  if (!record.verifiedAt) {
    return "/theroom";
  }

  if (!record.ndaSignedAt) {
    return "/nda";
  }

  return null;
}

export default async function MareeNoirePage() {
  const gateRedirect = await resolveAccessGate();

  if (gateRedirect) {
    redirect(gateRedirect);
  }

  const page = getMareeNoirePageData();

  if (!page) {
    notFound();
  }

  return <MareeNoirePageClient page={page} />;
}
