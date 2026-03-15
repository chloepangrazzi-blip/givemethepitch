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

export default function FormtestPage() {
  const page = getFormtestPageData();

  if (!page) {
    notFound();
  }

  return <FormtestPageClient {...page} />;
}
