import { getLegacyPageByFilename } from "./legacy-html";

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export function getStaticLegalPageData(filename) {
  const page = getLegacyPageByFilename(filename);

  if (!page) {
    return null;
  }

  return {
    title: page.title,
    styles: page.styles,
    bodyHtml: stripScripts(page.bodyHtml),
  };
}
