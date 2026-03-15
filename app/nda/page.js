import { notFound } from "next/navigation";
import NdaPageClient from "../../components/nda/NdaPageClient";
import { getNdaPageData } from "../../lib/nda-page";

export function generateMetadata() {
  const page = getNdaPageData();

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

export default function NdaPage() {
  const page = getNdaPageData();

  if (!page) {
    notFound();
  }

  return <NdaPageClient {...page} />;
}
