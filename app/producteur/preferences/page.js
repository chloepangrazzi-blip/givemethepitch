import ProducerPreferencesPageClient from "../../../components/producteur/ProducerPreferencesPageClient";
import { getProducerPreferencesPageData } from "../../../lib/producer-preferences-page-data";

export function generateMetadata() {
  const page = getProducerPreferencesPageData();

  return {
    title: page.title,
  };
}

export default function ProducerPreferencesPage() {
  const page = getProducerPreferencesPageData();
  return <ProducerPreferencesPageClient page={page} />;
}
