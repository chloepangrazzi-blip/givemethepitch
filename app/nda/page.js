import SignalSessionClosedPage from "../../components/shared/SignalSessionClosedPage";
import { isCampaignActiveStatus } from "../../lib/campaign-access";
import { getCurrentPanelAccessRecord } from "../../lib/panel-session-server";
import { notFound } from "next/navigation";
import NdaPageClient from "../../components/nda/NdaPageClient";
import { getNdaPageData } from "../../lib/nda-page";
import { PANEL_PUBLIC_CATALOGUE_PATH } from "../../lib/public-paths";

export function generateMetadata() {
  const page = getNdaPageData();

  if (!page) {
    return {};
  }

  return {
    title: page.title || "NDA | Give Me The Pitch",
  };
}

export default async function NdaPage() {
  const page = getNdaPageData();
  const accessRecord = await getCurrentPanelAccessRecord();

  if (!page) {
    notFound();
  }

  if (!accessRecord || !isCampaignActiveStatus(accessRecord.campaignStatus)) {
    return <SignalSessionClosedPage />;
  }

  return <NdaPageClient {...page} nextPathOverride={PANEL_PUBLIC_CATALOGUE_PATH} />;
}
