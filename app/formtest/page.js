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

  if (!page) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const previewMode =
    resolvedSearchParams?.preview === "confirm" ||
    resolvedSearchParams?.preview === "processing" ||
    resolvedSearchParams?.preview === "editorial"
      ? resolvedSearchParams.preview
      : "";

  if (previewMode === "editorial" && process.env.NODE_ENV !== "production") {
    return <FormtestPageClient {...getFormtestPageData({ formVersion: "signal_v3" })} previewMode={previewMode} />;
  }

  const accessRecord = await getCurrentPanelAccessRecord();

  if (!accessRecord || !isCampaignActiveStatus(accessRecord.campaignStatus)) {
    return <SignalSessionClosedPage />;
  }

  return <FormtestPageClient {...getFormtestPageData({ formVersion: accessRecord.formVersion })} previewMode={previewMode} />;
}
