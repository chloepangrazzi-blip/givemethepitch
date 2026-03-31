import { getLegacyPageByFilename } from "./legacy-html";

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&eacute;/gi, "e")
    .replace(/&egrave;/gi, "e")
    .replace(/&ecirc;/gi, "e")
    .replace(/&agrave;/gi, "a")
    .replace(/&ccedil;/gi, "c");
}

function textFromHtml(html) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?(strong|em|span)[^>]*>/gi, "")
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractFirst(pattern, source) {
  const match = source.match(pattern);
  return match?.[1] ? textFromHtml(match[1]) : "";
}

function extractPageChunk(bodyHtml) {
  const match = bodyHtml.match(/<div class="page">([\s\S]*?)<div class="footer">/i);
  return match?.[1] ?? bodyHtml;
}

function parseTable(tableHtml) {
  const headers = Array.from(tableHtml.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)).map((match) => textFromHtml(match[1]));
  const rows = [];

  Array.from(tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)).forEach((match) => {
    const cells = Array.from(match[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)).map((cell) => textFromHtml(cell[1]));

    if (!cells.length) {
      return;
    }

    const hasHeaderCell = /<th/i.test(match[1]);

    if (hasHeaderCell && headers.length) {
      return;
    }

    rows.push(cells);
  });

  return {
    type: "table",
    headers,
    rows,
  };
}

function parseList(listHtml) {
  return {
    type: "list",
    items: Array.from(listHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((match) => textFromHtml(match[1])),
  };
}

function parseSectionBlocks(sectionHtml) {
  const blocks = [];
  const blockRegex = /<table[\s\S]*?<\/table>|<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>|<p[\s\S]*?<\/p>/gi;
  let match = blockRegex.exec(sectionHtml);

  while (match) {
    const blockHtml = match[0];

    if (blockHtml.startsWith("<table")) {
      blocks.push(parseTable(blockHtml));
    } else if (blockHtml.startsWith("<ul") || blockHtml.startsWith("<ol")) {
      blocks.push(parseList(blockHtml));
    } else {
      blocks.push({
        type: "paragraph",
        text: textFromHtml(blockHtml),
      });
    }

    match = blockRegex.exec(sectionHtml);
  }

  return blocks;
}

export function getStaticLegalPageData(filename) {
  const page = getLegacyPageByFilename(filename);

  if (!page) {
    return null;
  }

  const bodyHtml = stripScripts(page.bodyHtml);
  const pageChunk = extractPageChunk(bodyHtml);
  const sections = [];

  Array.from(pageChunk.matchAll(/<h2>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2>|$)/gi)).forEach((match) => {
    sections.push({
      title: textFromHtml(match[1]),
      blocks: parseSectionBlocks(match[2]),
    });
  });

  return {
    title: page.title,
    label: extractFirst(/<div class="page-label">([\s\S]*?)<\/div>/i, pageChunk),
    heading: extractFirst(/<h1>([\s\S]*?)<\/h1>/i, pageChunk),
    introNote: extractFirst(/<div class="intro-note">([\s\S]*?)<\/div>/i, pageChunk),
    footerNote: extractFirst(/<div class="footer">([\s\S]*?)<\/div>/i, bodyHtml),
    sections,
  };
}
