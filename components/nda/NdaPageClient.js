"use client";

import { useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function mapErrorMessage(errorCode) {
  switch (errorCode) {
    case "missing_signature_data":
      return "merci de renseigner vos nom, prénom et d'accepter les termes";
    case "missing_access_code":
      return "clé introuvable - repasse par key access";
    case "invalid_code":
      return "clé invalide ou inactive - repasse par key access";
    case "nda_sign_failed":
    case "verify_failed":
    default:
      return "signature impossible pour le moment - réessaie";
  }
}

function HtmlText({ className, html, tag: Tag = "p" }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function NdaPageClient({
  heading,
  metaLines = [],
  parties = [],
  articles = [],
  fields = [],
  consentLabel,
  submitLabel,
  nextPathOverride = "/catalogue",
}) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useDesktopCursor({
    hoverSelector: "button, input, label",
    spotlightSelector: ".signature-block, .nda-parties, .btn-pill",
  });

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!prenom.trim() || !nom.trim() || !consent) {
      setError("merci de renseigner vos nom, prénom et d'accepter les termes");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/nda/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom: prenom.trim(),
          nom: nom.trim(),
          consent,
          accessCode: window.sessionStorage?.getItem("gmtp_access_code") || "",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "nda_sign_failed");
      }

      window.location.href = nextPathOverride || result.nextPath || "/catalogue";
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "nda_sign_failed";
      setError(mapErrorMessage(message));
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --nda-mint: #c8f5e8;
          --nda-pink: #f5c6d8;
          --nda-black: #080808;
          --nda-white: #ffffff;
          --nda-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", "Segoe UI", sans-serif;
          --nda-display: "Made Soulmaze", "Poppins", sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        html,
        body {
          margin: 0;
          background: var(--nda-black);
          font-family: var(--nda-sans);
          overflow-x: hidden;
          cursor: none;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        .nda-root,
        .nda-root * {
          cursor: none !important;
        }

        .nda-root {
          min-height: 100vh;
          background: var(--nda-black);
        }

        .cursor {
          position: fixed;
          width: 14px;
          height: 14px;
          background: var(--nda-mint);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: width 0.25s ease, height 0.25s ease, opacity 0.2s ease;
          mix-blend-mode: difference;
        }

        .cursor.hovering {
          width: 42px;
          height: 42px;
        }

        .nda-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 52px;
          background: var(--nda-mint);
          display: flex;
          align-items: center;
          padding: 0 28px;
          z-index: 200;
        }

        .nda-logo svg {
          width: 28px;
          height: 28px;
          display: block;
        }

        .nda-page {
          min-height: 100vh;
          background: var(--nda-black);
          padding-top: 0;
        }

        .nda-header {
          padding: 80px 8vw 60px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }

        .nda-title {
          margin: 0;
          font-family: var(--nda-display);
          font-weight: 400;
          font-size: clamp(52px, 9vw, 110px);
          color: #ffffff;
          line-height: 1;
        }

        .nda-meta {
          font-weight: 300;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.8;
          text-align: right;
        }

        .nda-body {
          padding: 60px 8vw;
          max-width: 860px;
          margin: 0 auto;
        }

        .nda-parties {
          background: rgba(200, 245, 232, 0.04);
          border: 1px solid rgba(200, 245, 232, 0.12);
          border-radius: 20px;
          padding: 32px 36px;
          margin-bottom: 52px;
        }

        .nda-parties-label,
        .sig-label {
          font-weight: 300;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--nda-mint);
          opacity: 0.72;
        }

        .nda-parties-label {
          margin-bottom: 20px;
        }

        .party-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .party-name {
          font-family: var(--nda-display);
          font-weight: 400;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 6px;
        }

        .party-detail {
          font-weight: 300;
          font-size: 12px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.74);
        }

        .nda-article {
          margin-bottom: 44px;
        }

        .article-number {
          font-weight: 300;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--nda-pink);
          opacity: 0.72;
          margin-bottom: 10px;
        }

        .article-title {
          margin: 0 0 16px;
          font-family: var(--nda-display);
          font-weight: 400;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.2;
        }

        .article-text,
        .article-list li,
        .consent-text,
        .field-label,
        .error-hint {
          font-weight: 300;
        }

        .article-text {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.9;
          color: rgba(255, 255, 255, 0.82);
        }

        .article-text-after {
          margin-top: 14px;
        }

        .article-text strong,
        .consent-text strong {
          font-family: var(--nda-display);
          font-weight: 400;
          color: rgba(255, 255, 255, 0.95);
          font-size: 1.02em;
        }

        .article-list {
          margin: 12px 0 0;
          padding-left: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .article-list li {
          position: relative;
          padding-left: 20px;
          font-size: 12.5px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.82);
        }

        .article-list li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: rgba(200, 245, 232, 0.62);
        }

        .article-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          margin-bottom: 44px;
        }

        .signature-block {
          background: rgba(200, 245, 232, 0.04);
          border: 1px solid rgba(200, 245, 232, 0.12);
          border-radius: 24px;
          padding: 44px 40px;
          margin-top: 60px;
          margin-bottom: 100px;
        }

        .sig-label {
          margin-bottom: 32px;
        }

        .sig-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }

        .field-wrap {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .field-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.88);
        }

        .field-input {
          width: 100%;
          padding: 15px 22px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: rgba(255, 255, 255, 0.04);
          color: var(--nda-white);
          font-family: var(--nda-sans);
          font-weight: 300;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          -webkit-appearance: none;
        }

        .field-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }

        .field-input:focus {
          border-color: rgba(200, 245, 232, 0.4);
          background: rgba(255, 255, 255, 0.05);
        }

        .consent-wrap {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 40px;
          padding: 24px 28px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.02);
          transition: border-color 0.3s ease;
        }

        .consent-wrap:hover {
          border-color: rgba(200, 245, 232, 0.2);
        }

        .consent-wrap input {
          display: none;
        }

        .consent-box {
          width: 22px;
          height: 22px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          flex-shrink: 0;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .consent-wrap input:checked ~ .consent-box {
          background: var(--nda-pink);
          border-color: var(--nda-pink);
        }

        .consent-wrap input:checked ~ .consent-box::after {
          content: "";
          width: 8px;
          height: 8px;
          background: var(--nda-black);
          border-radius: 3px;
          display: block;
        }

        .consent-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.82);
        }

        .sig-submit {
          display: flex;
          justify-content: center;
        }

        .btn-pill {
          background: var(--nda-mint);
          color: var(--nda-black);
          border: none;
          border-radius: 100px;
          padding: 20px 80px;
          font-family: var(--nda-display);
          font-weight: 400;
          font-size: 18px;
          letter-spacing: 0.04em;
          white-space: nowrap;
          transition:
            transform 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            opacity 0.2s ease;
        }

        .btn-pill:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #d4ffee;
          box-shadow: 0 16px 30px rgba(191, 248, 220, 0.18);
        }

        .btn-pill:disabled {
          opacity: 0.68;
        }

        .error-hint {
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--nda-pink);
          opacity: 0;
          text-align: center;
          margin-top: 16px;
          transition: opacity 0.3s ease;
        }

        .error-hint.visible {
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .cursor {
            display: none !important;
          }

          html,
          body,
          .nda-root,
          .nda-root * {
            cursor: auto !important;
          }

          .nda-root button,
          .nda-root input,
          .nda-root label {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            touch-action: manipulation;
          }
        }

        @media (max-width: 640px) {
          .party-row,
          .sig-fields {
            grid-template-columns: 1fr;
          }

          .nda-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .nda-meta {
            text-align: left;
          }

          .signature-block {
            padding: 30px 22px;
          }

          .btn-pill {
            width: 100%;
            white-space: normal;
            padding: 16px 28px;
            font-size: 15px;
            text-align: center;
          }
        }
      `}</style>

      <div className="nda-root">
        <div className="cursor" id="cursor" />

        <main className="nda-page">
          <header className="nda-header">
            <h1 className="nda-title">{heading}</h1>
            <div className="nda-meta">
              {metaLines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </header>

          <div className="nda-body">
            <section className="nda-parties">
              <div className="nda-parties-label">Parties</div>
              <div className="party-row">
                {parties.map((party) => (
                  <div className="party-block" key={party.name}>
                    <div className="party-name">{party.name}</div>
                    <div className="party-detail">{party.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            {articles.map((article, index) => (
              <div key={article.number}>
                <section className="nda-article">
                  <div className="article-number">{article.number}</div>
                  <h2 className="article-title">{article.title}</h2>
                  <HtmlText className="article-text" html={article.text} />
                  {article.list?.length ? (
                    <ul className="article-list">
                      {article.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {article.afterText ? <HtmlText className="article-text article-text-after" html={article.afterText} /> : null}
                </section>
                {index < articles.length - 1 ? <div className="article-divider" /> : null}
              </div>
            ))}

            <section className="signature-block">
              <div className="sig-label">Signature du Destinataire</div>

              <div className="sig-fields">
                {fields.map((field) => {
                  const value = field.name === "prenom" ? prenom : nom;
                  const setValue = field.name === "prenom" ? setPrenom : setNom;

                  return (
                    <div className="field-wrap" key={field.name}>
                      <label className="field-label" htmlFor={field.name}>
                        {field.label}
                      </label>
                      <input
                        className="field-input"
                        id={field.name}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder={field.placeholder}
                        type="text"
                        value={value}
                      />
                    </div>
                  );
                })}
              </div>

              <label className="consent-wrap">
                <input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
                <div className="consent-box" />
                <HtmlText className="consent-text" html={consentLabel} tag="div" />
              </label>

              <div className="sig-submit">
                <button
                  className="btn-pill"
                  disabled={submitting}
                  onClick={handleSubmit}
                  type="button"
                >
                  {submitLabel}
                </button>
              </div>

              <div className={`error-hint${error ? " visible" : ""}`}>{error || "merci de renseigner vos nom, prénom et d'accepter les termes"}</div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
