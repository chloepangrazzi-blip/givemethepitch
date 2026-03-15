import { notFound } from "next/navigation";
import LegacyPageRenderer from "../../components/LegacyPageRenderer";
import { getLegacyPageBySlug, getLegacyPages } from "../../lib/legacy-html";
import { dedicatedSlugs } from "../../lib/site-pages";

export function generateStaticParams() {
  return getLegacyPages()
    .filter((page) => !dedicatedSlugs.has(page.slug))
    .map((page) => ({
      slug: page.slug,
    }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (dedicatedSlugs.has(slug)) {
    return {};
  }

  const page = getLegacyPageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

export default async function LegacyPage({ params }) {
  const { slug } = await params;

  if (dedicatedSlugs.has(slug)) {
    notFound();
  }

  const page = getLegacyPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <LegacyPageRenderer page={page} />;
}
