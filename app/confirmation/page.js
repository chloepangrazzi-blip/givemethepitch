import ConfirmationPageClient from "../../components/confirmation/ConfirmationPageClient";
import { getConfirmationPageData } from "../../lib/confirmation-page-data";

export function generateMetadata() {
  const page = getConfirmationPageData();

  return {
    title: `${page.title} | Stories`,
  };
}

export default async function ConfirmationPage({ searchParams }) {
  const page = getConfirmationPageData();
  const params = (await searchParams) || {};
  const selectedPackCode = typeof params.pack === "string" ? params.pack : null;

  return <ConfirmationPageClient page={page} selectedPackCode={selectedPackCode} />;
}
