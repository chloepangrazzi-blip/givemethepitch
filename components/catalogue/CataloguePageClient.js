"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function truncateByWords(text, maxChars) {
  if (text.length <= maxChars) {
    return text;
  }

  const words = text.split(/\s+/);
  let excerpt = "";

  for (const word of words) {
    const next = excerpt ? `${excerpt} ${word}` : word;
    if (next.length > maxChars) {
      break;
    }
    excerpt = next;
  }

  return excerpt ? `${excerpt}...` : text;
}

function ProjectCard({ project, featuredStatusPlacement = "bottom", onReadMore }) {
  const cardClassName = `catalog-card tone-${project.tone}${project.featured ? " is-featured" : ""}${
    project.previewSize === "tall" ? " is-tall-preview" : ""
  }`;
  const canExpand = project.expandable !== false;
  const pitchClassName = canExpand ? "catalog-pitch" : "catalog-pitch is-expanded";
  const tagsClassName = `catalog-tags${project.stackTags ? " is-stacked" : ""}`;
  const collapsedPitch = truncateByWords(
    project.shortPitch,
    project.previewChars ?? (project.previewSize === "tall" ? 300 : 185),
  );
  const displayedPitch = canExpand ? collapsedPitch : project.shortPitch;
  const statusClassName = `catalog-status${featuredStatusPlacement === "top" ? " is-top" : ""}`;

  return (
    <article className={cardClassName} data-project-id={project.id}>
      <div className="catalog-poster-wrap">
        {project.href ? (
          <Link aria-label={`Voir le projet ${project.title}`} className="catalog-poster-link" href={project.href}>
            <img alt={project.title} className="catalog-poster" src={project.posterSrc} />
          </Link>
        ) : (
          <div aria-label={project.title} className="catalog-poster-static" role="img">
            <img alt={project.title} className="catalog-poster" src={project.posterSrc} />
          </div>
        )}

        {project.featured ? <span className={statusClassName}>{project.status}</span> : null}
      </div>

      <div className="catalog-meta">
        <div className="catalog-meta-top">
          {!project.featured ? <span className="catalog-status-inline">{project.status}</span> : null}

          <div className={tagsClassName}>
            <span>{project.genre}</span>
            <span>{project.format}</span>
            {project.featured && project.href ? (
              <Link className="catalog-tag-action" href={project.href}>
                VOIR LE PROJET
              </Link>
            ) : null}
          </div>
        </div>

        <p className={pitchClassName}>{displayedPitch}</p>

        <div className="catalog-actions">
          {canExpand ? (
            <button className="catalog-more" onClick={() => onReadMore?.(project)} type="button">
              Lire la suite
            </button>
          ) : null}

          {project.href && !project.featured ? (
            <Link className="catalog-action" href={project.href}>
              Voir le projet
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MobileShelfTile({ project, onOpen }) {
  return (
    <button
      aria-label={`Ouvrir la fiche ${project.title}`}
      className="catalog-mobile-tile"
      onClick={() => onOpen?.(project)}
      type="button"
    >
      <span className="catalog-mobile-tile-frame">
        <img alt={project.title} className="catalog-mobile-tile-poster" src={project.posterSrc} />
      </span>
      <span className="catalog-mobile-tile-status">{project.status}</span>
    </button>
  );
}

export default function CataloguePageClient({ page }) {
  const [featuredHeight, setFeaturedHeight] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const featuredProject = page.projects.find((project) => project.featured) || null;
  const shelfProjects = page.projects.filter((project) => !project.featured);

  useDesktopCursor({
    hoverSelector: "button, a, .catalog-modal-backdrop",
    spotlightSelector:
      ".catalog-action, .catalog-header-link, .catalog-poster-link, .catalog-more, .catalog-modal-close",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFeaturedHeight = () => {
      const referenceCard = document.querySelector('[data-project-id="consentement-mutuel"]');
      if (!referenceCard) {
        return;
      }

      const nextHeight = Math.round(referenceCard.getBoundingClientRect().height);
      setFeaturedHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    syncFeaturedHeight();

    const referenceCard = document.querySelector('[data-project-id="consentement-mutuel"]');
    const observer = referenceCard && "ResizeObserver" in window ? new ResizeObserver(syncFeaturedHeight) : null;

    if (referenceCard && observer) {
      observer.observe(referenceCard);
    }

    window.addEventListener("resize", syncFeaturedHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncFeaturedHeight);
    };
  }, []);

  useEffect(() => {
    if (!activeProject || typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject]);

  return (
    <>
      <style>{`
        @font-face {
          font-family: "Poppins";
          src:
            url("/fonts/Poppins-Regular.woff2") format("woff2"),
            url("/fonts/Poppins-Regular.woff") format("woff");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "Poppins";
          src:
            url("/fonts/Poppins-Light.woff2") format("woff2"),
            url("/fonts/Poppins-Light.woff") format("woff");
          font-weight: 300;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "Made Soulmaze";
          src: url("/fonts/MADE-Soulmaze.otf") format("opentype");
          font-weight: 400;
          font-style: normal;
        }

        :root {
          --catalog-bg: #000000;
          --catalog-card: #070707;
          --catalog-line: rgba(255, 255, 255, 0.1);
          --catalog-text: #f6f3ee;
          --catalog-muted: rgba(246, 243, 238, 0.7);
          --catalog-mint: #bff8dc;
          --catalog-rose: #ffb0e6;
          --catalog-yellow: #f4e8ab;
          --catalog-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", "Segoe UI", sans-serif;
          --catalog-display: "Made Soulmaze", "Poppins", sans-serif;
        }

        html,
        body {
          margin: 0;
          background: var(--catalog-bg);
          color: var(--catalog-text);
          font-family: var(--catalog-sans);
          cursor: none;
        }

        * {
          box-sizing: border-box;
        }

        .catalog-page,
        .catalog-page * {
          cursor: none !important;
        }

        a,
        button,
        .catalog-poster-link,
        .catalog-more,
        .catalog-action {
          cursor: none !important;
        }

        .catalog-page {
          min-height: 100vh;
          background: #000;
          padding: 36px 24px 72px;
        }

        .cursor {
          position: fixed;
          width: 14px;
          height: 14px;
          background: var(--catalog-mint);
          border-radius: 50%;
          pointer-events: none;
          z-index: 10110;
          transform: translate(-50%, -50%);
          transition: width 0.25s ease, height 0.25s ease, background 0.25s ease, opacity 0.2s ease;
          mix-blend-mode: difference;
        }

        .cursor.hovering {
          width: 42px;
          height: 42px;
        }

        .catalog-shell {
          width: min(1460px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 52px;
        }

        .catalog-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          padding: 10px 0 0;
          flex-wrap: wrap;
        }

        .catalog-heading {
          display: grid;
          gap: 24px;
        }

        .catalog-eyebrow {
          margin: 0;
          font-size: 0.82rem;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--catalog-mint);
        }

        .catalog-title {
          margin: 0;
          font-size: clamp(3.2rem, 7vw, 5.6rem);
          line-height: 0.9;
          letter-spacing: 0.02em;
          font-family: var(--catalog-display);
          font-weight: 400;
        }

        .catalog-header-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(191, 248, 220, 0.28);
          background: rgba(191, 248, 220, 0.08);
          color: var(--catalog-text);
          text-decoration: none;
          font-weight: 300;
          font-family: var(--catalog-sans);
        }

        .catalog-header-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(191, 248, 220, 0.18);
          background: rgba(191, 248, 220, 0.08);
          color: var(--catalog-mint);
          font-size: 0.82rem;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 26px;
          align-items: start;
        }

        .catalog-mobile-layout {
          display: none;
        }

        .catalog-card {
          display: grid;
          align-content: start;
          gap: 14px;
          min-height: 760px;
          padding: 14px;
          border-radius: 28px;
          background: var(--catalog-card);
          border: 1px solid var(--catalog-line);
        }

        .catalog-card.is-featured {
          height: var(--featured-card-height, auto);
          padding: 14px;
          gap: 10px;
          border-color: rgba(191, 248, 220, 0.28);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .catalog-card.is-tall-preview {
          min-height: 0;
        }

        .catalog-card.tone-mint {
          box-shadow: inset 0 0 0 1px rgba(191, 248, 220, 0.08);
        }

        .catalog-card.tone-rose {
          box-shadow: inset 0 0 0 1px rgba(255, 176, 230, 0.08);
        }

        .catalog-card.tone-yellow {
          box-shadow: inset 0 0 0 1px rgba(244, 232, 171, 0.08);
        }

        .catalog-card.is-featured.tone-mint {
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.35),
            inset 0 0 0 1px rgba(191, 248, 220, 0.12);
        }

        .catalog-card.is-featured .catalog-meta {
          gap: 10px;
          padding: 0 2px 2px;
        }

        .catalog-poster-wrap {
          position: relative;
        }

        .catalog-poster-link,
        .catalog-poster-static {
          display: block;
          padding: 10px;
          border-radius: 22px;
          overflow: hidden;
          background: #050505;
        }

        .catalog-poster {
          display: block;
          width: 100%;
          aspect-ratio: 2 / 3;
          object-fit: contain;
          background: #050505;
          border-radius: 14px;
        }

        .catalog-card:not(.is-featured) .catalog-poster-link,
        .catalog-card:not(.is-featured) .catalog-poster-static {
          padding: 8px 10px;
        }

        .catalog-card:not(.is-featured) .catalog-poster {
          aspect-ratio: 9 / 16;
          object-fit: cover;
          border-radius: 14px;
        }

        .catalog-card:not(.is-featured) .catalog-poster-link,
        .catalog-card:not(.is-featured) .catalog-poster-static {
          padding: 8px 10px;
        }

        .catalog-status {
          position: absolute;
          left: 14px;
          bottom: 14px;
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          backdrop-filter: blur(12px);
          background: rgba(0, 0, 0, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.14);
          font-size: 0.76rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--catalog-mint);
        }

        .catalog-status.is-top {
          top: 14px;
          bottom: auto;
        }

        .catalog-meta {
          display: grid;
          gap: 14px;
          padding: 2px 4px 4px;
        }

        .catalog-meta-top {
          display: grid;
          gap: 12px;
        }

        .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-meta-top {
          grid-template-rows: 34px 82px;
          align-content: start;
        }

        .catalog-status-inline {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(191, 248, 220, 0.18);
          background: rgba(191, 248, 220, 0.08);
          color: var(--catalog-mint);
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 300;
        }

        .catalog-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          color: var(--catalog-muted);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-tags {
          min-height: 82px;
          align-content: flex-start;
        }

        .catalog-tags span {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
        }

        .catalog-tag-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          width: 132px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(191, 248, 220, 0.34);
          background: var(--catalog-mint);
          color: #04110b;
          text-decoration: none;
          font-size: 0.72rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
        }

        .catalog-tag-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(191, 248, 220, 0.12);
          background: #d7ffe9;
          border-color: rgba(191, 248, 220, 0.55);
        }

        .catalog-tags.is-stacked {
          display: grid;
          justify-items: start;
          align-content: start;
        }

        .catalog-pitch {
          margin: 0;
          color: var(--catalog-text);
          line-height: 1.68;
          font-size: 0.98rem;
          font-weight: 400;
          word-break: normal;
          overflow-wrap: normal;
          hyphens: none;
        }

        .catalog-pitch.is-expanded {
          display: block;
        }

        .catalog-card.is-tall-preview .catalog-pitch {
          height: calc(1.68em * 8);
          overflow: hidden;
        }

        .catalog-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .catalog-card.is-tall-preview .catalog-actions {
          min-height: 42px;
        }

        .catalog-more,
        .catalog-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 999px;
          text-decoration: none;
          font-family: var(--catalog-sans);
          font-weight: 300;
          font-size: 0.92rem;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, color 180ms ease,
            border-color 180ms ease;
        }

        .catalog-more {
          border: 0;
          background: rgba(191, 248, 220, 0.1);
          color: var(--catalog-mint);
        }

        .catalog-action {
          border: 1px solid transparent;
          background: var(--catalog-mint);
          color: #04110b;
        }

        .catalog-more:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(191, 248, 220, 0.12);
          background: rgba(191, 248, 220, 0.16);
        }

        .catalog-action:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 16px 36px rgba(191, 248, 220, 0.22);
          background: #d7ffe9;
          border-color: rgba(191, 248, 220, 0.55);
        }

        .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-pitch {
          height: calc(1.68em * 6);
          overflow: hidden;
        }

        .catalog-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10040;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(18px);
          cursor: none !important;
        }

        .catalog-modal-backdrop * {
          cursor: none !important;
        }

        .catalog-modal {
          width: min(760px, 100%);
          max-height: min(86vh, 920px);
          overflow: auto;
          padding: 22px;
          border-radius: 30px;
          border: 1px solid rgba(191, 248, 220, 0.22);
          background: #060606;
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.48),
            inset 0 0 0 1px rgba(191, 248, 220, 0.08);
        }

        .catalog-modal-head {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .catalog-modal-title {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 0.92;
          letter-spacing: 0.02em;
          font-family: var(--catalog-display);
          font-weight: 400;
        }

        .catalog-modal-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid rgba(191, 248, 220, 0.18);
          background: rgba(191, 248, 220, 0.08);
          color: var(--catalog-mint);
          font-family: var(--catalog-sans);
          font-size: 0.84rem;
          font-weight: 300;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .catalog-modal-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
          color: var(--catalog-muted);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .catalog-modal-tags span {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
        }

        .catalog-modal-copy {
          margin: 0;
          color: var(--catalog-text);
          line-height: 1.72;
          font-size: 1rem;
          white-space: pre-wrap;
        }

        .catalog-modal-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        @media (min-width: 1280px) {
          .catalog-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }

          .catalog-card.is-featured {
            grid-column: span 2;
            height: var(--featured-card-height, auto);
          }

          .catalog-card.is-featured .catalog-poster-link,
          .catalog-card.is-featured .catalog-poster-static {
            height: calc(var(--featured-card-height, 760px) - 158px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 10px;
          }

          .catalog-card.is-featured .catalog-poster {
            width: 100%;
            height: 100%;
            aspect-ratio: auto;
            object-fit: cover;
            object-position: center center;
          }
        }

        @media (max-width: 760px) {
          html,
          body {
            cursor: auto;
          }

          .catalog-page,
          .catalog-page * {
            cursor: auto !important;
          }

          .catalog-page {
            padding: 18px 14px 42px;
          }

          .catalog-shell {
            gap: 24px;
          }

          .catalog-header {
            align-items: start;
            flex-direction: column;
            gap: 14px;
            padding-top: 0;
          }

          .catalog-heading {
            gap: 14px;
          }

          .catalog-title {
            font-size: clamp(2.5rem, 15vw, 3.6rem);
          }

          .catalog-eyebrow {
            font-size: 0.72rem;
            letter-spacing: 0.18em;
          }

          .catalog-header-link {
            width: 100%;
            min-height: 42px;
          }

          .catalog-header-badge {
            min-height: 40px;
            padding: 0 14px;
            font-size: 0.72rem;
            letter-spacing: 0.14em;
          }

          .catalog-grid {
            display: none;
          }

          .catalog-mobile-layout {
            display: grid;
            gap: 22px;
          }

          .catalog-mobile-hero {
            display: grid;
            gap: 14px;
          }

          .catalog-mobile-hero-poster {
            display: block;
            padding: 10px;
            border-radius: 24px;
            background: #050505;
            border: 1px solid rgba(191, 248, 220, 0.14);
            overflow: hidden;
          }

          .catalog-mobile-hero-poster img {
            display: block;
            width: 100%;
            height: auto;
            border-radius: 18px;
            object-fit: contain;
            background: #050505;
          }

          .catalog-mobile-hero-meta {
            display: grid;
            gap: 10px;
          }

          .catalog-mobile-hero-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .catalog-mobile-hero-tags span {
            display: inline-flex;
            align-items: center;
            min-height: 32px;
            padding: 0 12px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.04);
            color: var(--catalog-muted);
            font-size: 0.68rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .catalog-mobile-hero-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .catalog-mobile-shelf {
            display: grid;
            gap: 12px;
          }

          .catalog-mobile-shelf-title {
            margin: 0;
            color: var(--catalog-mint);
            font-size: 0.76rem;
            font-weight: 300;
            letter-spacing: 0.22em;
            text-transform: uppercase;
          }

          .catalog-mobile-row {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 34vw;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 8px;
            scroll-snap-type: x proximity;
            -webkit-overflow-scrolling: touch;
          }

          .catalog-mobile-row::-webkit-scrollbar {
            display: none;
          }

          .catalog-mobile-tile {
            display: grid;
            gap: 8px;
            border: 0;
            padding: 0;
            background: transparent;
            text-align: left;
            scroll-snap-align: start;
          }

          .catalog-mobile-tile-frame {
            display: block;
            padding: 8px;
            border-radius: 20px;
            background: #050505;
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: hidden;
          }

          .catalog-mobile-tile-poster {
            display: block;
            width: 100%;
            height: auto;
            aspect-ratio: 9 / 16;
            object-fit: cover;
            border-radius: 14px;
          }

          .catalog-mobile-tile-status {
            color: var(--catalog-muted);
            font-size: 0.62rem;
            font-weight: 300;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .catalog-more,
          .catalog-action {
            min-height: 38px;
            padding: 0 14px;
            font-size: 0.76rem;
            letter-spacing: 0.09em;
          }

          .catalog-modal-backdrop {
            padding: 16px;
          }

          .catalog-modal {
            padding: 18px;
            border-radius: 24px;
          }

          .catalog-modal-head {
            align-items: stretch;
            flex-direction: column;
          }

          .cursor {
            display: none;
          }
        }
      `}</style>

      <div className="cursor" id="cursor" />

      <main
        className="catalog-page"
        style={featuredHeight ? { "--featured-card-height": `${featuredHeight}px` } : undefined}
      >
        <div className="catalog-shell">
          <header className="catalog-header">
            <div className="catalog-heading">
              {page.eyebrow ? <p className="catalog-eyebrow">{page.eyebrow}</p> : null}
              <h1 className="catalog-title">{page.title}</h1>
            </div>

            {page.preferencesHref ? (
              <Link className="catalog-header-link" href={page.preferencesHref}>
                Affiner mes recherches
              </Link>
            ) : page.headerBadge ? (
              <span className="catalog-header-badge">{page.headerBadge}</span>
            ) : null}
          </header>

          <section className="catalog-mobile-layout">
            {featuredProject ? (
              <article className="catalog-mobile-hero">
                <Link className="catalog-mobile-hero-poster" href={featuredProject.href || "#"}>
                  <img alt={featuredProject.title} src={featuredProject.posterSrc} />
                </Link>
                <div className="catalog-mobile-hero-meta">
                  <div className="catalog-mobile-hero-tags">
                    <span>{featuredProject.status}</span>
                    <span>{featuredProject.genre}</span>
                    <span>{featuredProject.format}</span>
                  </div>
                  <div className="catalog-mobile-hero-actions">
                    {featuredProject.href ? (
                      <Link className="catalog-action" href={featuredProject.href}>
                        Voir le projet
                      </Link>
                    ) : null}
                    <button className="catalog-more" onClick={() => setActiveProject(featuredProject)} type="button">
                      Synopsis
                    </button>
                  </div>
                </div>
              </article>
            ) : null}

            {shelfProjects.length ? (
              <section className="catalog-mobile-shelf">
                <h2 className="catalog-mobile-shelf-title">A decouvrir</h2>
                <div className="catalog-mobile-row">
                  {shelfProjects.map((project) => (
                    <MobileShelfTile key={project.id} onOpen={setActiveProject} project={project} />
                  ))}
                </div>
              </section>
            ) : null}
          </section>

          <section className="catalog-grid">
            {page.projects.map((project) => (
              <ProjectCard
                key={project.id}
                featuredStatusPlacement={page.featuredStatusPlacement}
                project={project}
                onReadMore={setActiveProject}
              />
            ))}
          </section>
        </div>
      </main>

      {activeProject ? (
        <div
          aria-hidden="true"
          className="catalog-modal-backdrop"
          onClick={() => setActiveProject(null)}
        >
          <div
            aria-labelledby="catalog-modal-title"
            aria-modal="true"
            className="catalog-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="catalog-modal-head">
              <h2 className="catalog-modal-title" id="catalog-modal-title">
                {activeProject.title}
              </h2>
              <button className="catalog-modal-close" onClick={() => setActiveProject(null)} type="button">
                Fermer
              </button>
            </div>

            <div className="catalog-modal-tags">
              <span>{activeProject.status}</span>
              <span>{activeProject.genre}</span>
              <span>{activeProject.format}</span>
            </div>

            <p className="catalog-modal-copy">{activeProject.shortPitch}</p>
            {activeProject.href ? (
              <div className="catalog-modal-actions">
                <Link className="catalog-action" href={activeProject.href} onClick={() => setActiveProject(null)}>
                  Voir le projet
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
