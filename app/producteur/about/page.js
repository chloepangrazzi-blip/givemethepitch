import ProducerAboutPageClient from "../../../components/producteur/ProducerAboutPageClient";
import { getProducerAboutPageData } from "../../../lib/producer-about-page-data";

export function generateMetadata() {
  const page = getProducerAboutPageData();

  return {
    title: page.title,
  };
}

export default function ProducerAboutPage() {
  const page = getProducerAboutPageData();
  return <ProducerAboutPageClient page={page} />;
}
