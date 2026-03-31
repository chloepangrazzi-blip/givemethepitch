import { notFound } from "next/navigation";
import KeyAccessPageClient from "../../components/keyaccess/KeyAccessPageClient";
import { getKeyAccessPageData } from "../../lib/keyaccess-page";

export function generateMetadata() {
  const page = getKeyAccessPageData();

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

export default function KeyAccessPage() {
  const page = getKeyAccessPageData();

  if (!page) {
    notFound();
  }

  return <KeyAccessPageClient {...page} />;
}
