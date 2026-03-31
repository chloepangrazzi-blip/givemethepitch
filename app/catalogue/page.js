import CataloguePageClient from "../../components/catalogue/CataloguePageClient";
import { getCataloguePageData } from "../../lib/catalogue-data";

export function generateMetadata() {
  return {
    title: "Catalogue | Give Me The Pitch",
  };
}

function getCatalogueMode(searchParams) {
  const rawMode = Array.isArray(searchParams?.mode) ? searchParams.mode[0] : searchParams?.mode;
  return rawMode === "panel" ? "signal" : "stories";
}

export default async function CataloguePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = getCataloguePageData(getCatalogueMode(resolvedSearchParams));
  return <CataloguePageClient page={page} />;
}
