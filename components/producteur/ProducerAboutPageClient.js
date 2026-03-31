"use client";

import Link from "next/link";
import useDesktopCursor from "../shared/useDesktopCursor";

export default function ProducerAboutPageClient({ page }) {
  useDesktopCursor({
    hoverSelector: "a, button",
    spotlightSelector: ".producer-about-button, .producer-about-card",
  });

  return (
    <>
      <style>{`
        :root {
          --producer-about-bg: #010302;
          --producer-about-surface: rgba(9, 20, 17, 0.88);
          --producer-about-line: rgba(199, 245, 231, 0.16);
          --producer-about-text: #f7f8f4;
          --producer-about-muted: rgba(247, 248, 244, 0.68);
          --producer-about-mint: #c7f5e7;
          --producer-about-pink: #f8b8d7;
          --producer-about-yellow: #f5ecb0;
        }

        html, body {
          margin: 0;
          background:
            radial-gradient(circle at 12% 8%, rgba(199,245,231,0.12), transparent 22%),
            radial-gradient(circle at 86% 14%, rgba(248,184,215,0.08), transparent 18%),
            linear-gradient(180deg, #030504 0%, #010302 55%, #000 100%);
          color: var(--producer-about-text);
          font-family: "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
        }

        * { box-sizing: border-box; }

        .producer-about-page {
          min-height: 100vh;
          padding: 24px 20px 72px;
        }

        .producer-about-shell {
          width: min(1380px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .producer-about-hero,
        .producer-about-steps {
          border-radius: 30px;
          border: 1px solid var(--producer-about-line);
          background:
            linear-gradient(180deg, rgba(199,245,231,0.08), rgba(199,245,231,0.02)),
            var(--producer-about-surface);
          backdrop-filter: blur(20px);
        }

        .producer-about-hero {
          padding: 34px;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.7fr);
          gap: 22px;
        }

        .producer-about-kicker {
          color: var(--producer-about-yellow);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.74rem;
        }

        .producer-about-title {
          margin: 12px 0 14px;
          font-size: clamp(2.8rem, 6vw, 5rem);
          line-height: 0.92;
          letter-spacing: -0.06em;
          max-width: 11ch;
        }

        .producer-about-intro {
          margin: 0;
          color: var(--producer-about-muted);
          line-height: 1.9;
          max-width: 66ch;
        }

        .producer-about-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .producer-about-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 18px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: 1px solid rgba(199,245,231,0.24);
          background: var(--producer-about-mint);
          color: #02110d;
        }

        .producer-about-button-secondary {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.12);
          color: var(--producer-about-text);
        }

        .producer-about-side {
          display: grid;
          gap: 12px;
          align-content: start;
        }

        .producer-about-side-card {
          padding: 18px;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
        }

        .producer-about-side-card strong {
          display: block;
          margin-bottom: 8px;
        }

        .producer-about-side-card p {
          margin: 0;
          color: var(--producer-about-muted);
          line-height: 1.7;
        }

        .producer-about-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .producer-about-card {
          padding: 20px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          display: grid;
          gap: 10px;
        }

        .producer-about-card h2,
        .producer-about-steps h2 {
          margin: 0;
          font-size: 1.16rem;
        }

        .producer-about-card p,
        .producer-about-steps li {
          margin: 0;
          color: var(--producer-about-muted);
          line-height: 1.75;
        }

        .producer-about-steps {
          padding: 24px;
          display: grid;
          gap: 12px;
        }

        .producer-about-steps ol {
          margin: 0;
          padding-left: 20px;
          display: grid;
          gap: 10px;
        }

        @media (max-width: 960px) {
          .producer-about-hero {
            grid-template-columns: 1fr;
          }

          .producer-about-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="producer-about-page">
        <div className="producer-about-shell">
          <section className="producer-about-hero">
            <div>
              <span className="producer-about-kicker">{page.eyebrow}</span>
              <h1 className="producer-about-title">{page.headline}</h1>
              <p className="producer-about-intro">{page.intro}</p>
              <div className="producer-about-actions">
                <Link className="producer-about-button" href={page.primaryHref}>
                  Découvrir le catalogue
                </Link>
                {page.secondaryHref ? (
                  <Link className="producer-about-button producer-about-button-secondary" href={page.secondaryHref}>
                    Renseigner mes goûts
                  </Link>
                ) : null}
              </div>
            </div>

            <aside className="producer-about-side">
              <div className="producer-about-side-card">
                <strong>Phase 1</strong>
                <p>Le catalogue vit déjà comme un espace crédible, mais Marée Noire reste l'entrée active côté vente.</p>
              </div>
              <div className="producer-about-side-card">
                <strong>Rôle du NDA</strong>
                <p>Le NDA s'ouvre avant le catalogue pour sécuriser l'entrée. Ensuite, la lecture détaillée se fait projet par projet.</p>
              </div>
            </aside>
          </section>

          <section className="producer-about-grid">
            {page.pillars.map((pillar) => (
              <article className="producer-about-card" key={pillar.title}>
                <h2>{pillar.title}</h2>
                <p>{pillar.text}</p>
              </article>
            ))}
          </section>

          <section className="producer-about-steps">
            <span className="producer-about-kicker">Parcours</span>
            <h2>Comment ça se déroule</h2>
            <ol>
              {page.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}
