"use client";

import Link from "next/link";
import { useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function ToggleButton({ active, label, onClick }) {
  return (
    <button className={`producer-pref-chip${active ? " is-active" : ""}`} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

export default function ProducerPreferencesPageClient({ page }) {
  const [genres, setGenres] = useState([]);
  const [formats, setFormats] = useState([]);
  const [tones, setTones] = useState([]);
  const [intent, setIntent] = useState("");
  const [notes, setNotes] = useState("");

  useDesktopCursor({
    hoverSelector: "button, a, textarea",
    spotlightSelector: ".producer-pref-chip, .producer-pref-button",
  });

  const toggleValue = (currentValues, setter, value) => {
    setter(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  };

  const submit = () => {
    const payload = {
      genres,
      formats,
      tones,
      intent,
      notes,
      savedAt: new Date().toISOString(),
    };

    window.sessionStorage?.setItem("gmtp_producer_preferences", JSON.stringify(payload));
    window.location.href = page.backHref;
  };

  return (
    <>
      <style>{`
        :root {
          --producer-pref-bg: #010302;
          --producer-pref-surface: rgba(9, 20, 17, 0.88);
          --producer-pref-line: rgba(199, 245, 231, 0.16);
          --producer-pref-text: #f7f8f4;
          --producer-pref-muted: rgba(247, 248, 244, 0.68);
          --producer-pref-mint: #c7f5e7;
          --producer-pref-pink: #f8b8d7;
          --producer-pref-yellow: #f5ecb0;
        }

        html, body {
          margin: 0;
          background:
            radial-gradient(circle at 14% 10%, rgba(199,245,231,0.12), transparent 22%),
            radial-gradient(circle at 84% 14%, rgba(248,184,215,0.08), transparent 18%),
            linear-gradient(180deg, #030504 0%, #010302 55%, #000 100%);
          color: var(--producer-pref-text);
          font-family: "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
        }

        * { box-sizing: border-box; }

        .producer-pref-page {
          min-height: 100vh;
          padding: 24px 20px 72px;
        }

        .producer-pref-shell {
          width: min(1360px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 22px;
        }

        .producer-pref-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .producer-pref-back {
          color: var(--producer-pref-muted);
          text-decoration: none;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .producer-pref-hero,
        .producer-pref-block {
          border-radius: 30px;
          border: 1px solid var(--producer-pref-line);
          background:
            linear-gradient(180deg, rgba(199,245,231,0.08), rgba(199,245,231,0.02)),
            var(--producer-pref-surface);
          backdrop-filter: blur(20px);
        }

        .producer-pref-hero {
          padding: 34px;
          display: grid;
          gap: 14px;
        }

        .producer-pref-kicker {
          color: var(--producer-pref-yellow);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.74rem;
        }

        .producer-pref-title {
          margin: 0;
          font-size: clamp(2.8rem, 6vw, 5rem);
          line-height: 0.92;
          letter-spacing: -0.06em;
          max-width: 11ch;
        }

        .producer-pref-intro {
          margin: 0;
          color: var(--producer-pref-muted);
          line-height: 1.8;
          max-width: 68ch;
        }

        .producer-pref-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .producer-pref-block {
          padding: 22px;
          display: grid;
          gap: 14px;
        }

        .producer-pref-block h2 {
          margin: 0;
          font-size: 1.16rem;
        }

        .producer-pref-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .producer-pref-chip {
          min-height: 44px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
          color: var(--producer-pref-text);
          font: inherit;
          cursor: pointer;
        }

        .producer-pref-chip.is-active {
          border-color: rgba(199,245,231,0.38);
          background: rgba(199,245,231,0.1);
          color: var(--producer-pref-mint);
        }

        .producer-pref-textarea {
          min-height: 160px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.22);
          color: var(--producer-pref-text);
          padding: 14px 16px;
          font: inherit;
          resize: vertical;
        }

        .producer-pref-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .producer-pref-button {
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
          background: var(--producer-pref-mint);
          color: #02110d;
          cursor: pointer;
        }

        .producer-pref-button-secondary {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.12);
          color: var(--producer-pref-text);
        }

        @media (max-width: 900px) {
          .producer-pref-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="producer-pref-page">
        <div className="producer-pref-shell">
          <div className="producer-pref-topbar">
            <Link className="producer-pref-back" href={page.backHref}>
              Retour au catalogue
            </Link>
          </div>

          <section className="producer-pref-hero">
            <span className="producer-pref-kicker">Préférences producteur</span>
            <h1 className="producer-pref-title">{page.title}</h1>
            <p className="producer-pref-intro">{page.intro}</p>
          </section>

          <section className="producer-pref-grid">
            <article className="producer-pref-block">
              <h2>Genres recherchés</h2>
              <div className="producer-pref-chip-row">
                {page.genres.map((label) => (
                  <ToggleButton
                    key={label}
                    active={genres.includes(label)}
                    label={label}
                    onClick={() => toggleValue(genres, setGenres, label)}
                  />
                ))}
              </div>
            </article>

            <article className="producer-pref-block">
              <h2>Formats recherchés</h2>
              <div className="producer-pref-chip-row">
                {page.formats.map((label) => (
                  <ToggleButton
                    key={label}
                    active={formats.includes(label)}
                    label={label}
                    onClick={() => toggleValue(formats, setFormats, label)}
                  />
                ))}
              </div>
            </article>

            <article className="producer-pref-block">
              <h2>Énergie / ton</h2>
              <div className="producer-pref-chip-row">
                {page.tones.map((label) => (
                  <ToggleButton
                    key={label}
                    active={tones.includes(label)}
                    label={label}
                    onClick={() => toggleValue(tones, setTones, label)}
                  />
                ))}
              </div>
            </article>

            <article className="producer-pref-block">
              <h2>Intention du moment</h2>
              <div className="producer-pref-chip-row">
                {page.intentOptions.map((label) => (
                  <ToggleButton
                    key={label}
                    active={intent === label}
                    label={label}
                    onClick={() => setIntent(intent === label ? "" : label)}
                  />
                ))}
              </div>
            </article>
          </section>

          <section className="producer-pref-block">
            <h2>Précision libre</h2>
            <textarea
              className="producer-pref-textarea"
              placeholder="Si tu veux, tu peux préciser une envie, un type de projet ou un cadre de production."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <div className="producer-pref-actions">
              <button className="producer-pref-button" type="button" onClick={submit}>
                Enregistrer et revenir au catalogue
              </button>
              <Link className="producer-pref-button producer-pref-button-secondary" href={page.backHref}>
                Retour simple
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
