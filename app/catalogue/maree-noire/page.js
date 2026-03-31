import CatalogueProjectPageClient from "../../../components/catalogue/CatalogueProjectPageClient";
import { getMareeNoireProductPageData } from "../../../lib/maree-noire-product-data";

export function generateMetadata() {
  const page = getMareeNoireProductPageData();

  return {
    title: `${page.title} | Stories`,
  };
}

export default function MareeNoireProductPage() {
  const page = getMareeNoireProductPageData();
  return <CatalogueProjectPageClient page={page} />;
}
