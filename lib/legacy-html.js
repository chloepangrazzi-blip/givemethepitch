import fs from "fs";
import path from "path";
import { SITE_DIR } from "./legacy-config";
import { sitePages } from "./site-pages";

function normalizeSlug(filename) {
  return filename
    .replace(/\.html$/i, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function extractAll(regex, source, mapper = (match) => match[1]) {
  return Array.from(source.matchAll(regex), mapper);
}

function extractFirst(regex, source, fallback = "") {
  const match = source.match(regex);
  return match ? match[1] : fallback;
}

function getLegacyFilenames() {
  const configured = sitePages.map((page) => page.filename);
  const discovered = fs
    .readdirSync(SITE_DIR)
    .filter((file) => file.endsWith(".html") && !configured.includes(file))
    .sort();

  return [...configured, ...discovered];
}

function parseHeadLinks(html) {
  return extractAll(/<link([^>]+)>/gi, html, (match) => {
    const attrs = match[1];
    const rel = extractFirst(/rel=["']([^"']+)["']/i, attrs, "");
    const href = extractFirst(/href=["']([^"']+)["']/i, attrs, "");
    const crossOrigin = extractFirst(
      /crossorigin(?:=["']([^"']*)["'])?/i,
      attrs,
      ""
    );

    return rel && href ? { rel, href, crossOrigin } : null;
  }).filter(Boolean);
}

function rewriteInternalLinks(html, pagesIndex) {
  return pagesIndex.reduce((output, page) => {
    const target = `/${page.slug}`;

    return output
      .replaceAll(`"${page.filename}"`, `"${target}"`)
      .replaceAll(`'${page.filename}'`, `'${target}'`)
      .replaceAll(`/${page.filename}`, target);
  }, html);
}

function parseLegacyHtml(filename, pagesIndex) {
  const fullPath = path.join(SITE_DIR, filename);
  const html = fs.readFileSync(fullPath, "utf8");
  const styles = extractAll(/<style[^>]*>([\s\S]*?)<\/style>/gi, html);
  const scripts = extractAll(/<script[^>]*>([\s\S]*?)<\/script>/gi, html);
  const bodyHtml = extractFirst(/<body[^>]*>([\s\S]*?)<\/body>/i, html, "");
  const title = extractFirst(/<title>([\s\S]*?)<\/title>/i, html, "");

  return {
    filename,
    slug: normalizeSlug(filename),
    title,
    styles,
    scripts: scripts.map((script) => rewriteInternalLinks(script, pagesIndex)),
    bodyHtml: rewriteInternalLinks(bodyHtml, pagesIndex),
    headLinks: parseHeadLinks(html),
  };
}

export function getLegacyPages() {
  const pagesIndex = getLegacyFilenames().map((filename) => ({
    filename,
    slug: normalizeSlug(filename),
  }));

  return pagesIndex.map((page) => parseLegacyHtml(page.filename, pagesIndex));
}

export function getLegacyPageBySlug(slug) {
  return getLegacyPages().find((page) => page.slug === slug) || null;
}

export function getLegacyPageByFilename(filename) {
  return getLegacyPages().find((page) => page.filename === filename) || null;
}
