export const sitePages = [
  { filename: "theroom.html", slug: "theroom" },
  { filename: "keyaccess.html", slug: "keyaccess" },
  { filename: "maréenoire.html", slug: "mareenoire" },
  { filename: "formtest.html", slug: "formtest" },
  { filename: "cgu.html", slug: "cgu" },
  { filename: "confidentialite.html", slug: "confidentialite" },
  { filename: "cookies.html", slug: "cookies" },
  { filename: "mentions-legales.html", slug: "mentions-legales" },
  { filename: "nda.html", slug: "nda" },
];

export const dedicatedSlugs = new Set(sitePages.map((page) => page.slug));
