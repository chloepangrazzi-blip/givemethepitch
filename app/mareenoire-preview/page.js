export const dynamic = "force-dynamic";

import MareeNoirePageClient from "../../components/mareenoire/MareeNoirePageClient";
import { getMareeNoireExperiencePageData } from "../../lib/mareenoire-page";

export function generateMetadata() {
  const page = getMareeNoireExperiencePageData();

  if (!page) {
    return {};
  }

  return {
    title: `${page.title || "Give Me The Pitch"} | Preview`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function MareeNoirePreviewPage() {
  const page = getMareeNoireExperiencePageData();

  if (!page) {
    return null;
  }

  return <MareeNoirePageClient page={page} />;
}
