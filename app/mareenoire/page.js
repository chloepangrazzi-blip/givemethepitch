export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import MareeNoirePageClient from "../../components/mareenoire/MareeNoirePageClient";
import { getMareeNoirePageData } from "../../lib/mareenoire-page";

export function generateMetadata() {
  const page = getMareeNoirePageData();

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

export default function MareeNoirePage() {
  const page = getMareeNoirePageData();

  if (!page) {
    notFound();
  }

  return <MareeNoirePageClient page={page} />;
}
