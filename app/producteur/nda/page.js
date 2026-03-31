import { notFound } from "next/navigation";
import ProducerNdaPageClient from "../../../components/producteur/ProducerNdaPageClient";
import { getNdaPageData } from "../../../lib/nda-page";

export function generateMetadata() {
  const page = getNdaPageData();

  if (!page) {
    return {};
  }

  return {
    title: "NDA | Stories",
  };
}

export default function ProducerNdaPage() {
  const page = getNdaPageData();

  if (!page) {
    notFound();
  }

  return <ProducerNdaPageClient {...page} nextPathOverride="/catalogue" />;
}
