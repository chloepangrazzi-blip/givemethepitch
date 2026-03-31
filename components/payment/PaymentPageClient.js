"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function ActionLink({ href, label, disabled = false, secondary = false }) {
  const className = `payment-button${secondary ? " payment-button-secondary" : ""}${
    disabled || !href ? " payment-button-disabled" : ""
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

export default function PaymentPageClient({ page, selectedPackCode = null }) {
  const [selectedMethodCode, setSelectedMethodCode] = useState(page.paymentMethods[0]?.code || "");

  const selectedPack = useMemo(
    () => page.packs.find((pack) => pack.code === selectedPackCode) || page.packs[2] || page.packs[0],
    [page.packs, selectedPackCode]
  );

  const selectedMethod = useMemo(
    () => page.paymentMethods.find((method) => method.code === selectedMethodCode) || page.paymentMethods[0],
    [page.paymentMethods, selectedMethodCode]
  );

  useDesktopCursor({
    hoverSelector: "button, a, input",
    spotlightSelector: ".payment-button, .payment-method, .payment-summary, .billing-field",
  });

  return (
    <>
      <style>{`
        :root {
          --payment-bg: #010302;
          --payment-surface: rgba(9, 20, 17, 0.88);
          --payment-surface-soft: rgba(255, 255, 255, 0.03);
          --payment-line: rgba(199, 245, 231, 0.16);
          --payment-text: #f7f8f4;
          --payment-muted: rgba(247, 248, 244, 0.7);
          --payment-mint: #c7f5e7;
          --payment-pink: #f8b8d7;
          --payment-yellow: #f5ecb0;
          --payment-sans: "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
        }

        html,
        body {
          margin: 0;
          background:
            radial-gradient(circle at 12% 10%, rgba(199, 245, 231, 0.1), transparent 22%),
            radial-gradient(circle at 86% 14%, rgba(248, 184, 215, 0.08), transparent 20%),
            linear-gradient(180deg, #020403 0%, #010302 55%, #000 100%);
          color: var(--payment-text);
          font-family: var(--payment-sans);
        }

        * { box-sizing: border-box; }

        .payment-page {
          min-height: 100vh;
          padding: 24px 20px 72px;
        }

        .payment-shell {
          width: min(1440px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .payment-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .payment-back {
          color: var(--payment-muted);
          text-decoration: none;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .payment-reference {
          display: inline-flex;
          align-items: center;
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid var(--payment-line);
          background: rgba(199, 245, 231, 0.06);
          color: var(--payment-mint);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .payment-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.72fr);
          gap: 24px;
        }

        .payment-main,
        .payment-side {
          border-radius: 30px;
          border: 1px solid var(--payment-line);
          background:
            linear-gradient(180deg, rgba(199, 245, 231, 0.08), rgba(199, 245, 231, 0.02)),
            var(--payment-surface);
          backdrop-filter: blur(20px);
        }

        .payment-main {
          padding: 28px;
          display: grid;
          gap: 24px;
        }

        .payment-side {
          padding: 24px;
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .payment-head {
          display: grid;
          gap: 12px;
        }

        .payment-kicker {
          color: var(--payment-yellow);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.72rem;
        }

        .payment-title {
          margin: 0;
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          line-height: 0.92;
          letter-spacing: -0.06em;
        }

        .payment-subtitle {
          margin: 0;
          color: var(--payment-pink);
          font-size: 1.08rem;
          line-height: 1.65;
        }

        .payment-intro {
          margin: 0;
          color: var(--payment-muted);
          line-height: 1.8;
          max-width: 68ch;
        }

        .payment-block {
          display: grid;
          gap: 14px;
          padding: 20px;
          border-radius: 24px;
          background: var(--payment-surface-soft);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .block-title {
          margin: 0;
          font-size: 1.2rem;
        }

        .method-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .payment-method {
          text-align: left;
          padding: 18px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.22);
          color: var(--payment-text);
          cursor: pointer;
          display: grid;
          gap: 8px;
          font: inherit;
        }

        .payment-method-active {
          border-color: rgba(199, 245, 231, 0.32);
          background: rgba(199, 245, 231, 0.08);
        }

        .method-detail {
          color: var(--payment-muted);
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .billing-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .billing-field {
          display: grid;
          gap: 8px;
        }

        .billing-label {
          color: var(--payment-muted);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .billing-input {
          min-height: 52px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.22);
          color: var(--payment-text);
          padding: 0 14px;
          font: inherit;
        }

        .payment-summary {
          padding: 18px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: var(--payment-surface-soft);
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
          color: var(--payment-muted);
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
          color: var(--payment-mint);
        }

        .payment-checklist {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 10px;
          color: var(--payment-muted);
          line-height: 1.65;
        }

        .payment-notes {
          display: grid;
          gap: 10px;
          color: var(--payment-muted);
          line-height: 1.7;
        }

        .payment-actions {
          display: grid;
          gap: 12px;
        }

        .payment-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(199, 245, 231, 0.24);
          background: var(--payment-mint);
          color: #02110d;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: transform 180ms ease, background 180ms ease;
        }

        .payment-button:hover {
          transform: translateY(-1px);
          background: #dcfbf2;
        }

        .payment-button-secondary {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.14);
          color: var(--payment-text);
        }

        .payment-button-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .payment-button-disabled,
        .payment-button-disabled:hover {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 1120px) {
          .payment-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 860px) {
          .method-grid,
          .billing-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .payment-page {
            padding: 18px 14px 56px;
          }

          .payment-main,
          .payment-side {
            border-radius: 24px;
            padding: 20px;
          }
        }
      `}</style>

      <div className="payment-page">
        <div className="payment-shell">
          <div className="payment-topbar">
            <Link className="payment-back" href={`${page.backHref}?pack=${selectedPack.code}`}>
              Retour au contrat
            </Link>
            <span className="payment-reference">{page.reference}</span>
          </div>

          <section className="payment-layout">
            <div className="payment-main">
              <header className="payment-head">
                <span className="payment-kicker">Tunnel d'achat</span>
                <h1 className="payment-title">{page.title}</h1>
                <p className="payment-subtitle">{page.subtitle}</p>
                <p className="payment-intro">{page.intro}</p>
              </header>

              <section className="payment-block">
                <span className="payment-kicker">Mode de paiement</span>
                <h2 className="block-title">Choisir comment régler</h2>
                <div className="method-grid">
                  {page.paymentMethods.map((method) => (
                    <button
                      key={method.code}
                      type="button"
                      className={`payment-method${selectedMethod.code === method.code ? " payment-method-active" : ""}`}
                      onClick={() => setSelectedMethodCode(method.code)}
                    >
                      <strong>{method.title}</strong>
                      <span>{method.detail}</span>
                      <span className="method-detail">{method.note}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="payment-block">
                <span className="payment-kicker">Facturation</span>
                <h2 className="block-title">Informations de facturation</h2>
                <div className="billing-grid">
                  {page.billingFields.map((field) => (
                    <label className="billing-field" key={field.label}>
                      <span className="billing-label">{field.label}</span>
                      <input className="billing-input" placeholder={field.placeholder} type="text" />
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <aside className="payment-side">
              <div className="payment-summary">
                <span className="payment-kicker">Récapitulatif</span>
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
                  <span className="summary-label">Pack</span>
                  <span className="summary-value">{selectedPack.title}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Contenu</span>
                  <span className="summary-value">{selectedPack.description}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Prix</span>
                  <strong className="summary-price">{selectedPack.price}</strong>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Mode choisi</span>
                  <span className="summary-value">
                    {selectedMethod.title} · {selectedMethod.detail}
                  </span>
                </div>
              </div>

              <div className="payment-summary">
                <span className="payment-kicker">Checklist</span>
                <ul className="payment-checklist">
                  {page.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="payment-summary">
                <span className="payment-kicker">Notes de branchement</span>
                <div className="payment-notes">
                  {page.notes.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              </div>

              <div className="payment-actions">
                <ActionLink href={`${page.nextHref}?pack=${selectedPack.code}`} label="Payer maintenant" />
                <ActionLink href={`${page.backHref}?pack=${selectedPack.code}`} label="Retour au contrat" secondary />
              </div>
            </aside>
          </section>
        </div>
      </div>
    </>
  );
}
