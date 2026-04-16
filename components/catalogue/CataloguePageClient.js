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

function chunkItems(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function ProjectCard({
  project,
  featuredStatusPlacement = "bottom",
  onReadMore,
  showTabletReadMore = false,
  tabletSharedHeight = null,
  isTabletCompactRange = false,
  useTabletPosterVariant = false,
}) {
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
  const articleStyle =
    tabletSharedHeight && isTabletCompactRange && project.id === "maree-noire"
      ? { height: `${tabletSharedHeight}px`, minHeight: `${tabletSharedHeight}px`, maxHeight: `${tabletSharedHeight}px` }
      : undefined;
  const resolvedPosterSrc =
    useTabletPosterVariant && !project.featured && project.tabletPosterSrc ? project.tabletPosterSrc : project.posterSrc;
  const posterStyle =
    project.id === "maree-noire" && isTabletCompactRange
      ? {
          display: "block",
          width: "100%",
          height: "100%",
          aspectRatio: "auto",
          objectFit: "cover",
          borderRadius: "24px",
          clipPath: "inset(0 round 24px)",
        }
      : undefined;
  const posterFrameStyle =
    project.id === "maree-noire" && isTabletCompactRange
      ? {
          borderRadius: "24px",
          overflow: "hidden",
          display: "block",
          background: "#050505",
          padding: "6px",
        }
      : undefined;
  const posterWrapStyle =
    project.id === "maree-noire" && isTabletCompactRange
      ? {
          borderRadius: "24px",
          overflow: "hidden",
          background: "#050505",
        }
      : undefined;

  return (
    <article className={cardClassName} data-project-id={project.id} style={articleStyle}>
      <div className="catalog-poster-wrap" style={posterWrapStyle}>
        {project.href ? (
          <Link
            aria-label={`Voir le projet ${project.title}`}
            className="catalog-poster-link"
            href={project.href}
            style={posterFrameStyle}
          >
            <img
              alt={project.title}
              className="catalog-poster"
              src={resolvedPosterSrc}
              style={posterStyle}
            />
          </Link>
        ) : (
          <div
            aria-label={project.title}
            className="catalog-poster-static"
            role="img"
            style={posterFrameStyle}
          >
            <img
              alt={project.title}
              className="catalog-poster"
              src={resolvedPosterSrc}
              style={posterStyle}
            />
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
          {canExpand || showTabletReadMore ? (
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

function MobileProjectCard({ project, onReadMore }) {
  const tagsClassName = `catalog-tags${project.stackTags ? " is-stacked" : ""}`;

  if (project.featured) {
    return (
      <article className="catalog-mobile-card is-featured" data-project-id={project.id}>
        <div className="catalog-mobile-featured-poster-wrap">
          {project.href ? (
            <Link aria-label={`Voir le projet ${project.title}`} className="catalog-mobile-poster-link" href={project.href}>
              <span className="catalog-mobile-poster-frame is-featured">
                <img alt={project.title} className="catalog-mobile-poster is-featured" src={project.posterSrc} />
                <span className="catalog-mobile-status is-featured">{project.status}</span>
              </span>
            </Link>
          ) : (
            <div aria-label={project.title} className="catalog-mobile-poster-static" role="img">
              <span className="catalog-mobile-poster-frame is-featured">
                <img alt={project.title} className="catalog-mobile-poster is-featured" src={project.posterSrc} />
                <span className="catalog-mobile-status is-featured">{project.status}</span>
              </span>
            </div>
          )}
        </div>

        <div className="catalog-mobile-meta is-featured">
          <div className={`${tagsClassName} is-featured-line`}>
            <span>{project.genre}</span>
            <span>{project.format}</span>
            {project.href ? (
              <Link className="catalog-tag-action" href={project.href}>
                VOIR LE PROJET
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="catalog-mobile-card is-compact" data-project-id={project.id}>
      <button
        aria-label={`Ouvrir la fiche ${project.title}`}
        className="catalog-mobile-poster-button"
        onClick={() => onReadMore?.(project)}
        type="button"
      >
        <span className="catalog-mobile-poster-frame">
          <img alt={project.title} className="catalog-mobile-poster" src={project.posterSrc} />
        </span>
      </button>
    </article>
  );
}

export default function CataloguePageClient({ page }) {
  const [featuredHeight, setFeaturedHeight] = useState(null);
  const [tabletOpiumHeight, setTabletOpiumHeight] = useState(null);
  const [tabletWideOpiumHeight, setTabletWideOpiumHeight] = useState(null);
  const [tabletMareeNoireHeight, setTabletMareeNoireHeight] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [isTabletCompactRange, setIsTabletCompactRange] = useState(false);
  const [useTabletPosterVariant, setUseTabletPosterVariant] = useState(false);
  const [isTabletWideRange, setIsTabletWideRange] = useState(false);
  const featuredProject = page.projects.find((project) => project.featured) || null;
  const shelfProjects = page.projects.filter((project) => !project.featured);
  const mobileRows = chunkItems(shelfProjects, 3);

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
      const referenceCard = document.querySelector('.catalog-grid [data-project-id="consentement-mutuel"]');
      if (!referenceCard) {
        return;
      }

      const nextHeight = Math.round(referenceCard.getBoundingClientRect().height);
      setFeaturedHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    syncFeaturedHeight();

    const referenceCard = document.querySelector('.catalog-grid [data-project-id="consentement-mutuel"]');
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
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncTabletWideRange = () => {
      setIsTabletWideRange(window.innerWidth >= 850 && window.innerWidth <= 1125);
    };

    syncTabletWideRange();
    window.addEventListener("resize", syncTabletWideRange);

    return () => {
      window.removeEventListener("resize", syncTabletWideRange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const opiumGridCard = document.querySelector('.catalog-grid [data-project-id="opium"]');
    if (!opiumGridCard) {
      return undefined;
    }

    const syncTabletWideOpiumHeight = () => {
      if (window.innerWidth < 850 || window.innerWidth > 1125) {
        setTabletWideOpiumHeight((currentHeight) => (currentHeight === null ? currentHeight : null));
        return;
      }

      const nextHeight = Number(opiumGridCard.getBoundingClientRect().height.toFixed(2));
      setTabletWideOpiumHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    syncTabletWideOpiumHeight();

    const observer =
      "ResizeObserver" in window ? new ResizeObserver(syncTabletWideOpiumHeight) : null;

    observer?.observe(opiumGridCard);
    window.addEventListener("resize", syncTabletWideOpiumHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncTabletWideOpiumHeight);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncTabletOpiumHeight = () => {
      const opiumCard = document.querySelector('.catalog-grid [data-project-id="opium"]');
      if (!opiumCard) {
        return;
      }

      const nextHeight = Math.round(opiumCard.getBoundingClientRect().height);
      setTabletOpiumHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    syncTabletOpiumHeight();

    const opiumCard = document.querySelector('.catalog-grid [data-project-id="opium"]');
    const observer = opiumCard && "ResizeObserver" in window ? new ResizeObserver(syncTabletOpiumHeight) : null;

    if (opiumCard && observer) {
      observer.observe(opiumCard);
    }

    window.addEventListener("resize", syncTabletOpiumHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncTabletOpiumHeight);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncTabletMareeNoireHeight = () => {
      const mareeNoireCard = document.querySelector('.catalog-grid [data-project-id="maree-noire"]');
      if (!mareeNoireCard) {
        return;
      }

      const nextHeight = Math.round(mareeNoireCard.getBoundingClientRect().height);
      setTabletMareeNoireHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    syncTabletMareeNoireHeight();

    const mareeNoireCard = document.querySelector('.catalog-grid [data-project-id="maree-noire"]');
    const observer =
      mareeNoireCard && "ResizeObserver" in window ? new ResizeObserver(syncTabletMareeNoireHeight) : null;

    if (mareeNoireCard && observer) {
      observer.observe(mareeNoireCard);
    }

    window.addEventListener("resize", syncTabletMareeNoireHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncTabletMareeNoireHeight);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncTabletCompactRange = () => {
      setIsTabletCompactRange(window.innerWidth >= 500 && window.innerWidth <= 849);
    };

    syncTabletCompactRange();
    window.addEventListener("resize", syncTabletCompactRange);

    return () => {
      window.removeEventListener("resize", syncTabletCompactRange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncTabletPosterVariantRange = () => {
      setUseTabletPosterVariant(window.innerWidth >= 500 && window.innerWidth <= 849);
    };

    syncTabletPosterVariantRange();
    window.addEventListener("resize", syncTabletPosterVariantRange);

    return () => {
      window.removeEventListener("resize", syncTabletPosterVariantRange);
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

  const pageStyle = {};
  if (featuredHeight) {
    pageStyle["--featured-card-height"] = `${featuredHeight}px`;
  }
  if (tabletOpiumHeight) {
    pageStyle["--catalog-tablet-opium-height"] = `${tabletOpiumHeight}px`;
  }
  if (tabletWideOpiumHeight) {
    pageStyle["--catalog-wide-opium-height"] = `${tabletWideOpiumHeight}px`;
  }
  const tabletSharedHeight =
    isTabletCompactRange && tabletOpiumHeight && tabletMareeNoireHeight
      ? Math.max(tabletOpiumHeight, tabletMareeNoireHeight)
      : null;

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

        @media (max-width: 499px) {
          html,
          body {
            cursor: auto;
          }

          .catalog-page,
          .catalog-page * {
            cursor: auto !important;
          }

          .catalog-page {
            padding: 22px 16px 48px;
          }

          .catalog-title {
            max-width: 92%;
            font-size: clamp(1.8rem, 10.8vw, 2.9rem);
            line-height: 0.92;
            margin: 0 auto;
            text-align: center;
          }

          .catalog-header {
            align-items: start;
            flex-direction: column;
          }

          .catalog-heading {
            justify-items: center;
            width: 100%;
          }

          .catalog-eyebrow {
            text-align: center;
          }

          .catalog-header-link {
            width: 100%;
          }

          .catalog-grid {
            display: none;
          }

          .catalog-mobile-layout {
            display: grid;
            gap: 24px;
          }

          .catalog-mobile-card {
            display: grid;
            gap: 12px;
            min-width: 0;
          }

          .catalog-mobile-card.is-featured {
            gap: 10px;
          }

          .catalog-mobile-card.is-compact {
            min-width: 0;
            max-width: none;
          }

          .catalog-mobile-hero {
            display: grid;
            gap: 12px;
          }

          .catalog-mobile-list {
            display: grid;
            gap: 16px;
          }

          .catalog-mobile-row {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            align-items: start;
          }

          .catalog-mobile-poster-link,
          .catalog-mobile-poster-static {
            display: block;
          }

          .catalog-mobile-poster-button {
            display: block;
            width: 100%;
            border: 0;
            padding: 0;
            background: transparent;
            text-align: left;
          }

          .catalog-mobile-poster-frame {
            position: relative;
            display: block;
            padding: 8px;
            border-radius: 20px;
            background: #050505;
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: hidden;
          }

          .catalog-mobile-poster-frame.is-featured {
            padding: 10px;
            border-radius: 24px;
            border-color: rgba(191, 248, 220, 0.2);
          }

          .catalog-mobile-poster {
            display: block;
            width: 100%;
            aspect-ratio: 9 / 16;
            object-fit: cover;
            border-radius: 14px;
          }

        .catalog-mobile-poster.is-featured {
          aspect-ratio: 2 / 3;
          border-radius: 18px;
        }

          .catalog-mobile-card.is-compact .catalog-mobile-poster {
            aspect-ratio: 9 / 16;
          }

          .catalog-mobile-status {
            display: inline-flex;
            align-items: center;
            width: fit-content;
            min-height: 30px;
            padding: 0 10px;
            border-radius: 999px;
            border: 1px solid rgba(191, 248, 220, 0.18);
            background: rgba(0, 0, 0, 0.74);
            color: var(--catalog-mint);
            font-size: 0.7rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .catalog-mobile-status.is-featured {
            position: absolute;
            left: 16px;
            top: 16px;
            z-index: 2;
          }

          .catalog-mobile-meta {
            display: grid;
            gap: 10px;
          }

          .catalog-mobile-meta .catalog-tags,
          .catalog-mobile-meta .catalog-tags span {
            font-size: 0.68rem;
            letter-spacing: 0.1em;
          }

          .catalog-mobile-meta .catalog-tags {
            min-height: 0;
            align-items: center;
          }

          .catalog-mobile-meta .catalog-tags span {
            min-height: 30px;
            padding: 0 10px;
          }

          .catalog-mobile-meta .catalog-tags.is-featured-line {
            flex-wrap: nowrap;
            gap: 8px;
            align-items: center;
            overflow-x: auto;
            padding-bottom: 2px;
            -webkit-overflow-scrolling: touch;
          }

          .catalog-mobile-meta .catalog-tags.is-featured-line::-webkit-scrollbar {
            display: none;
          }

          .catalog-mobile-meta .catalog-tags.is-featured-line span {
            white-space: nowrap;
          }

          .catalog-mobile-meta .catalog-tag-action {
            flex: 0 1 auto;
            min-width: 112px;
            width: auto;
            min-height: 30px;
            padding: 0 10px;
            font-size: 0.64rem;
            letter-spacing: 0.1em;
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

        @media (max-width: 320px) {
          .catalog-mobile-meta.is-featured {
            gap: 8px;
          }

          .catalog-mobile-meta .catalog-tags.is-featured-line {
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: flex-start;
            overflow-x: visible;
            padding-bottom: 0;
            gap: 6px;
          }

          .catalog-mobile-meta .catalog-tags.is-featured-line span {
            flex: 0 1 auto;
          }

          .catalog-mobile-meta .catalog-tag-action {
            flex: 0 0 auto;
            width: auto;
            min-width: 0;
            max-width: 100%;
            padding: 0 10px;
          }
        }

        @media (max-width: 375px) {
          .catalog-mobile-meta.is-featured {
            gap: 8px;
          }

          .catalog-mobile-meta .catalog-tags.is-featured-line {
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: flex-start;
            overflow-x: visible;
            padding-bottom: 0;
            gap: 6px;
          }

          .catalog-mobile-meta .catalog-tags.is-featured-line span {
            flex: 0 1 auto;
          }

          .catalog-mobile-meta .catalog-tag-action {
            flex: 0 0 auto;
            width: auto;
            min-width: 0;
            max-width: 100%;
            padding: 0 10px;
          }
        }

        @media (max-width: 500px) {
          .catalog-mobile-poster-button {
            touch-action: manipulation;
          }

          .catalog-mobile-poster-button:active .catalog-mobile-poster-frame,
          .catalog-mobile-poster-button:focus-visible .catalog-mobile-poster-frame {
            border-color: rgba(191, 248, 220, 0.42);
            box-shadow:
              0 10px 24px rgba(0, 0, 0, 0.28),
              inset 0 0 0 1px rgba(191, 248, 220, 0.12);
            filter: brightness(1.04);
            transform: scale(0.992);
          }

          .catalog-mobile-poster-button:focus-visible {
            outline: none;
          }
        }

        @media (min-width: 500px) and (max-width: 849px) {
          .catalog-page {
            padding: 36px 18px 72px;
          }

          .catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }

          .catalog-header {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: end;
            gap: 20px;
          }

          .catalog-heading {
            grid-column: 2;
            justify-items: center;
            width: auto;
          }

          .catalog-title {
            margin: 0 auto;
            text-align: center;
          }

          .catalog-header-link,
          .catalog-header-badge {
            grid-column: 3;
            justify-self: end;
          }

          .catalog-card.is-featured .catalog-poster-link,
          .catalog-card.is-featured .catalog-poster-static {
            border-radius: 24px;
          }

          .catalog-card.is-featured .catalog-poster {
            border-radius: 18px;
          }

          .catalog-card.is-featured[data-project-id="maree-noire"] {
            grid-column: 1 / -1;
          }

          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster-wrap {
            width: min(100%, 692px);
            margin: 0 auto;
          }

          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster-link,
          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster-static {
            border-radius: 24px;
            overflow: hidden;
          }

          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster {
            display: block;
            object-position: center center;
            border-radius: 18px !important;
            clip-path: inset(0 round 18px);
          }

          .catalog-card.is-featured {
            height: var(--catalog-tablet-opium-height, var(--featured-card-height, auto));
            min-height: var(--catalog-tablet-opium-height, var(--featured-card-height, 760px));
          }

          .catalog-card:not(.is-featured) {
            --compact-card-padding: 10px;
            --compact-card-gap: 10px;
            --compact-frame-inset: 8px;
            --compact-stack-gap: 8px;
            --compact-section-gap: 10px;
            height: var(--compact-card-height);
            min-height: var(--compact-card-height);
            max-height: var(--compact-card-height);
            padding: var(--compact-card-padding);
            grid-template-rows: var(--compact-poster-height) minmax(0, 1fr);
            gap: var(--compact-card-gap);
          }

          .catalog-card:not(.is-featured) .catalog-poster-wrap {
            min-height: 0;
            height: 100%;
            position: relative;
          }

          .catalog-card:not(.is-featured) .catalog-poster-link,
          .catalog-card:not(.is-featured) .catalog-poster-static {
            position: absolute;
            inset: var(--compact-frame-inset);
            display: block;
            padding: 0;
            border-radius: 22px;
            overflow: hidden;
            background: #050505;
          }

          .catalog-card:not(.is-featured) .catalog-poster {
            width: 100%;
            height: 100%;
            max-height: none;
            aspect-ratio: auto;
            object-fit: cover;
            object-position: center center;
            border-radius: 18px;
            clip-path: inset(0 round 18px);
          }

          .catalog-card:not(.is-featured) .catalog-meta {
            display: flex;
            flex-direction: column;
            min-height: 0;
            height: 100%;
            gap: var(--compact-section-gap);
            padding: 0;
            box-sizing: border-box;
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-meta-top {
            grid-template-rows: none;
            align-content: start;
          }

          .catalog-card:not(.is-featured) .catalog-status-inline {
            min-height: 34px;
          }

          .catalog-card:not(.is-featured) .catalog-tags {
            display: grid;
            justify-items: start;
            align-content: start;
            gap: var(--compact-stack-gap);
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-tags {
            min-height: 0;
          }

          .catalog-card:not(.is-featured) .catalog-tags span {
            min-height: 34px;
          }

          .catalog-card.is-tall-preview .catalog-poster {
            border-radius: 18px;
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-pitch,
          .catalog-card.is-tall-preview .catalog-pitch {
            display: -webkit-box;
            overflow: hidden;
            min-height: 0;
            -webkit-box-orient: vertical;
            flex: 0 0 auto;
          }

          .catalog-card:not(.is-featured) .catalog-actions {
            margin-top: 0;
            min-height: 42px;
            align-self: flex-start;
            flex: 0 0 auto;
          }
        }

        @media (min-width: 500px) and (max-width: 621px) {
          .catalog-page {
            padding-inline: 16px;
          }

          .catalog-grid {
            gap: 18px;
          }

          .catalog-card:not(.is-featured) {
            --compact-poster-height: calc(80vw - 81.6px);
            --compact-card-height: clamp(760px, calc(var(--compact-poster-height) + 360px), 780px);
            --compact-card-padding: 10px;
            --compact-card-gap: 10px;
          }
        }

        @media (min-width: 622px) and (max-width: 849px) {
          .catalog-page {
            padding-inline: 18px;
          }

          .catalog-grid {
            gap: 20px;
          }

          .catalog-card:not(.is-featured) {
            --compact-poster-height: calc(80vw - 92.8px);
            --compact-card-height: clamp(820px, calc(var(--compact-poster-height) + 380px), 940px);
            --compact-card-padding: 12px;
            --compact-card-gap: 10px;
          }
        }

        @media (min-width: 500px) and (max-width: 550px) {
          .catalog-card:not(.is-featured) {
            --compact-card-height: clamp(708px, calc(var(--compact-poster-height) + 334px), 724px);
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-pitch,
          .catalog-card.is-tall-preview .catalog-pitch {
            height: calc(1.68em * 5);
            -webkit-line-clamp: 5;
          }
        }

        @media (min-width: 551px) and (max-width: 559px) {
          .catalog-card:not(.is-featured) {
            --compact-card-height: clamp(720px, calc(var(--compact-poster-height) + 346px), 736px);
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-pitch,
          .catalog-card.is-tall-preview .catalog-pitch {
            height: calc(1.68em * 5);
            -webkit-line-clamp: 5;
          }
        }

        @media (min-width: 560px) and (max-width: 621px) {
          .catalog-card:not(.is-featured) {
            --compact-card-height: clamp(730px, calc(var(--compact-poster-height) + 324px), 742px);
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-pitch,
          .catalog-card.is-tall-preview .catalog-pitch {
            height: calc(1.68em * 4);
            -webkit-line-clamp: 4;
          }
        }

        @media (min-width: 622px) and (max-width: 639px) {
          .catalog-card:not(.is-featured) {
            --compact-card-height: clamp(744px, calc(var(--compact-poster-height) + 324px), 752px);
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-pitch,
          .catalog-card.is-tall-preview .catalog-pitch {
            height: calc(1.68em * 4);
            -webkit-line-clamp: 4;
          }
        }

        @media (min-width: 640px) and (max-width: 719px) {
          .catalog-card:not(.is-featured) {
            --compact-card-height: clamp(760px, calc(var(--compact-poster-height) + 298px), 805px);
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-pitch,
          .catalog-card.is-tall-preview .catalog-pitch {
            height: calc(1.68em * 3);
            -webkit-line-clamp: 3;
          }
        }

        @media (min-width: 720px) and (max-width: 849px) {
          .catalog-card:not(.is-featured) {
            --compact-card-height: clamp(790px, calc(var(--compact-poster-height) + 272px), 858px);
          }

          .catalog-card:not(.is-featured):not(.is-tall-preview) .catalog-pitch,
          .catalog-card.is-tall-preview .catalog-pitch {
            height: calc(1.68em * 2);
            -webkit-line-clamp: 2;
          }
        }

        @media (min-width: 601px) and (max-width: 849px) {
          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster-wrap {
            width: min(100%, clamp(520px, 72vw, 620px));
            margin: 0 auto;
          }

          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster {
            object-position: center 52%;
          }
        }

        @media (min-width: 850px) and (max-width: 1125px) {
          .catalog-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .catalog-card.is-featured[data-project-id="maree-noire"] {
            grid-column: span 2;
            height: var(--catalog-wide-opium-height, auto);
            min-height: var(--catalog-wide-opium-height, 760px);
            max-height: var(--catalog-wide-opium-height, 760px);
          }

          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster-link,
          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster-static {
            height: calc(var(--catalog-wide-opium-height, 760px) - 158px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 10px;
            border-radius: 22px;
            overflow: hidden;
          }

          .catalog-card.is-featured[data-project-id="maree-noire"] .catalog-poster {
            width: 100%;
            height: 100%;
            aspect-ratio: auto;
            object-fit: cover;
            object-position: center 36%;
            border-radius: 18px !important;
            clip-path: inset(0 round 18px);
          }
        }
      `}</style>

      <div className="cursor" id="cursor" />

      <main className="catalog-page" style={Object.keys(pageStyle).length ? pageStyle : undefined}>
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
              <section className="catalog-mobile-hero">
                <MobileProjectCard onReadMore={setActiveProject} project={featuredProject} />
              </section>
            ) : null}

            {shelfProjects.length ? (
              <section className="catalog-mobile-list">
                {mobileRows.map((row, index) => (
                  <div className="catalog-mobile-row" key={`mobile-row-${index}`}>
                    {row.map((project) => (
                      <MobileProjectCard key={project.id} onReadMore={setActiveProject} project={project} />
                    ))}
                  </div>
                ))}
              </section>
            ) : null}
          </section>

          <section className="catalog-grid">
            {page.projects.map((project) => (
              <ProjectCard
                key={project.id}
                featuredStatusPlacement={page.featuredStatusPlacement}
                showTabletReadMore={(isTabletCompactRange || isTabletWideRange) && project.id === "consentement-mutuel"}
                tabletSharedHeight={tabletSharedHeight}
                isTabletCompactRange={isTabletCompactRange}
                useTabletPosterVariant={useTabletPosterVariant}
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
