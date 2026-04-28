import SignalSessionClosedPage from "../../components/shared/SignalSessionClosedPage";
import { isCampaignActiveStatus } from "../../lib/campaign-access";
import { getCurrentPanelAccessRecord } from "../../lib/panel-session-server";
import { notFound } from "next/navigation";
import FormtestPageClient from "../../components/formtest/FormtestPageClient";
import { getFormtestPageData } from "../../lib/formtest-page";

export function generateMetadata() {
  const page = getFormtestPageData();

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

export default async function FormtestPage({ searchParams }) {
  const page = getFormtestPageData();
  const accessRecord = await getCurrentPanelAccessRecord();

  if (!page) {
    notFound();
  }

  if (!accessRecord || !isCampaignActiveStatus(accessRecord.campaignStatus)) {
    return <SignalSessionClosedPage />;
  }

  const resolvedSearchParams = await searchParams;
  const previewMode =
    resolvedSearchParams?.preview === "confirm" || resolvedSearchParams?.preview === "processing"
      ? resolvedSearchParams.preview
      : "";

  return <FormtestPageClient {...page} previewMode={previewMode} />;
}
