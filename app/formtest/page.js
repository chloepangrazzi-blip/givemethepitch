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
    resolvedSearchParams?.preview === "confirm" || resolvedSearchParams?.preview === "processing"
      ? resolvedSearchParams.preview
      : "";

  return <FormtestPageClient {...page} previewMode={previewMode} />;
}
