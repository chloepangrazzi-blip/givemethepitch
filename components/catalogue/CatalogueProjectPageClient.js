"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function ActionLink({ href, label, disabled = false, secondary = false }) {
  const className = `project-button${secondary ? " project-button-secondary" : ""}${
    disabled || !href ? " project-button-disabled" : ""
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

function ReadinessPill({ ready }) {
  return <span className={`asset-pill${ready ? " asset-pill-ready" : ""}`}>{ready ? "Pret" : "A brancher"}</span>;
}

function CharacterCard({ character }) {
  return (
    <article className="project-character-card">
      {character.image ? (
        <div className="project-character-visual">
          <img alt={character.name} className="project-character-image" src={character.image} />
        </div>
      ) : null}
      <div className="project-character-copy">
        <p className="project-character-name">{character.name}</p>
        <p className="project-character-meta">{character.meta}</p>
        <p className="project-character-standfirst">{character.standfirst}</p>
        <div className="project-paragraph-stack">
          {character.paragraphs.map((paragraph) => (
            <p className="project-body" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function CatalogueProjectPageClient({ page }) {
  const [selectedPackCode, setSelectedPackCode] = useState(page.packs[2]?.code || page.packs[0]?.code || "");

  useDesktopCursor({
    hoverSelector: "button, a, video",
    spotlightSelector:
      ".project-button, .pack-chip, .score-card, .project-character-card, .dossier-block, .asset-row",
  });

  useEffect(() => {
    const overlay = document.getElementById("producerTeaserOverlay");
    const video = document.getElementById("producerTeaserVideo");

    if (!overlay || !video) {
      return undefined;
    }

    const source = video.querySelector("source");
    const isMobile = window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window;

    if (source) {
      const wantedSrc = isMobile
        ? source.getAttribute("data-mobile-src")
        : source.getAttribute("data-desktop-src");

      if (wantedSrc && source.getAttribute("src") !== wantedSrc) {
        source.setAttribute("src", wantedSrc);
        video.load();
      }
    }

    const startVideo = (event) => {
      event?.preventDefault?.();
      video.setAttribute("controls", "controls");
      overlay.classList.add("playing");
      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          overlay.classList.remove("playing");
        });
      }
    };

    const onPlay = () => overlay.classList.add("playing");
    const onPause = () => {
      if (!video.ended) {
        overlay.classList.remove("playing");
      }
    };
    const onEnded = () => overlay.classList.remove("playing");

    overlay.addEventListener("click", startVideo);
    overlay.addEventListener("touchend", startVideo, { passive: false });
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      overlay.removeEventListener("click", startVideo);
      overlay.removeEventListener("touchend", startVideo);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const selectedPack = useMemo(
    () => page.packs.find((pack) => pack.code === selectedPackCode) || page.packs[0],
    [page.packs, selectedPackCode]
  );

  const dossier = page.dossier;
  const contractHref = selectedPack ? `${page.contractHref}?pack=${selectedPack.code}` : page.contractHref;

  return (
    <>
      <style>{`
        :root {
          --project-bg: #000000;
          --project-card: #070707;
          --project-card-soft: #0d0d0d;
          --project-line: rgba(255, 255, 255, 0.1);
          --project-line-mint: rgba(199, 245, 231, 0.34);
          --project-text: #f6f3ee;
          --project-muted: rgba(246, 243, 238, 0.72);
          --project-mint: #c7f5e7;
          --project-pink: #f8b8d7;
          --project-yellow: #f4e8ab;
          --project-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
          --project-display: "Made Soulmaze", "Poppins", sans-serif;
          --project-horizon: "Horizon", "Made Soulmaze", sans-serif;
        }

        html,
        body {
          margin: 0;
          background: var(--project-bg);
          color: var(--project-text);
          font-family: var(--project-sans);
          cursor: none;
        }

        * {
          box-sizing: border-box;
        }

        .project-page,
        .project-page * {
          cursor: none !important;
        }

        .project-page {
          min-height: 100vh;
          padding: 24px 20px 72px;
          background: #000;
        }

        .project-shell {
          width: min(1480px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .project-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .project-back {
          color: var(--project-mint);
          text-decoration: none;
          font-size: 2.25rem;
          line-height: 1;
          font-weight: 300;
        }

        .project-badge {
          display: inline-flex;
          align-items: center;
          min-height: 52px;
          padding: 0 20px;
          border-radius: 999px;
          border: 1px solid var(--project-line);
          background: rgba(255, 255, 255, 0.03);
          color: var(--project-mint);
          font-size: 0.82rem;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .project-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.78fr);
          gap: 24px;
        }

        .project-panel,
        .project-stack,
        .project-dossier {
          border: 1px solid var(--project-line-mint);
          border-radius: 32px;
          background: var(--project-card);
        }

        .project-panel {
          padding: 28px;
          display: grid;
          gap: 22px;
        }

        .project-header {
          display: grid;
          gap: 14px;
        }

        .project-kickers {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .project-kicker {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid var(--project-line);
          background: rgba(255, 255, 255, 0.03);
          color: var(--project-muted);
          font-size: 0.8rem;
          font-weight: 300;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .project-title {
          margin: 0;
          font-family: var(--project-horizon);
          font-size: clamp(3rem, 6vw, 5.6rem);
          line-height: 0.88;
          letter-spacing: 0.01em;
        }

        .project-tagline {
          margin: 0;
          font-size: 1.12rem;
          line-height: 1.65;
          color: var(--project-pink);
          max-width: 52ch;
        }

        .project-intro {
          margin: 0;
          color: var(--project-muted);
          font-size: 1rem;
          line-height: 1.8;
          max-width: 64ch;
        }

        .project-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .project-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 60px;
          padding: 0 24px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: var(--project-mint);
          color: #000;
          text-decoration: none;
          font-size: 0.98rem;
          font-weight: 300;
          letter-spacing: 0.04em;
          transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease;
        }

        .project-button:hover {
          transform: translateY(-2px);
        }

        .project-button-secondary {
          background: transparent;
          color: var(--project-text);
        }

        .project-button-disabled {
          opacity: 0.42;
        }

        .project-video-shell {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 28px;
          overflow: hidden;
          background: #0d1512;
        }

        .project-video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          background: #0d1512;
        }

        .project-video-overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.18);
          transition: opacity 180ms ease;
        }

        .project-video-overlay.playing {
          opacity: 0;
          pointer-events: none;
        }

        .project-play {
          width: 84px;
          height: 84px;
          border: none;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.94);
          display: grid;
          place-items: center;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.24);
        }

        .project-play-icon {
          width: 0;
          height: 0;
          margin-left: 5px;
          border-top: 14px solid transparent;
          border-bottom: 14px solid transparent;
          border-left: 22px solid var(--project-mint);
        }

        .project-storyboard {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .project-story-card {
          display: grid;
          gap: 10px;
          padding: 18px;
          border-radius: 24px;
          background: var(--project-card-soft);
          border: 1px solid var(--project-line);
        }

        .project-story-kicker,
        .stack-kicker,
        .dossier-kicker {
          margin: 0;
          color: var(--project-pink);
          font-size: 0.75rem;
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .project-story-title,
        .stack-title,
        .dossier-title {
          margin: 0;
          font-size: 2rem;
          line-height: 1.02;
          font-weight: 600;
        }

        .project-story-copy,
        .stack-text,
        .project-body,
        .dossier-copy {
          margin: 0;
          color: var(--project-muted);
          font-size: 1rem;
          line-height: 1.75;
        }

        .project-story-list,
        .segment-list,
        .quote-list,
        .season-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .project-story-list li,
        .segment-list li,
        .quote-list li,
        .season-list li {
          position: relative;
          padding-left: 18px;
          color: var(--project-muted);
          line-height: 1.7;
        }

        .project-story-list li::before,
        .segment-list li::before,
        .quote-list li::before,
        .season-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--project-mint);
        }

        .project-stack {
          padding: 24px;
          display: grid;
          gap: 16px;
          align-content: start;
        }

        .stack-block,
        .dossier-block {
          display: grid;
          gap: 14px;
          padding: 18px;
          border-radius: 24px;
          background: var(--project-card-soft);
          border: 1px solid var(--project-line);
        }

        .score-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .score-card {
          padding: 16px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--project-line);
          display: grid;
          gap: 8px;
        }

        .score-label,
        .score-detail,
        .asset-detail,
        .project-character-meta {
          color: var(--project-muted);
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .score-value,
        .pack-price,
        .asset-label,
        .project-character-name {
          font-size: 1.22rem;
          line-height: 1.1;
          font-weight: 600;
        }

        .pack-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .pack-chip {
          min-height: 44px;
          padding: 0 16px;
          border: 1px solid var(--project-line);
          border-radius: 999px;
          background: transparent;
          color: var(--project-text);
          font-size: 0.92rem;
          font-weight: 300;
        }

        .pack-chip-active {
          background: var(--project-mint);
          color: #000;
          border-color: transparent;
        }

        .pack-focus {
          display: grid;
          gap: 10px;
          padding: 16px;
          border-radius: 22px;
          background: rgba(199, 245, 231, 0.06);
          border: 1px solid rgba(199, 245, 231, 0.18);
        }

        .pack-description {
          margin: 0;
          color: var(--project-text);
          font-size: 0.98rem;
          line-height: 1.65;
        }

        .asset-list {
          display: grid;
          gap: 10px;
        }

        .asset-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--project-line);
        }

        .asset-meta {
          display: grid;
          gap: 4px;
        }

        .asset-pill {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid var(--project-line);
          color: var(--project-muted);
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .asset-pill-ready {
          border-color: rgba(199, 245, 231, 0.24);
          color: var(--project-mint);
        }

        .project-dossier {
          padding: 28px;
          display: grid;
          gap: 18px;
        }

        .project-dossier-head {
          display: grid;
          gap: 12px;
        }

        .project-dossier-title {
          margin: 0;
          font-family: var(--project-display);
          font-size: clamp(2.7rem, 5vw, 5rem);
          line-height: 0.92;
          letter-spacing: -0.05em;
        }

        .project-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .project-media-grid,
        .arena-gallery {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .project-media-card,
        .arena-gallery-card {
          min-height: 180px;
          border-radius: 20px;
          overflow: hidden;
          background: #111;
          border: 1px solid var(--project-line);
        }

        .project-media-card img,
        .arena-gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .project-characters {
          display: grid;
          gap: 16px;
        }

        .project-character-card {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 18px;
          padding: 18px;
          border-radius: 24px;
          background: var(--project-card-soft);
          border: 1px solid var(--project-line);
        }

        .project-character-visual {
          border-radius: 18px;
          overflow: hidden;
          min-height: 100%;
          background: #111;
        }

        .project-character-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .project-character-copy,
        .project-paragraph-stack {
          display: grid;
          gap: 10px;
        }

        .project-character-standfirst,
        .season-outro {
          margin: 0;
          color: var(--project-text);
          font-size: 1rem;
          line-height: 1.7;
        }

        @media (max-width: 1080px) {
          .project-hero,
          .project-grid {
            grid-template-columns: 1fr;
          }

          .project-storyboard,
          .score-grid,
          .project-media-grid,
          .arena-gallery {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 760px) {
          .project-page {
            padding-inline: 14px;
          }

          .project-panel,
          .project-stack,
          .project-dossier {
            border-radius: 26px;
          }

          .project-panel,
          .project-stack,
          .project-dossier,
          .stack-block,
          .dossier-block,
          .project-story-card,
          .project-character-card {
            padding: 16px;
          }

          .project-title,
          .project-dossier-title {
            max-width: none;
          }

          .project-storyboard,
          .score-grid,
          .project-media-grid,
          .arena-gallery {
            grid-template-columns: 1fr;
          }

          .project-character-card {
            grid-template-columns: 1fr;
          }

          .project-video-shell {
            border-radius: 22px;
          }

          .asset-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="project-page">
        <div className="project-shell">
          <header className="project-topbar">
            <Link className="project-back" href="/catalogue">
              ←
            </Link>
            <span className="project-badge">Stories</span>
          </header>

          <section className="project-hero">
            <div className="project-panel">
              <div className="project-header">
                <div className="project-kickers">
                  <span className="project-kicker">{page.status}</span>
                  {page.genres.map((genre) => (
                    <span className="project-kicker" key={genre}>
                      {genre}
                    </span>
                  ))}
                  <span className="project-kicker">{page.format}</span>
                </div>

                <h1 className="project-title">{page.title}</h1>
                <p className="project-tagline">{page.tagline}</p>
                <p className="project-intro">{page.intro}</p>
              </div>

              <div className="project-actions">
                <ActionLink label="Lire le synopsis pilote" href={page.synopsisPdfHref} secondary />
                <ActionLink label="Lire la restitution complete" href={page.restitutionHref} secondary />
                <ActionLink href={contractHref} label="Voir le contrat" />
              </div>

              <div className="project-video-shell">
                <video
                  className="project-video"
                  id="producerTeaserVideo"
                  playsInline
                  poster={page.teaser.posterSrc || undefined}
                  preload="metadata"
                >
                  <source
                    data-desktop-src={page.teaser.desktopSrc}
                    data-mobile-src={page.teaser.mobileSrc}
                    src={page.teaser.desktopSrc}
                    type="video/mp4"
                  />
                </video>
                <div className="project-video-overlay" id="producerTeaserOverlay">
                  <button aria-label="Lancer le teaser" className="project-play" type="button">
                    <span className="project-play-icon" />
                  </button>
                </div>
              </div>

              <div className="project-storyboard">
                <article className="project-story-card">
                  <span className="project-story-kicker">Argument de vente</span>
                  <h2 className="project-story-title">Ce que cette page donne avant décision</h2>
                  <p className="project-story-copy">
                    Le teaser, le dossier projet, le scoring SIGNAL et les packs Stories sont réunis au même endroit pour
                    donner une lecture claire avant achat.
                  </p>
                </article>

                <article className="project-story-card">
                  <span className="project-story-kicker">Parcours producteur</span>
                  <ul className="project-story-list">
                    <li>Lecture libre du teaser et de la matière créative</li>
                    <li>Consultation du scoring et des verbatims après campagne</li>
                    <li>Choix du pack puis passage au contrat et a l'achat</li>
                  </ul>
                </article>
              </div>
            </div>

            <aside className="project-stack">
              <div className="stack-block">
                <span className="stack-kicker">{page.scoring.phaseLabel}</span>
                <h2 className="stack-title">Snapshot scoring</h2>
                <p className="stack-text">{page.scoring.note}</p>
                <div className="score-grid">
                  {page.scoring.cards.map((card) => (
                    <article className="score-card" key={card.label}>
                      <span className="score-label">{card.label}</span>
                      <strong className="score-value">{card.value}</strong>
                      <span className="score-detail">{card.detail}</span>
                    </article>
                  ))}
                </div>
              </div>

              <div className="stack-block">
                <span className="stack-kicker">Packs</span>
                <h2 className="stack-title">Choix de vente</h2>
                <div className="pack-chip-row">
                  {page.packs.map((pack) => (
                    <button
                      className={`pack-chip${selectedPack.code === pack.code ? " pack-chip-active" : ""}`}
                      key={pack.code}
                      onClick={() => setSelectedPackCode(pack.code)}
                      type="button"
                    >
                      {pack.title}
                    </button>
                  ))}
                </div>
                <div className="pack-focus">
                  <span className="stack-kicker">{selectedPack.title}</span>
                  <strong className="pack-price">{selectedPack.price}</strong>
                  <p className="pack-description">{selectedPack.description}</p>
                </div>
              </div>

              <div className="stack-block">
                <span className="stack-kicker">Assets</span>
                <h2 className="stack-title">Elements projet</h2>
                <div className="asset-list">
                  {page.assets.map((asset) => (
                    <div className="asset-row" key={asset.label}>
                      <div className="asset-meta">
                        <span className="asset-label">{asset.label}</span>
                        <span className="asset-detail">{asset.detail}</span>
                      </div>
                      <ReadinessPill ready={asset.ready} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="stack-block">
                <span className="stack-kicker">Lecture SIGNAL</span>
                <h2 className="stack-title">Ce qui remontera apres campagne</h2>
                <p className="stack-text">{page.scoring.sampleSize}</p>
                <ul className="segment-list">
                  {page.scoring.segmentation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <ul className="quote-list">
                  {page.scoring.verbatims.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </section>

          <section className="project-dossier">
            <header className="project-dossier-head">
              <span className="dossier-kicker">Dossier projet complet</span>
              <h2 className="project-dossier-title">{page.title} dans toute sa matière</h2>
              <p className="dossier-copy">
                La fiche producteur garde ici toute la lecture éditoriale de la page panel, mais sans réinjecter l'ancien
                HTML ni son CSS. On reste dans une seule couche propre.
              </p>
            </header>

            <div className="project-grid">
              <article className="dossier-block">
                <span className="dossier-kicker">{dossier.story.kicker}</span>
                <h3 className="dossier-title">{dossier.story.title}</h3>
                {dossier.story.paragraphs.map((paragraph) => (
                  <p className="project-body" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </article>

              <article className="dossier-block">
                <span className="dossier-kicker">{dossier.intrigue.kicker}</span>
                <h3 className="dossier-title">{dossier.intrigue.title}</h3>
                {dossier.intrigue.paragraphs.map((paragraph) => (
                  <p className="project-body" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </article>
            </div>

            <div className="project-media-grid">
              {dossier.story.images.map((image, index) => (
                <div className="project-media-card" key={`${image.slice(0, 24)}-${index}`}>
                  <img alt={`Marée Noire visuel ${index + 1}`} src={image} />
                </div>
              ))}
            </div>

            <article className="dossier-block">
              <span className="dossier-kicker">{dossier.characters.kicker}</span>
              <h3 className="dossier-title">Les personnages</h3>
              <p className="project-body">{dossier.characters.intro}</p>
            </article>

            <div className="project-characters">
              {dossier.characters.items.map((character) => (
                <CharacterCard character={character} key={character.name} />
              ))}
            </div>

            <div className="project-grid">
              {dossier.arenas.sections.map((section) => (
                <article className="dossier-block" key={section.title}>
                  <span className="dossier-kicker">{dossier.arenas.kicker}</span>
                  <h3 className="dossier-title">{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p className="project-body" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </article>
              ))}
            </div>

            <div className="arena-gallery">
              {dossier.arenas.gallery.map((image, index) => (
                <div className="arena-gallery-card" key={`${image.slice(0, 24)}-arena-${index}`}>
                  <img alt={`Marée Noire arene ${index + 1}`} src={image} />
                </div>
              ))}
            </div>

            <article className="dossier-block">
              <span className="dossier-kicker">{dossier.season.kicker}</span>
              <h3 className="dossier-title">La saison</h3>
              <ul className="season-list">
                {dossier.season.beats.map((beat) => (
                  <li key={beat}>{beat}</li>
                ))}
              </ul>
              <p className="season-outro">{dossier.season.outro}</p>
            </article>
          </section>
        </div>
      </div>
    </>
  );
}
