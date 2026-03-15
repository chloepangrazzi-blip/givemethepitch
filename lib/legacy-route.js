import { notFound } from "next/navigation";
import LegacyPageRenderer from "../components/LegacyPageRenderer";
import { getLegacyPageByFilename } from "./legacy-html";

export function getLegacyMetadata(filename) {
  const page = getLegacyPageByFilename(filename);

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

export function renderLegacyPage(filename) {
  const page = getLegacyPageByFilename(filename);

  if (!page) {
    notFound();
  }

  return <LegacyPageRenderer page={page} />;
}
