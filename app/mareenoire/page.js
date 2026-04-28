export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import MareeNoirePageClient from "../../components/mareenoire/MareeNoirePageClient";
import { isCampaignActiveStatus } from "../../lib/campaign-access";
import { getMareeNoirePageData } from "../../lib/mareenoire-page";
import { getCurrentPanelAccessRecord } from "../../lib/panel-session-server";

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
  const record = await getCurrentPanelAccessRecord();

  if (!record) {
    return { redirectPath: "/theroom", sessionClosed: false };
  }

  if (!isCampaignActiveStatus(record.campaignStatus)) {
    if (record.verifiedAt && record.ndaSignedAt) {
      return { redirectPath: null, sessionClosed: true };
    }

    return { redirectPath: "/theroom", sessionClosed: true };
  }

  if (!record.verifiedAt) {
    return { redirectPath: "/theroom", sessionClosed: false };
  }

  if (!record.ndaSignedAt) {
    return { redirectPath: "/nda", sessionClosed: false };
  }

  return { redirectPath: null, sessionClosed: false };
}

export default async function MareeNoirePage() {
  const gate = await resolveAccessGate();

  if (gate.redirectPath) {
    redirect(gate.redirectPath);
  }

  const page = getMareeNoirePageData();

  if (!page) {
    notFound();
  }

  return <MareeNoirePageClient page={page} sessionClosed={gate.sessionClosed} />;
}
