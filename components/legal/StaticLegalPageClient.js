"use client";

import Link from "next/link";

function DataTable({ headers, rows }) {
  return (
    <div className="legal-table-shell">
      <table className="legal-table">
        {headers.length ? (
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`cell-${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StaticLegalPageClient({ label, heading, introNote, sections, footerNote }) {
  return (
    <>
      <style>{`
        :root {
          --legal-bg: #000;
          --legal-card: #070707;
          --legal-line: rgba(255, 255, 255, 0.08);
          --legal-line-mint: rgba(199, 245, 231, 0.24);
          --legal-text: #f6f3ee;
          --legal-muted: rgba(246, 243, 238, 0.72);
          --legal-mint: #c7f5e7;
          --legal-pink: #f8b8d7;
          --legal-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
          --legal-display: "Made Soulmaze", "Poppins", sans-serif;
        }

        html,
        body {
          margin: 0;
          background: var(--legal-bg);
          color: var(--legal-text);
          font-family: var(--legal-sans);
        }

        * {
          box-sizing: border-box;
        }

        .legal-page {
          min-height: 100vh;
          padding: 36px 20px 88px;
          background: #000;
        }

        .legal-shell {
          width: min(980px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .legal-back {
          color: var(--legal-mint);
          text-decoration: none;
          font-size: 1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 300;
        }

        .legal-card {
          border: 1px solid var(--legal-line-mint);
          border-radius: 28px;
          background: var(--legal-card);
          padding: 28px;
          display: grid;
          gap: 20px;
        }

        .legal-label {
          margin: 0;
          color: var(--legal-mint);
          font-size: 0.76rem;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .legal-title {
          margin: 0;
          font-family: var(--legal-display);
          font-size: clamp(2.5rem, 6vw, 4.6rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .legal-intro {
          margin: 0;
          padding: 16px 18px;
          border-radius: 20px;
          background: rgba(199, 245, 231, 0.05);
          border: 1px solid rgba(199, 245, 231, 0.12);
          color: var(--legal-muted);
          line-height: 1.75;
        }

        .legal-section {
          display: grid;
          gap: 14px;
          padding-top: 6px;
        }

        .legal-section-title {
          margin: 0;
          color: var(--legal-pink);
          font-size: 0.9rem;
          font-weight: 300;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .legal-paragraph,
        .legal-list li,
        .legal-footer {
          margin: 0;
          color: var(--legal-muted);
          line-height: 1.8;
          font-size: 0.98rem;
        }

        .legal-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .legal-list li {
          position: relative;
          padding-left: 18px;
        }

        .legal-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--legal-mint);
        }

        .legal-table-shell {
          overflow-x: auto;
          border-radius: 18px;
          border: 1px solid var(--legal-line);
          background: rgba(255, 255, 255, 0.02);
        }

        .legal-table {
          width: 100%;
          border-collapse: collapse;
        }

        .legal-table th,
        .legal-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid var(--legal-line);
          vertical-align: top;
          line-height: 1.7;
        }

        .legal-table th {
          color: var(--legal-mint);
          font-size: 0.76rem;
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .legal-table td {
          color: var(--legal-muted);
          font-size: 0.95rem;
        }

        .legal-foot {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          color: var(--legal-muted);
          font-size: 0.88rem;
          padding-top: 6px;
        }

        .legal-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .legal-links a {
          color: var(--legal-mint);
          text-decoration: none;
        }

        @media (max-width: 760px) {
          .legal-page {
            padding-inline: 14px;
          }

          .legal-card {
            padding: 18px;
            border-radius: 22px;
          }
        }
      `}</style>

      <div className="legal-page">
        <div className="legal-shell">
          <Link className="legal-back" href="/">
            ← Retour
          </Link>

          <article className="legal-card">
            {label ? <p className="legal-label">{label}</p> : null}
            <h1 className="legal-title">{heading}</h1>
            {introNote ? <p className="legal-intro">{introNote}</p> : null}

            {sections.map((section) => (
              <section className="legal-section" key={section.title}>
                <h2 className="legal-section-title">{section.title}</h2>

                {section.blocks.map((block, index) => {
                  if (block.type === "paragraph") {
                    return (
                      <p className="legal-paragraph" key={`${section.title}-p-${index}`}>
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === "list") {
                    return (
                      <ul className="legal-list" key={`${section.title}-list-${index}`}>
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  return <DataTable headers={block.headers} key={`${section.title}-table-${index}`} rows={block.rows} />;
                })}
              </section>
            ))}

            <div className="legal-foot">
              <p className="legal-footer">{footerNote || "© GIVE ME THE PITCH"}</p>
              <nav className="legal-links">
                <Link href="/mentions-legales">Mentions légales</Link>
                <Link href="/confidentialite">Confidentialité</Link>
                <Link href="/cgu">CGU</Link>
                <Link href="/cookies">Cookies</Link>
              </nav>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
