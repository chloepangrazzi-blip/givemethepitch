import { getLegacyPageByFilename } from "./legacy-html";

const FILENAME = "theroom.html";
const LANDING_MARKER = "<!-- ══════════════════════ PAGE 1 : LANDING ══════════════════════ -->";
const ABOUT_MARKER = "<!-- ══════════════════════ PAGE 2 : ABOUT ══════════════════════ -->";
const FORM_MARKER = "<!-- ══════════════════════ PAGE 3 : FORM ══════════════════════ -->";

function extractFirst(regex, source, fallback = "") {
  const match = source.match(regex);
  return match ? match[0] : fallback;
}

function extractBetween(source, startMarker, endMarker = "") {
  const startIndex = source.indexOf(startMarker);

  if (startIndex === -1) {
    return "";
  }

  const sliced = source.slice(startIndex + startMarker.length);

  if (!endMarker) {
    return sliced.trim();
  }

  const endIndex = sliced.indexOf(endMarker);
  return (endIndex === -1 ? sliced : sliced.slice(0, endIndex)).trim();
}

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export function getTheRoomPageData() {
  const page = getLegacyPageByFilename(FILENAME);

  if (!page) {
    return null;
  }

  const bodyHtml = stripScripts(page.bodyHtml);

  return {
    title: page.title,
    styles: page.styles,
    navHtml: extractFirst(/<nav id="mainNav">[\s\S]*?<\/nav>/i, bodyHtml, ""),
    landingHtml: extractBetween(bodyHtml, LANDING_MARKER, ABOUT_MARKER),
    aboutHtml: extractBetween(bodyHtml, ABOUT_MARKER, FORM_MARKER).replace('<div id="page-about">', '<div id="page-about" class="visible">'),
    formHtml: extractBetween(bodyHtml, FORM_MARKER).replace('<div id="page-form">', '<div id="page-form" class="visible">'),
  };
}
