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

export default function NdaPage() {
  const page = getNdaPageData();

  if (!page) {
    notFound();
  }

  return <NdaPageClient {...page} nextPathOverride={PANEL_PUBLIC_CATALOGUE_PATH} />;
}
