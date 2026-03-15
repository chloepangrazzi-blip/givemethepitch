"use client";

import { useMemo } from "react";

export default function StaticLegalPageClient({ styles, bodyHtml }) {
  const styleNodes = useMemo(
    () => styles.map((style, index) => (
      <style
        key={`legal-style-${index}`}
        dangerouslySetInnerHTML={{ __html: style }}
      />
    )),
    [styles]
  );

  return (
    <>
      {styleNodes}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
