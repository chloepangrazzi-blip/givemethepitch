import Script from "next/script";

export default function LegacyPageRenderer({ page }) {
  return (
    <>
      {page.headLinks.map((link, index) => (
        <link
          key={`${page.slug}-link-${index}`}
          rel={link.rel}
          href={link.href}
          crossOrigin={link.crossOrigin || undefined}
        />
      ))}

      {page.styles.map((style, index) => (
        <style
          key={`${page.slug}-style-${index}`}
          dangerouslySetInnerHTML={{ __html: style }}
        />
      ))}

      <div dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />

      {page.scripts.map((script, index) => (
        <Script
          key={`${page.slug}-script-${index}`}
          id={`${page.slug}-script-${index}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: script }}
        />
      ))}
    </>
  );
}
