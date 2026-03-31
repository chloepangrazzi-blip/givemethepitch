"use client";

import Link from "next/link";
import { useMemo } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function ActionLink({ href, label, disabled = false, secondary = false }) {
  const className = `contract-button${secondary ? " contract-button-secondary" : ""}${
    disabled || !href ? " contract-button-disabled" : ""
  }`;

  if (!href || disabled) {
    return (
      <button className={className} type="button" disabled>
        {label}
      </button>
    );
  }

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export default function ContractPageClient({ page, selectedPackCode = null }) {
  const selectedPack = useMemo(
    () => page.packs.find((pack) => pack.code === selectedPackCode) || page.packs[2] || page.packs[0],
    [page.packs, selectedPackCode]
  );

  useDesktopCursor({
    hoverSelector: "button, a",
    spotlightSelector: ".contract-button, .contract-card, .pricing-table tbody tr, .annexe-table tbody tr",
  });

  return (
    <>
      <style>{`
        :root {
          --contract-bg: #010302;
          --contract-surface: rgba(9, 20, 17, 0.88);
          --contract-surface-soft: rgba(255, 255, 255, 0.03);
          --contract-line: rgba(199, 245, 231, 0.16);
          --contract-line-strong: rgba(199, 245, 231, 0.28);
          --contract-text: #f7f8f4;
          --contract-muted: rgba(247, 248, 244, 0.7);
          --contract-mint: #c7f5e7;
          --contract-pink: #f8b8d7;
          --contract-yellow: #f5ecb0;
          --contract-sans: "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
        }

        html,
        body {
          margin: 0;
          background:
            radial-gradient(circle at 12% 10%, rgba(199, 245, 231, 0.1), transparent 22%),
            radial-gradient(circle at 86% 14%, rgba(248, 184, 215, 0.08), transparent 20%),
            linear-gradient(180deg, #020403 0%, #010302 55%, #000 100%);
          color: var(--contract-text);
          font-family: var(--contract-sans);
        }

        * {
          box-sizing: border-box;
        }

        .contract-page {
          min-height: 100vh;
          padding: 24px 20px 72px;
        }

        .contract-shell {
          width: min(1480px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .contract-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .contract-back {
          color: var(--contract-muted);
          text-decoration: none;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .contract-reference {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid var(--contract-line);
          background: rgba(199, 245, 231, 0.06);
          color: var(--contract-mint);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .contract-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.72fr);
          gap: 24px;
        }

        .contract-main,
        .contract-side {
          border-radius: 30px;
          border: 1px solid var(--contract-line);
          background:
            linear-gradient(180deg, rgba(199, 245, 231, 0.08), rgba(199, 245, 231, 0.02)),
            var(--contract-surface);
          backdrop-filter: blur(20px);
        }

        .contract-main {
          padding: 28px;
          display: grid;
          gap: 24px;
        }

        .contract-side {
          padding: 24px;
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .contract-head {
          display: grid;
          gap: 12px;
        }

        .contract-kicker {
          color: var(--contract-yellow);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.72rem;
        }

        .contract-title {
          margin: 0;
          font-size: clamp(2.6rem, 6vw, 4.8rem);
          line-height: 0.92;
          letter-spacing: -0.06em;
          max-width: 12ch;
        }

        .contract-subtitle {
          margin: 0;
          color: var(--contract-pink);
          font-size: 1.08rem;
          line-height: 1.65;
        }

        .contract-intro {
          margin: 0;
          color: var(--contract-muted);
          line-height: 1.8;
          max-width: 72ch;
        }

        .contract-highlights {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .contract-card,
        .party-card,
        .summary-block,
        .contract-section,
        .annexe-card {
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: var(--contract-surface-soft);
        }

        .contract-card {
          min-height: 94px;
          padding: 16px;
          display: grid;
          gap: 10px;
        }

        .contract-card-index {
          color: var(--contract-pink);
          font-size: 0.76rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .contract-card-copy {
          line-height: 1.55;
          font-size: 0.94rem;
        }

        .party-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .party-card {
          padding: 18px;
          display: grid;
          gap: 10px;
        }

        .party-title {
          margin: 0;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--contract-mint);
        }

        .party-lines {
          display: grid;
          gap: 6px;
          color: var(--contract-muted);
          line-height: 1.6;
        }

        .pricing-wrap {
          display: grid;
          gap: 12px;
        }

        .pricing-table,
        .annexe-table {
          width: 100%;
          border-collapse: collapse;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(199, 245, 231, 0.12);
          background: rgba(0, 0, 0, 0.24);
        }

        .pricing-table th,
        .pricing-table td,
        .annexe-table th,
        .annexe-table td {
          padding: 14px 16px;
          text-align: left;
          vertical-align: top;
        }

        .pricing-table th,
        .annexe-table th {
          color: var(--contract-yellow);
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border-bottom: 1px solid rgba(199, 245, 231, 0.12);
        }

        .pricing-table td,
        .annexe-table td {
          color: var(--contract-muted);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .contract-sections,
        .contract-annexes {
          display: grid;
          gap: 14px;
        }

        .contract-section,
        .annexe-card {
          padding: 20px;
          display: grid;
          gap: 12px;
        }

        .section-head {
          display: grid;
          gap: 4px;
        }

        .section-article {
          color: var(--contract-mint);
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .section-title,
        .annexe-title,
        .summary-title {
          margin: 0;
          font-size: 1.18rem;
          line-height: 1.35;
        }

        .clause-list,
        .summary-checklist {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 10px;
          color: var(--contract-muted);
          line-height: 1.72;
        }

        .summary-block {
          padding: 18px;
          display: grid;
          gap: 14px;
        }

        .summary-meta {
          display: grid;
          gap: 10px;
        }

        .summary-row {
          display: grid;
          gap: 4px;
        }

        .summary-label {
          color: var(--contract-muted);
          font-size: 0.76rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .summary-value {
          line-height: 1.55;
        }

        .summary-price {
          font-size: 2rem;
          line-height: 1;
          font-weight: 700;
          color: var(--contract-mint);
        }

        .contract-actions {
          display: grid;
          gap: 12px;
        }

        .contract-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(199, 245, 231, 0.24);
          background: var(--contract-mint);
          color: #02110d;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: transform 180ms ease, background 180ms ease;
        }

        .contract-button:hover {
          transform: translateY(-1px);
          background: #dcfbf2;
        }

        .contract-button-secondary {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.14);
          color: var(--contract-text);
        }

        .contract-button-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .contract-button-disabled,
        .contract-button-disabled:hover {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .contract-note {
          color: var(--contract-muted);
          line-height: 1.7;
          font-size: 0.92rem;
        }

        @media (max-width: 1120px) {
          .contract-hero {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 860px) {
          .party-grid,
          .contract-highlights {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .contract-page {
            padding: 18px 14px 56px;
          }

          .contract-main,
          .contract-side {
            border-radius: 24px;
            padding: 20px;
          }

          .pricing-table th,
          .pricing-table td,
          .annexe-table th,
          .annexe-table td {
            padding: 12px 10px;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="contract-page">
        <div className="contract-shell">
          <div className="contract-topbar">
            <Link className="contract-back" href={page.backHref}>
              Retour à Marée Noire
            </Link>
            <span className="contract-reference">{page.contractReference}</span>
          </div>

          <section className="contract-hero">
            <div className="contract-main">
              <header className="contract-head">
                <span className="contract-kicker">{page.status}</span>
                <h1 className="contract-title">{page.title}</h1>
                <p className="contract-subtitle">{page.subtitle}</p>
                <p className="contract-intro">{page.intro}</p>
              </header>

              <div className="contract-highlights">
                {page.highlights.map((item, index) => (
                  <article className="contract-card" key={item}>
                    <span className="contract-card-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="contract-card-copy">{item}</div>
                  </article>
                ))}
              </div>

              <section className="party-grid">
                {page.parties.map((party) => (
                  <article className="party-card" key={party.label}>
                    <h2 className="party-title">{party.label}</h2>
                    <div className="party-lines">
                      {party.lines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  </article>
                ))}
              </section>

              <section className="pricing-wrap">
                <span className="contract-kicker">Article 7</span>
                <h2 className="section-title">Prix HT et success fees</h2>
                <table className="pricing-table">
                  <thead>
                    <tr>
                      <th>Pack</th>
                      <th>Prix HT</th>
                      <th>Success Fee fixe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.pricingRows.map((row) => (
                      <tr key={row.pack}>
                        <td>{row.pack}</td>
                        <td>{row.price}</td>
                        <td>{row.successFee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="contract-sections">
                {page.sections.map((section) => (
                  <article className="contract-section" key={section.article}>
                    <div className="section-head">
                      <span className="section-article">Article {section.article}</span>
                      <h2 className="section-title">{section.title}</h2>
                    </div>
                    <ul className="clause-list">
                      {section.clauses.map((clause) => (
                        <li key={clause}>{clause}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>

              <section className="contract-annexes">
                {page.annexes.map((annexe) => (
                  <article className="annexe-card" key={annexe.title}>
                    <h2 className="annexe-title">{annexe.title}</h2>
                    {"rows" in annexe ? (
                      <div className="summary-meta">
                        {annexe.rows.map((row) => (
                          <div className="summary-row" key={row.label}>
                            <span className="summary-label">{row.label}</span>
                            <span className="summary-value">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <table className="annexe-table">
                        <thead>
                          <tr>
                            <th>Livrable</th>
                            <th>Starter</th>
                            <th>Pro</th>
                            <th>Ultimate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {annexe.table.map((row) => (
                            <tr key={row.item}>
                              <td>{row.item}</td>
                              <td>{row.starter}</td>
                              <td>{row.pro}</td>
                              <td>{row.ultimate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </article>
                ))}
              </section>
            </div>

            <aside className="contract-side">
              <div className="summary-block">
                <span className="contract-kicker">Récapitulatif</span>
                <h2 className="summary-title">{page.projectTitle}</h2>

                <div className="summary-meta">
                  <div className="summary-row">
                    <span className="summary-label">Genre</span>
                    <span className="summary-value">{page.projectGenres.join(" · ")}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Format</span>
                    <span className="summary-value">{page.projectFormat}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Pack sélectionné</span>
                    <span className="summary-value">{selectedPack.title}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Contenu pack</span>
                    <span className="summary-value">{selectedPack.description}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Prix</span>
                    <strong className="summary-price">{selectedPack.price}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Source</span>
                    <span className="summary-value">{page.sourceFileName}</span>
                  </div>
                </div>
              </div>

              <div className="summary-block">
                <span className="contract-kicker">Avant validation</span>
                <ul className="summary-checklist">
                  {page.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="contract-actions">
                <ActionLink href={`/achat?pack=${selectedPack.code}`} label="Signer et continuer" />
                <ActionLink href={page.backHref} label="Retour au projet" secondary />
              </div>

              <p className="contract-note">
                Le texte affiché ici vient du vrai document contractuel placé dans le dossier Playground. La prochaine
                brique consiste à brancher la vraie signature puis la page achat.
              </p>
            </aside>
          </section>
        </div>
      </div>
    </>
  );
}
