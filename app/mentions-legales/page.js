import { notFound } from "next/navigation";
import StaticLegalPageClient from "../../components/legal/StaticLegalPageClient";
import { getStaticLegalPageData } from "../../lib/static-legal-page";

const FILENAME = "mentions-legales.html";

export function generateMetadata() {
  const page = getStaticLegalPageData(FILENAME);

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

export default function LegalPage() {
  const page = getStaticLegalPageData(FILENAME);

  if (!page) {
    notFound();
  }

  return <StaticLegalPageClient {...page} />;
}
