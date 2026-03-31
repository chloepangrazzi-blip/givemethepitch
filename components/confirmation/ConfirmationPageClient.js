"use client";

import Link from "next/link";
import { useMemo } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function ActionLink({ href, label, secondary = false }) {
  const className = `confirmation-button${secondary ? " confirmation-button-secondary" : ""}`;

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export default function ConfirmationPageClient({ page, selectedPackCode = null }) {
  const selectedPack = useMemo(
    () => page.packs.find((pack) => pack.code === selectedPackCode) || page.packs[2] || page.packs[0],
    [page.packs, selectedPackCode]
  );

  useDesktopCursor({
    hoverSelector: "a, button",
    spotlightSelector: ".confirmation-button, .confirmation-card, .milestone-row",
  });

  return (
    <>
      <style>{`
        :root {
          --confirmation-bg: #010302;
          --confirmation-surface: rgba(9, 20, 17, 0.88);
          --confirmation-surface-soft: rgba(255, 255, 255, 0.03);
          --confirmation-line: rgba(199, 245, 231, 0.16);
          --confirmation-text: #f7f8f4;
          --confirmation-muted: rgba(247, 248, 244, 0.7);
          --confirmation-mint: #c7f5e7;
          --confirmation-pink: #f8b8d7;
          --confirmation-yellow: #f5ecb0;
          --confirmation-sans: "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
        }

        html,
        body {
          margin: 0;
          background:
            radial-gradient(circle at 12% 10%, rgba(199, 245, 231, 0.12), transparent 22%),
            radial-gradient(circle at 86% 14%, rgba(248, 184, 215, 0.08), transparent 20%),
            radial-gradient(circle at 74% 70%, rgba(245, 236, 176, 0.08), transparent 16%),
            linear-gradient(180deg, #020403 0%, #010302 55%, #000 100%);
          color: var(--confirmation-text);
          font-family: var(--confirmation-sans);
        }

        * { box-sizing: border-box; }

        .confirmation-page {
          min-height: 100vh;
          padding: 24px 20px 72px;
        }

        .confirmation-shell {
          width: min(1400px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .confirmation-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .confirmation-back {
          color: var(--confirmation-muted);
          text-decoration: none;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .confirmation-reference {
          display: inline-flex;
          align-items: center;
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid var(--confirmation-line);
          background: rgba(199, 245, 231, 0.06);
          color: var(--confirmation-mint);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .confirmation-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.04fr) minmax(320px, 0.72fr);
          gap: 24px;
        }

        .confirmation-main,
        .confirmation-side {
          border-radius: 30px;
          border: 1px solid var(--confirmation-line);
          background:
            linear-gradient(180deg, rgba(199, 245, 231, 0.08), rgba(199, 245, 231, 0.02)),
            var(--confirmation-surface);
          backdrop-filter: blur(20px);
        }

        .confirmation-main {
          padding: 28px;
          display: grid;
          gap: 24px;
        }

        .confirmation-side {
          padding: 24px;
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .confirmation-head {
          display: grid;
          gap: 12px;
        }

        .confirmation-kicker {
          color: var(--confirmation-yellow);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.72rem;
        }

        .confirmation-title {
          margin: 0;
          font-size: clamp(2.8rem, 6vw, 5rem);
          line-height: 0.92;
          letter-spacing: -0.06em;
          max-width: 11ch;
        }

        .confirmation-subtitle {
          margin: 0;
          color: var(--confirmation-pink);
          font-size: 1.08rem;
          line-height: 1.65;
        }

        .confirmation-intro {
          margin: 0;
          color: var(--confirmation-muted);
          line-height: 1.8;
          max-width: 70ch;
        }

        .confirmation-banner {
          padding: 20px;
          border-radius: 24px;
          border: 1px solid rgba(199, 245, 231, 0.16);
          background: rgba(199, 245, 231, 0.08);
          display: grid;
          gap: 8px;
        }

        .banner-title {
          margin: 0;
          font-size: 1.24rem;
          color: var(--confirmation-mint);
        }

        .banner-copy {
          margin: 0;
          color: rgba(247, 248, 244, 0.82);
          line-height: 1.7;
        }

        .milestone-list {
          display: grid;
          gap: 12px;
        }

        .milestone-row,
        .confirmation-card,
        .confirmation-summary {
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: var(--confirmation-surface-soft);
        }

        .milestone-row {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 14px;
          padding: 18px;
          align-items: start;
        }

        .milestone-index {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(199, 245, 231, 0.1);
          color: var(--confirmation-mint);
          font-size: 0.9rem;
          font-weight: 700;
        }

        .milestone-content {
          display: grid;
          gap: 6px;
        }

        .milestone-label {
          font-size: 1rem;
        }

        .milestone-detail {
          color: var(--confirmation-muted);
          line-height: 1.6;
        }

        .confirmation-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .confirmation-card {
          padding: 18px;
          display: grid;
          gap: 10px;
        }

        .card-title {
          margin: 0;
          font-size: 1.04rem;
        }

        .card-copy {
          margin: 0;
          color: var(--confirmation-muted);
          line-height: 1.7;
        }

        .confirmation-summary {
          padding: 18px;
          display: grid;
          gap: 14px;
        }

        .summary-title {
          margin: 0;
          font-size: 1.18rem;
        }

        .summary-row {
          display: grid;
          gap: 4px;
        }

        .summary-label {
          color: var(--confirmation-muted);
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
          color: var(--confirmation-mint);
        }

        .delivery-list {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 10px;
          color: var(--confirmation-muted);
          line-height: 1.65;
        }

        .confirmation-actions {
          display: grid;
          gap: 12px;
        }

        .confirmation-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(199, 245, 231, 0.24);
          background: var(--confirmation-mint);
          color: #02110d;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: transform 180ms ease, background 180ms ease;
        }

        .confirmation-button:hover {
          transform: translateY(-1px);
          background: #dcfbf2;
        }

        .confirmation-button-secondary {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.14);
          color: var(--confirmation-text);
        }

        .confirmation-button-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        @media (max-width: 1120px) {
          .confirmation-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .confirmation-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .confirmation-page {
            padding: 18px 14px 56px;
          }

          .confirmation-main,
          .confirmation-side {
            border-radius: 24px;
            padding: 20px;
          }

          .milestone-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="confirmation-page">
        <div className="confirmation-shell">
          <div className="confirmation-topbar">
            <Link className="confirmation-back" href={`${page.backHref}?pack=${selectedPack.code}`}>
              Retour à l'achat
            </Link>
            <span className="confirmation-reference">{page.reference}</span>
          </div>

          <section className="confirmation-layout">
            <div className="confirmation-main">
              <header className="confirmation-head">
                <span className="confirmation-kicker">Sortie du tunnel</span>
                <h1 className="confirmation-title">{page.title}</h1>
                <p className="confirmation-subtitle">{page.subtitle}</p>
                <p className="confirmation-intro">{page.intro}</p>
              </header>

              <section className="confirmation-banner">
                <h2 className="banner-title">Marée Noire est bien réservée</h2>
                <p className="banner-copy">
                  Le producteur doit quitter cette page avec une sensation très claire : la vente est confirmée, le bon
                  pack a été enregistré et les documents de suite vont être envoyés sans friction.
                </p>
              </section>

              <section className="milestone-list">
                {page.milestones.map((milestone, index) => (
                  <article className="milestone-row" key={milestone.label}>
                    <div className="milestone-index">{String(index + 1).padStart(2, "0")}</div>
                    <div className="milestone-content">
                      <strong className="milestone-label">{milestone.label}</strong>
                      <span className="milestone-detail">{milestone.detail}</span>
                    </div>
                  </article>
                ))}
              </section>

              <section className="confirmation-grid">
                {page.infoCards.map((card) => (
                  <article className="confirmation-card" key={card.title}>
                    <h2 className="card-title">{card.title}</h2>
                    <p className="card-copy">{card.text}</p>
                  </article>
                ))}
              </section>
            </div>

            <aside className="confirmation-side">
              <div className="confirmation-summary">
                <span className="confirmation-kicker">Récapitulatif</span>
                <h2 className="summary-title">{page.projectTitle}</h2>
                <div className="summary-row">
                  <span className="summary-label">Genre</span>
                  <span className="summary-value">{page.projectGenres.join(" · ")}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Format</span>
                  <span className="summary-value">{page.projectFormat}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Pack enregistré</span>
                  <span className="summary-value">{selectedPack.title}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Contenu du pack</span>
                  <span className="summary-value">{selectedPack.description}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Montant</span>
                  <strong className="summary-price">{selectedPack.price}</strong>
                </div>
              </div>

              <div className="confirmation-summary">
                <span className="confirmation-kicker">Suite logique</span>
                <ul className="delivery-list">
                  {page.deliveryNotes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="confirmation-actions">
                <ActionLink href={page.projectHref} label="Retour au projet" />
                <ActionLink href={page.catalogueHref} label="Retour au catalogue" secondary />
              </div>
            </aside>
          </section>
        </div>
      </div>
    </>
  );
}
