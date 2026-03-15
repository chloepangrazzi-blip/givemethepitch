import { getLegacyPageByFilename } from "./legacy-html";

const FILENAME = "mareenoire.html";

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export function getMareeNoirePageData() {
  const page = getLegacyPageByFilename(FILENAME);

  if (!page) {
    return null;
  }

  return {
    title: page.title,
    styles: page.styles,
    bodyHtml: stripScripts(page.bodyHtml),
  };
}
