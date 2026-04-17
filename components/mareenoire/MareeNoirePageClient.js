"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";
import { PANEL_PUBLIC_TEST_PATH } from "../../lib/public-paths";

function RichText({ className, html }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function IroiseHook({ html }) {
  return <RichText className="mn-feature-hook mn-feature-hook-iroise" html={html} />;
}

function stripHtml(value) {
  return (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatAudioTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const wholeSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getCurrentChapterIndex(chapters, currentTime) {
  if (!chapters?.length) {
    return -1;
  }

  let activeIndex = 0;

  for (let index = 0; index < chapters.length; index += 1) {
    if (currentTime >= chapters[index].time) {
      activeIndex = index;
    } else {
      break;
    }
  }

  return activeIndex;
}

function MetaPill({ children, tone = "default" }) {
  return <span className={`mn-pill ${tone === "mint" ? "mn-pill-mint" : ""}`}>{children}</span>;
}

function SectionLead({ kicker, title, paragraphs = [], align = "left" }) {
  return (
    <div className={`mn-section-lead mn-align-${align}`}>
      {kicker ? <p className="mn-section-kicker">{kicker}</p> : null}
      <RichText className="mn-section-title" html={title} />
      <div className="mn-copy-stack">
        {paragraphs.map((paragraph, index) => (
          <p className="mn-body" key={`${kicker ?? title}-${index}`}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function SplitFeature({ item }) {
  const itemName = stripHtml(item.nameHtml || item.name);
  const isIroise = itemName === "IROISE";

  return (
    <section className={`mn-feature-grid ${item.reverse ? "mn-feature-reverse" : ""} ${isIroise ? "" : "mn-character-card"}`}>
      <div className={`mn-media-cell ${isIroise ? "mn-media-cell-iroise" : "mn-media-cell-character"}`}>
        {item.imageSrc ? (
          <img alt={stripHtml(item.nameHtml || item.name)} className="mn-media-image" src={item.imageSrc} />
        ) : null}
      </div>
      <div className={`mn-copy-cell ${isIroise ? "mn-copy-cell-iroise" : "mn-copy-cell-character"}`}>
        <div className="mn-section-line">
          <span>{item.kicker}</span>
        </div>
        <RichText className="mn-character-name" html={item.nameHtml} />
        <div className="mn-meta-grid">
          {item.metaGroups.map((group, index) => (
            <div className="mn-meta-row" key={`${item.nameHtml}-${index}`}>
              {group.map((value) => (
                <MetaPill key={value} tone="mint">
                  {value}
                </MetaPill>
              ))}
            </div>
          ))}
        </div>
        {isIroise ? <IroiseHook html={item.hookHtml} /> : <RichText className="mn-feature-hook mn-feature-hook-character" html={item.hookHtml} />}
        <div className={`mn-copy-stack ${isIroise ? "mn-copy-stack-centered" : "mn-copy-stack-character"}`}>
          {item.paragraphs.map((paragraph, index) => (
            <p className="mn-body" key={`${item.nameHtml}-${index}`}>
              <span dangerouslySetInnerHTML={{ __html: paragraph }} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfileFeature({ item }) {
  return (
    <section className={`mn-feature-grid ${item.reverse ? "mn-feature-reverse" : ""} mn-character-card`}>
      <div className="mn-media-cell mn-media-cell-character">
        {item.imageSrc ? <img alt={item.name} className="mn-media-image" src={item.imageSrc} /> : null}
      </div>
      <div className="mn-copy-cell mn-copy-cell-character">
        <div className="mn-section-line">
          <span>Les personnages</span>
        </div>
        <h3 className="mn-profile-name">{item.name}</h3>
        <div className="mn-meta-row">
          <MetaPill tone="mint">{item.age}</MetaPill>
          {item.tags.map((value) => (
            <MetaPill key={value} tone="mint">
              {value}
            </MetaPill>
          ))}
        </div>
        <RichText className="mn-feature-hook mn-feature-hook-character" html={item.introHtml} />
        <div className="mn-copy-stack mn-copy-stack-character">
          {item.paragraphs.map((paragraph, index) => (
            <p className="mn-body" key={`${item.name}-${index}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function LongArcSplit({ item }) {
  const hasLockedLines = item.titleHtml?.includes("mn-title-line");
  const blockKeyClass = item.blockKey ? `mn-story-block-${item.blockKey}` : "";

  return (
    <section className={`mn-feature-grid mn-story-split ${item.reverse ? "mn-feature-reverse" : ""}`}>
      <div className="mn-media-cell mn-media-cell-story">
        {item.imageSrc ? <img alt={item.kicker} className="mn-media-image" src={item.imageSrc} /> : null}
      </div>
      <div className={`mn-copy-cell mn-copy-cell-story ${blockKeyClass}`.trim()}>
        <p className="mn-section-kicker">{item.kicker}</p>
        <RichText className={`mn-split-title ${hasLockedLines ? "mn-split-title-lockup" : ""}`} html={item.titleHtml} />
        <div className="mn-copy-stack">
          {item.paragraphs.map((paragraph, index) => (
            <p className="mn-body" key={`${item.kicker}-${index}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MareeNoirePageClient({ page }) {
  useDesktopCursor({
    hoverSelector: "button, a, video, .mn-player-overlay, input[type='range']",
    spotlightSelector:
      ".mn-brief-card, .mn-intro-card, .mn-audio-card, .mn-copy-cell, .mn-media-cell, .mn-quote-card, .mn-pitch-card, .mn-audio-sticky",
  });

  const audioRef = useRef(null);
  const audioSectionRef = useRef(null);
  const audioData = page.audio;
  const audioChapters = audioData?.chapters ?? [];
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(audioData?.durationSeconds ?? 0);
  const [audioHasStarted, setAudioHasStarted] = useState(false);
  const [audioStickyVisible, setAudioStickyVisible] = useState(false);

  const currentAudioChapterIndex = useMemo(
    () => getCurrentChapterIndex(audioChapters, audioCurrentTime),
    [audioChapters, audioCurrentTime]
  );
  const currentAudioChapter =
    currentAudioChapterIndex >= 0 ? audioChapters[currentAudioChapterIndex] : audioChapters[0] ?? null;
  const resolvedAudioDuration = audioDuration || audioData?.durationSeconds || 0;
  const audioProgress =
    resolvedAudioDuration > 0 ? Math.min(100, (audioCurrentTime / resolvedAudioDuration) * 100) : 0;

  const toggleAudioPlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setAudioHasStarted(true);

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      // Browser blocked playback or the media is not ready yet.
    }
  };

  const jumpToAudioChapter = async (nextTime) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = nextTime;
    setAudioCurrentTime(nextTime);
    setAudioHasStarted(true);

    try {
      await audio.play();
    } catch {
      // Browser blocked playback or the media is not ready yet.
    }
  };

  const handleAudioScrub = (event) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setAudioCurrentTime(nextTime);
    setAudioHasStarted(true);
  };

  const focusAudioPlayer = () => {
    audioSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setAudioDuration(audio.duration);
      }
    };

    const syncTime = () => {
      setAudioCurrentTime(audio.currentTime);
    };

    const onPlay = () => {
      setAudioPlaying(true);
      setAudioHasStarted(true);
      syncDuration();
    };

    const onPause = () => {
      setAudioPlaying(false);
    };

    const onEnded = () => {
      setAudioPlaying(false);
      setAudioCurrentTime(audio.duration || 0);
    };

    syncDuration();
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioData?.durationSeconds]);

  useEffect(() => {
    const node = audioSectionRef.current;

    if (!node || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setAudioStickyVisible(!entry.isIntersecting);
      },
      { threshold: 0.28 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const overlay = document.getElementById("mareeNoireOverlay");
    const video = document.getElementById("mareeNoireVideo");

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
        video.setAttribute("preload", "auto");
        video.load();
      }
    }

    let isStarting = false;

    const waitForVideoReady = () =>
      new Promise((resolve) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }

        const handleReady = () => {
          video.removeEventListener("loadeddata", handleReady);
          video.removeEventListener("canplay", handleReady);
          resolve();
        };

        video.addEventListener("loadeddata", handleReady);
        video.addEventListener("canplay", handleReady);
      });

    const startVideo = async (event) => {
      event?.preventDefault?.();
      if (isStarting) {
        return;
      }

      isStarting = true;
      overlay.classList.add("loading");

      try {
        // Drop the poster before reveal to avoid the red title card flashing over the teaser.
        video.removeAttribute("poster");

        if (video.readyState < 2) {
          video.load();
          await waitForVideoReady();
        }

        overlay.classList.add("playing");
        video.classList.add("playing");
        video.controls = true;
        await video.play();
      } catch {
        if (video.paused) {
          overlay.classList.remove("playing");
          video.classList.remove("playing");
          video.controls = false;
        }
      } finally {
        overlay.classList.remove("loading");
        isStarting = false;
      }
    };

    const onPause = () => {
      if (!video.ended && video.currentTime <= 0.1) {
        overlay.classList.remove("playing");
        video.classList.remove("playing");
        video.controls = false;
      }
    };

    const onEnded = () => {
      overlay.classList.remove("playing");
      video.classList.remove("playing");
      video.controls = false;
      video.currentTime = 0;
    };

    overlay.addEventListener("click", startVideo);
    overlay.addEventListener("touchend", startVideo, { passive: false });
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      overlay.removeEventListener("click", startVideo);
      overlay.removeEventListener("touchend", startVideo);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --mn-bg: #000000;
          --mn-card: #070707;
          --mn-card-soft: #0b0b0b;
          --mn-line: rgba(255, 255, 255, 0.14);
          --mn-line-strong: rgba(200, 245, 232, 0.42);
          --mn-text: #ffffff;
          --mn-muted: rgba(255, 255, 255, 0.92);
          --mn-soft: rgba(255, 255, 255, 0.68);
          --mn-mint: #c8f5e8;
          --mn-rose: #f5c6d8;
          --mn-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
          --mn-display: "Made Soulmaze", "Poppins", sans-serif;
          --mn-horizon: "Horizon", "Made Soulmaze", sans-serif;
        }

        html,
        body {
          margin: 0;
          background: #000;
          color: var(--mn-text);
          font-family: var(--mn-sans);
          cursor: none;
        }

        * {
          box-sizing: border-box;
        }

        .mn-page,
        .mn-page * {
          cursor: none !important;
        }

        .cursor {
          position: fixed;
          left: 0;
          top: 0;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: var(--mn-mint);
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: width 0.24s ease, height 0.24s ease, opacity 0.2s ease;
          mix-blend-mode: difference;
        }

        .cursor.hovering {
          width: 40px;
          height: 40px;
        }

        .mn-page {
          min-height: 100vh;
          background: #000;
          padding: 28px 20px 88px;
        }

        .mn-shell {
          width: min(1480px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 28px;
          min-width: 0;
        }

        .mn-intro-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
          gap: 24px;
          align-items: stretch;
          min-width: 0;
        }

        .mn-intro-card,
        .mn-brief-card,
        .mn-audio-card,
        .mn-copy-cell,
        .mn-media-cell,
        .mn-quote-card,
        .mn-pitch-card,
        .mn-arena-text,
        .mn-opener-card,
        .mn-watchers-card,
        .mn-sea-card,
        .mn-final-action {
          min-width: 0;
          border: 1px solid var(--mn-line-strong);
          border-radius: 32px;
          background: var(--mn-card);
        }

        .mn-body-shell,
        .mn-body-shell-inner,
        .mn-intro-grid > *,
        .mn-feature-grid > *,
        .mn-watchers-grid > *,
        .mn-gallery-grid > *,
        .mn-arenas-grid > *,
        .mn-dive-grid > * {
          min-width: 0;
        }

        .mn-intro-card,
        .mn-brief-card,
        .mn-audio-card,
        .mn-copy-cell,
        .mn-opener-card,
        .mn-watchers-card,
        .mn-sea-card {
          padding: 28px;
        }

        .mn-intro-card {
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .mn-session {
          display: inline-flex;
          width: fit-content;
          min-height: 48px;
          align-items: center;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: var(--mn-rose);
          font-size: 0.88rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mn-title {
          margin: 0;
          font-family: var(--mn-horizon);
          font-size: clamp(3rem, 8.2vw, 7rem);
          font-weight: 400;
          line-height: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: #ffffff;
        }

        @media (min-width: 1121px) {
          .mn-intro-card {
            gap: 22px;
          }

          .mn-intro-card .mn-meta-row {
            margin-bottom: 4px;
          }

          .mn-title {
            margin-top: 32px;
            font-size: clamp(2.68rem, 7.15vw, 6.2rem);
          }
        }

        .mn-body {
          margin: 0;
          color: var(--mn-muted);
          font-size: 1.08rem;
          line-height: 1.76;
          font-weight: 300;
        }

        .mn-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .mn-meta-grid {
          display: grid;
          gap: 10px;
        }

        .mn-pill {
          display: inline-flex;
          align-items: center;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid var(--mn-line);
          background: rgba(255, 255, 255, 0.05);
          color: var(--mn-text);
          font-size: 0.82rem;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .mn-pill-mint {
          border-color: rgba(191, 248, 220, 0.3);
          color: var(--mn-mint);
        }

        .mn-brief-card {
          display: grid;
          gap: 18px;
          align-content: start;
          background: var(--mn-card);
        }

        .mn-section-kicker {
          margin: 0;
          color: var(--mn-rose);
          font-size: 0.94rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mn-brief-steps {
          display: grid;
          gap: 12px;
        }

        .mn-brief-step {
          display: grid;
          grid-template-columns: 52px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
          padding: 14px 16px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
        }

        .mn-brief-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          border-radius: 999px;
          border: 1px solid rgba(200, 245, 232, 0.34);
          color: var(--mn-mint);
          font-size: 0.8rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mn-brief-text {
          display: grid;
          gap: 4px;
          margin: 0;
          color: var(--mn-text);
          font-size: 1rem;
          line-height: 1.65;
          font-weight: 300;
        }

        .mn-brief-note {
          margin: 2px 0 0;
          color: var(--mn-rose);
          font-family: "Poppins", var(--mn-sans);
          font-size: 0.82rem;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .mn-audio-card {
          display: grid;
          gap: 24px;
        }

        .mn-audio-head {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(340px, 1.08fr);
          gap: 24px;
          align-items: start;
        }

        .mn-audio-copy {
          display: grid;
          gap: 10px;
          align-content: start;
        }

        .mn-audio-kicker {
          color: var(--mn-mint);
        }

        .mn-audio-title {
          margin: 0;
          color: #ffffff;
          font-family: var(--mn-horizon);
          font-size: clamp(1.48rem, 3.1vw, 2.56rem);
          line-height: 0.94;
          font-weight: 400;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .mn-audio-meta {
          margin: 0;
          color: var(--mn-rose);
          font-size: 0.82rem;
          font-weight: 300;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mn-audio-description,
        .mn-audio-note {
          margin: 0;
          color: var(--mn-muted);
          font-size: 0.98rem;
          line-height: 1.72;
          font-weight: 300;
        }

        .mn-audio-description {
          max-width: 42ch;
        }

        .mn-audio-controls {
          display: grid;
          gap: 14px;
          padding: 22px 24px;
          border: 1px solid rgba(200, 245, 232, 0.22);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.03);
        }

        .mn-audio-transport {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 14px;
          align-items: center;
        }

        .mn-audio-toggle,
        .mn-audio-sticky-toggle,
        .mn-audio-sticky-jump {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          min-height: 50px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(200, 245, 232, 0.24);
          background: rgba(255, 255, 255, 0.04);
          color: var(--mn-mint);
          font-family: "Poppins", var(--mn-sans);
          font-size: 0.72rem;
          font-weight: 300;
          letter-spacing: 0.14em;
          line-height: 1;
          text-transform: uppercase;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .mn-audio-toggle:hover,
        .mn-audio-sticky-toggle:hover,
        .mn-audio-sticky-jump:hover,
        .mn-audio-chapter:hover {
          border-color: rgba(200, 245, 232, 0.38);
        }

        .mn-audio-toggle:hover,
        .mn-audio-sticky-toggle:hover,
        .mn-audio-sticky-jump:hover {
          transform: translateY(-1px);
        }

        .mn-audio-toggle.is-playing,
        .mn-audio-sticky-toggle.is-playing {
          background: var(--mn-mint);
          color: #04120e;
        }

        .mn-audio-progress-block {
          display: grid;
          gap: 10px;
          min-width: 0;
        }

        .mn-audio-progress-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .mn-audio-current {
          min-width: 0;
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 300;
          line-height: 1.32;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mn-audio-time,
        .mn-audio-chapter-time,
        .mn-audio-sticky-meta {
          color: var(--mn-soft);
          font-size: 0.68rem;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .mn-audio-range {
          width: 100%;
          height: 4px;
          margin: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
          appearance: none;
          -webkit-appearance: none;
        }

        .mn-audio-range::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
        }

        .mn-audio-range::-webkit-slider-thumb {
          width: 14px;
          height: 14px;
          margin-top: -5px;
          border: 0;
          border-radius: 999px;
          background: var(--mn-mint);
          -webkit-appearance: none;
        }

        .mn-audio-range::-moz-range-track {
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
        }

        .mn-audio-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: 0;
          border-radius: 999px;
          background: var(--mn-mint);
        }

        .mn-audio-chapters {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .mn-audio-chapter {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 12px;
          align-items: start;
          min-height: 84px;
          padding: 14px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
          text-align: left;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .mn-audio-chapter.is-active {
          border-color: rgba(200, 245, 232, 0.4);
          background: rgba(200, 245, 232, 0.08);
        }

        .mn-audio-chapter-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          min-height: 34px;
          border-radius: 999px;
          border: 1px solid rgba(200, 245, 232, 0.24);
          color: var(--mn-mint);
          font-size: 0.68rem;
          font-weight: 300;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mn-audio-chapter-copy {
          display: grid;
          gap: 6px;
          min-width: 0;
        }

        .mn-audio-chapter-title {
          color: #ffffff;
          font-size: 0.86rem;
          font-weight: 300;
          line-height: 1.36;
        }

        .mn-audio-element {
          display: none;
        }

        .mn-audio-sticky {
          position: fixed;
          left: 50%;
          bottom: 18px;
          width: min(760px, calc(100vw - 28px));
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 12px 14px;
          border: 1px solid rgba(200, 245, 232, 0.26);
          border-radius: 24px;
          background: rgba(5, 5, 5, 0.92);
          backdrop-filter: blur(12px);
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
          transform: translate(-50%, 20px);
          opacity: 0;
          pointer-events: none;
          z-index: 120;
          transition:
            opacity 0.25s ease,
            transform 0.25s ease;
        }

        .mn-audio-sticky.is-visible {
          transform: translate(-50%, 0);
          opacity: 1;
          pointer-events: auto;
        }

        .mn-audio-sticky-copy {
          display: grid;
          gap: 8px;
          min-width: 0;
        }

        .mn-audio-sticky-title {
          color: #ffffff;
          font-size: 0.84rem;
          font-weight: 300;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mn-audio-sticky-progress {
          position: relative;
          width: 100%;
          height: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          overflow: hidden;
        }

        .mn-audio-sticky-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--mn-mint);
        }

        .mn-image-band,
        .mn-finale-image,
        .mn-tele-card,
        .mn-cliff-card,
        .mn-final-image-card,
        .mn-gallery-card {
          position: relative;
          overflow: hidden;
          border-radius: 36px;
          border: 1px solid var(--mn-line);
          background: #050505;
        }

        .mn-image-band img,
        .mn-tele-card img,
        .mn-cliff-card img,
        .mn-final-image-card img,
        .mn-gallery-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mn-image-band::after,
        .mn-tele-card::after,
        .mn-cliff-card::after,
        .mn-final-image-card::after,
        .mn-gallery-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.62) 100%);
          pointer-events: none;
        }

        .mn-teaser-wrap {
          display: grid;
          gap: 0;
        }

        .mn-body-shell {
          border: 1px solid var(--mn-line-strong);
          border-radius: 36px;
          background: var(--mn-card);
          padding: 30px;
        }

        .mn-body-shell-inner {
          display: grid;
          gap: 28px;
        }

        .mn-teaser-card {
          position: relative;
          overflow: hidden;
          min-height: clamp(320px, 44vw, 640px);
          border-radius: 40px;
          border: 1px solid rgba(191, 248, 220, 0.22);
          background: var(--mn-mint);
        }

        .mn-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .mn-video.playing {
          opacity: 1;
        }

        .mn-video,
        .mn-video::-webkit-media-controls,
        .mn-video::-webkit-media-controls-enclosure,
        .mn-video::-webkit-media-controls-panel,
        .mn-video::-webkit-media-controls-play-button,
        .mn-video::-webkit-media-controls-mute-button,
        .mn-video::-webkit-media-controls-timeline,
        .mn-video::-webkit-media-controls-current-time-display,
        .mn-video::-webkit-media-controls-time-remaining-display,
        .mn-video::-webkit-media-controls-volume-slider,
        .mn-video::-webkit-media-controls-fullscreen-button,
        .mn-video::-webkit-media-controls-toggle-closed-captions-button {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif !important;
          font-size: 14px !important;
          font-style: normal !important;
          font-weight: 400 !important;
          letter-spacing: normal !important;
          line-height: normal !important;
          text-transform: none !important;
        }

        .mn-video::-webkit-media-controls {
          cursor: auto !important;
        }

        .mn-player-overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: transparent;
          border: 0;
          padding: 0;
        }

        .mn-player-overlay.playing {
          opacity: 0;
          pointer-events: none;
        }

        .mn-player-overlay.loading {
          pointer-events: none;
        }

        .mn-player-button {
          width: 92px;
          height: 92px;
          border-radius: 999px;
          border: 0;
          background: #050505;
          display: grid;
          place-items: center;
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.25);
        }

        .mn-player-icon {
          width: 0;
          height: 0;
          border-top: 14px solid transparent;
          border-bottom: 14px solid transparent;
          border-left: 22px solid var(--mn-mint);
          margin-left: 6px;
        }

        .mn-pitch-card {
          position: relative;
          overflow: hidden;
          min-height: clamp(700px, 70vw, 1000px);
          padding: clamp(28px, 4vw, 52px);
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .mn-word-card {
          width: 100%;
          margin: 0 auto;
          padding: 28px;
          border: 1px solid var(--mn-line-strong);
          border-radius: 32px;
          background: var(--mn-card);
          box-shadow: 0 20px 56px rgba(0, 0, 0, 0.28);
          display: grid;
          gap: 18px;
        }

        .mn-word-title {
          margin: 0;
          color: var(--mn-mint);
          font-family: "Poppins", var(--mn-sans);
          font-size: clamp(1.18rem, 1.65vw, 1.72rem);
          font-weight: 300;
          line-height: 1.8;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-align: center;
        }

        .mn-word-inline {
          color: var(--mn-mint);
          font-family: "Poppins", var(--mn-sans);
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .mn-word-copy {
          display: grid;
          gap: 14px;
          width: 100%;
        }

        .mn-word-copy .mn-body {
          max-width: 100%;
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: clamp(0.95rem, 1.18vw, 1.05rem);
          line-height: 1.85;
        }

        .mn-word-references {
          margin: 0;
          color: var(--mn-mint);
          font-family: "Poppins", var(--mn-sans);
          font-size: clamp(0.8rem, 1.02vw, 0.95rem);
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .mn-word-emphasis {
          color: var(--mn-mint);
          font-family: "Poppins", var(--mn-sans);
          font-weight: 300;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mn-pitch-background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mn-pitch-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.34) 35%, rgba(0, 0, 0, 0.56) 100%);
          pointer-events: none;
        }

        .mn-pitch-word,
        .mn-pitch-copy,
        .mn-pitch-line {
          position: relative;
          z-index: 2;
        }

        .mn-pitch-word {
          margin: 0;
          font-family: var(--mn-horizon);
          font-size: clamp(1rem, 2vw, 1.8rem);
          line-height: 1;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          justify-self: end;
          align-self: start;
          text-align: right;
        }

        .mn-pitch-copy {
          width: min(580px, 100%);
          margin: 0 auto;
          place-self: center;
          padding: 28px 30px;
          border-radius: 26px;
          background: rgba(0, 0, 0, 0.66);
          backdrop-filter: blur(4px);
          display: grid;
          gap: 18px;
        }

        .mn-pitch-copy .mn-body {
          font-family: var(--mn-sans);
          color: #ffffff;
          font-size: clamp(1.12rem, 1.65vw, 1.3rem);
          line-height: 1.78;
          letter-spacing: 0;
          font-weight: 300;
        }

        .mn-pitch-line {
          width: fit-content;
          margin: 0 auto 44px;
          padding: 14px 18px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          color: #ffffff;
          font-family: var(--mn-horizon);
          font-size: clamp(1rem, 2vw, 1.8rem);
          font-weight: 400;
          text-align: center;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          border-radius: 26px;
        }

        .mn-section-band {
          position: relative;
          overflow: hidden;
          min-height: clamp(360px, 36vw, 520px);
          border-radius: 36px;
          border: 1px solid var(--mn-line);
          background: #050505;
        }

        .mn-section-band img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mn-section-band::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.48) 100%);
        }

        .mn-section-band-copy {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: grid;
          align-content: start;
          padding: clamp(30px, 4vw, 56px);
        }

        .mn-section-band-title {
          margin: 0;
          font-family: var(--mn-horizon);
          color: #ffffff;
          font-size: clamp(1.72rem, 3.72vw, 3.08rem);
          line-height: 0.9;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .mn-dive-grid,
        .mn-arena-grid,
        .mn-watchers-grid {
          display: grid;
          gap: 24px;
        }

        .mn-dive-grid {
          grid-template-columns: minmax(300px, 0.86fr) minmax(0, 1.14fr);
          align-items: start;
          padding: 28px 0 36px;
        }

        .mn-dive-grid > .mn-copy-cell:first-child {
          padding-right: 34px;
          gap: 28px;
          align-content: center;
          min-height: 100%;
        }

        .mn-dive-grid > .mn-copy-cell:last-child {
          padding-left: 34px;
          border-left: 1px solid rgba(255, 255, 255, 0.18);
          gap: 28px;
        }

        .mn-dive-hook {
          font-family: var(--mn-horizon);
          color: #ffffff;
          font-size: clamp(0.94rem, 1.34vw, 1.18rem);
          line-height: 0.98;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          text-wrap: balance;
          overflow-wrap: normal;
          word-break: keep-all;
          hyphens: none;
        }

        .mn-dive-dot {
          color: var(--mn-mint);
        }

        .mn-copy-cell {
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .mn-dive-beats {
          display: grid;
          gap: 16px;
        }

        .mn-dive-beats p {
          margin: 0;
          color: #ffffff;
          font-family: "Poppins", var(--mn-sans);
          font-size: 1.05rem;
          line-height: 1.78;
          font-weight: 300;
        }

        .mn-dive-accent {
          color: var(--mn-mint);
          font-family: var(--mn-horizon);
          font-weight: 400;
          font-size: clamp(0.88rem, 1.18vw, 1.04rem);
          line-height: 1.02;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          text-wrap: balance;
          overflow-wrap: normal;
          word-break: keep-all;
          hyphens: none;
        }

        .mn-dive-grid > .mn-copy-cell:last-child .mn-body {
          font-family: "Poppins", var(--mn-sans);
          font-weight: 300;
          font-size: 0.96rem;
          line-height: 1.8;
          color: #ffffff;
        }

        .mn-dive-grid > .mn-copy-cell:last-child strong {
          font-weight: 400;
          color: inherit;
        }

        .mn-image-band {
          min-height: clamp(420px, 48vw, 700px);
        }

        .mn-image-band-mobile-inline {
          display: none;
        }

        .mn-feature-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.04fr) minmax(380px, 0.96fr);
          gap: 24px;
          align-items: stretch;
        }

        .mn-body-shell .mn-feature-grid {
          margin-top: 20px;
        }

        .mn-feature-reverse {
          grid-template-columns: minmax(380px, 0.96fr) minmax(0, 1.04fr);
        }

        .mn-feature-reverse .mn-media-cell {
          order: 2;
        }

        .mn-feature-reverse .mn-copy-cell {
          order: 1;
        }

        .mn-media-cell {
          padding: 0;
          overflow: hidden;
          min-height: 780px;
        }

        .mn-media-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          border-radius: 31px;
        }

        .mn-media-cell-iroise {
          min-height: 0;
          height: 100%;
        }

        .mn-section-line {
          display: flex;
          align-items: center;
          gap: 14px;
          color: var(--mn-mint);
          font-size: 0.88rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mn-section-line::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(200, 245, 232, 0.44);
        }

        .mn-character-name,
        .mn-profile-name,
        .mn-split-title,
        .mn-section-title {
          margin: 0;
          color: #ffffff;
          font-size: clamp(1.68rem, 3.18vw, 2.76rem);
          line-height: 0.92;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .mn-profile-name {
          font-size: clamp(1.52rem, 2.62vw, 2.28rem);
        }

        .mn-feature-hook {
          color: #ffffff;
          font-family: var(--mn-horizon);
          font-size: clamp(0.82rem, 1vw, 0.94rem);
          line-height: 1.28;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.01em;
          text-wrap: balance;
          overflow-wrap: normal;
          word-break: keep-all;
          hyphens: none;
        }

        .mn-feature-hook-iroise {
          color: #ffffff;
          font-size: clamp(0.78rem, 0.92vw, 0.86rem);
          line-height: 1.28;
          margin: 0;
          align-self: center;
          text-wrap: balance;
          overflow-wrap: normal;
          word-break: keep-all;
          hyphens: none;
        }

        .mn-copy-stack {
          display: grid;
          gap: 10px;
        }

        .mn-copy-cell-iroise {
          display: grid;
          grid-template-rows: auto auto auto 122px auto;
          gap: 18px;
        }

        .mn-copy-stack-centered {
          margin-top: 0;
        }

        .mn-copy-cell-character {
          display: grid;
          grid-template-rows: auto auto auto minmax(112px, auto) auto;
          gap: 18px;
        }

        .mn-feature-hook-character {
          color: #ffffff;
          font-size: clamp(0.78rem, 0.92vw, 0.86rem);
          line-height: 1.28;
          margin: 0;
          align-self: center;
          text-wrap: balance;
          overflow-wrap: normal;
          word-break: keep-all;
          hyphens: none;
        }

        .mn-copy-stack-character {
          margin-top: 0;
        }

        .mn-copy-cell-story {
          display: grid;
          grid-template-rows: auto auto auto;
          align-content: start;
          gap: 12px;
        }

        .mn-media-cell-story {
          min-height: 0;
          height: 100%;
        }

        .mn-feature-grid .mn-body,
        .mn-feature-grid .mn-copy-stack .mn-body {
          color: #ffffff;
          font-family: "Poppins", var(--mn-sans);
          font-weight: 300;
          font-size: 0.94rem;
          line-height: 1.76;
        }

        .mn-feature-grid strong,
        .mn-feature-grid .mn-body strong,
        .mn-feature-grid .mn-feature-hook strong {
          font-weight: 400;
          color: inherit;
        }

        .mn-media-cell-character {
          min-height: 0;
          height: 100%;
        }

        .mn-arenas-shell {
          display: grid;
          gap: 34px;
          padding: 34px 0 46px;
        }

        .mn-arenas-header {
          padding: 0 0 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        }

        .mn-arenas-title {
          margin: 0;
          color: #ffffff;
          font-family: var(--mn-horizon);
          font-size: clamp(2.08rem, 5.1vw, 3.9rem);
          line-height: 0.9;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .mn-arenas-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 54px;
        }

        .mn-arenas-column {
          display: grid;
          gap: 22px;
          align-content: start;
        }

        .mn-arenas-line {
          display: flex;
          align-items: center;
          gap: 14px;
          color: var(--mn-mint);
          font-size: 0.86rem;
          font-weight: 400;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .mn-arenas-line::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(200, 245, 232, 0.34);
        }

        .mn-arenas-column-title {
          margin: 0;
          color: #ffffff;
          font-family: var(--mn-horizon);
          font-size: clamp(1rem, 1.48vw, 1.28rem);
          line-height: 0.94;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .mn-arenas-column .mn-copy-stack {
          gap: 16px;
        }

        .mn-arenas-column .mn-body {
          color: #ffffff;
          font-family: "Poppins", var(--mn-sans);
          font-weight: 300;
          font-size: 0.92rem;
          line-height: 1.8;
        }

        .mn-arenas-column .mn-body strong {
          font-weight: 400;
          color: inherit;
        }

        .mn-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .mn-gallery-card {
          min-height: 340px;
        }

        .mn-gallery-card::before {
          content: attr(data-label);
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          width: calc(100% - 48px);
          text-align: center;
          color: #ffffff;
          font-family: "Poppins", var(--mn-sans);
          font-size: 1rem;
          font-weight: 300;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-wrap: balance;
          opacity: 0;
          transition: opacity 180ms ease;
          pointer-events: none;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);
        }

        .mn-gallery-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.46);
          opacity: 0;
          transition: opacity 180ms ease;
          pointer-events: none;
        }

        .mn-gallery-card:hover::before,
        .mn-gallery-card:hover::after,
        .mn-gallery-card:focus::before,
        .mn-gallery-card:focus::after,
        .mn-gallery-card:focus-visible::before,
        .mn-gallery-card:focus-visible::after {
          opacity: 1;
        }

        .mn-watchers-grid .mn-gallery-card::before,
        .mn-watchers-grid .mn-gallery-card::after,
        .mn-watchers-grid .mn-gallery-card:hover::before,
        .mn-watchers-grid .mn-gallery-card:hover::after {
          content: none;
          opacity: 0;
        }

        .mn-finale-image {
          position: relative;
          overflow: hidden;
          min-height: clamp(440px, 52vw, 760px);
          border: 0 !important;
          outline: 0;
          box-shadow: none;
          border-radius: 28px;
          background: transparent;
        }

        .mn-finale-image img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
          filter: none;
        }

        .mn-finale-image::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.12) 100%);
        }

        .mn-finale-quote {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 100%;
          padding: clamp(34px, 5vw, 60px);
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 18px;
          text-align: center;
        }

        .mn-finale-copy {
          max-width: min(620px, 76vw);
        }

        .mn-finale-quote p {
          margin: 0;
          color: #ffffff;
          font-family: var(--mn-horizon);
          font-size: clamp(0.82rem, 1.42vw, 1.16rem);
          line-height: 1.02;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .mn-highlight {
          color: var(--mn-mint);
        }

        .mn-finale-subline {
          display: none;
        }

        .mn-opener-card,
        .mn-sea-card {
          display: grid;
          gap: 18px;
        }

        .mn-opener-card {
          justify-self: center;
          width: min(720px, 64vw);
          padding: 28px 0 22px;
          gap: 24px;
        }

        .mn-opener-card .mn-section-kicker,
        .mn-story-split .mn-section-kicker,
        .mn-editorial-kicker {
          margin: 0;
          color: var(--mn-mint);
          font-family: "Poppins", var(--mn-sans);
          font-weight: 400;
          font-size: 0.86rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .mn-opener-card .mn-section-kicker,
        .mn-story-split .mn-section-kicker {
          position: relative;
          justify-self: start;
        }

        .mn-story-split .mn-section-kicker {
          margin-bottom: 48px;
        }

        .mn-opener-card .mn-section-kicker::after,
        .mn-story-split .mn-section-kicker::after {
          content: "";
          position: absolute;
          left: 0;
          width: 32px;
          height: 1px;
          background: var(--mn-mint);
        }

        .mn-opener-card .mn-section-kicker {
          padding-bottom: 24px;
        }

        .mn-opener-card .mn-section-kicker::after {
          bottom: 0;
        }

        .mn-story-split .mn-section-kicker::after {
          top: calc(100% + 24px);
          transform: translateY(-50%);
        }

        .mn-opener-card .mn-section-title {
          font-size: clamp(0.92rem, 1.7vw, 1.42rem);
          line-height: 0.92;
          max-width: none;
          width: max-content;
        }

        .mn-opener-card .mn-section-title .mn-title-line {
          display: block;
          white-space: nowrap;
        }

        .mn-opener-card .mn-copy-stack {
          gap: 10px;
        }

        .mn-opener-card .mn-body {
          color: #ffffff;
          font-family: "Poppins", var(--mn-sans);
          font-weight: 300;
          font-size: 0.94rem;
          line-height: 1.78;
        }

        .mn-story-split .mn-split-title,
        .mn-watchers-card .mn-profile-name,
        .mn-sea-card .mn-section-title {
          font-size: clamp(20px, 2.2vw, 30px);
          line-height: 1.08;
          letter-spacing: 0.04em;
          max-width: none;
          width: max-content;
          max-width: 100%;
          text-wrap: wrap;
          overflow-wrap: normal;
          word-break: keep-all;
          hyphens: none;
        }

        .mn-story-split .mn-split-title-lockup {
          max-width: none;
        }

        .mn-copy-cell-story.mn-story-block-fixed-point .mn-split-title {
          font-size: clamp(18px, 1.85vw, 25px);
          line-height: 1.04;
        }

        .mn-story-split .mn-split-title .mn-title-line {
          display: block;
          white-space: nowrap;
        }

        .mn-copy-cell-story.mn-story-block-investigation,
        .mn-copy-cell-story.mn-story-block-fixed-point,
        .mn-copy-cell-story.mn-story-block-intimacy,
        .mn-copy-cell-story.mn-story-block-science {
          align-content: center;
        }

        .mn-story-split .mn-copy-stack,
        .mn-watchers-card .mn-copy-stack,
        .mn-sea-card .mn-copy-stack {
          gap: 18px;
        }

        .mn-story-split .mn-copy-stack .mn-body,
        .mn-watchers-card .mn-body,
        .mn-sea-card .mn-body {
          color: #ffffff;
          font-family: "Poppins", var(--mn-sans);
          font-weight: 300;
          font-size: clamp(13.5px, 0.98vw, 15px);
          line-height: 1.9;
        }

        .mn-quote-card {
          position: relative;
          padding: 74px 0;
          display: grid;
          justify-items: center;
          text-align: center;
        }

        .mn-quote-card::before,
        .mn-quote-card::after {
          content: "";
          width: min(88%, 1080px);
          height: 1px;
          background: rgba(255, 255, 255, 0.18);
        }

        .mn-quote-text {
          width: min(720px, calc(100vw - 48px));
          display: grid;
          justify-items: center;
          padding: 52px 80px;
        }

        .mn-quote-card p {
          margin: 0;
          max-width: none;
          font-family: var(--mn-horizon);
          font-size: clamp(15px, 1.7vw, 22px);
          line-height: 1.58;
          color: #ffffff;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .mn-tele-card {
          min-height: clamp(440px, 48vw, 760px);
        }

        .mn-tele-caption {
          position: absolute;
          left: clamp(22px, 3vw, 40px);
          bottom: clamp(22px, 3vw, 40px);
          z-index: 2;
          padding: 12px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(0, 0, 0, 0.46);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .mn-watchers-editorial,
        .mn-sea-editorial {
          width: min(720px, calc(100vw - 48px));
          margin-left: auto;
          margin-right: auto;
          box-sizing: border-box;
          padding-left: 80px;
          padding-right: 80px;
          display: block;
          text-align: left;
        }

        .mn-watchers-editorial {
          margin-top: 10px;
          margin-bottom: 88px;
          display: grid;
          justify-items: center;
          align-content: start;
          min-height: 0;
        }

        .mn-quote-card-before-watchers {
          padding-top: 34px;
          padding-bottom: 18px;
        }

        .mn-quote-card-before-watchers .mn-quote-text {
          padding-top: 18px;
          padding-bottom: 16px;
        }

        .mn-sea-editorial {
          margin-top: 28px;
          margin-bottom: 44px;
        }

        .mn-editorial-kicker {
          margin: 0 0 24px;
          position: relative;
          padding-bottom: 24px;
        }

        .mn-editorial-kicker::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 32px;
          height: 1px;
          background: var(--mn-mint);
        }

        .mn-editorial-title {
          margin: 0 0 26px;
          color: #f4f1ea;
          font-family: var(--mn-horizon);
          font-weight: 400;
          text-transform: uppercase;
        }

        .mn-editorial-title-watchers {
          font-size: clamp(15px, 1.46vw, 20px);
          line-height: 1.6;
          letter-spacing: 0.04em;
        }

        .mn-watchers-editorial .mn-editorial-kicker,
        .mn-watchers-editorial .mn-editorial-title,
        .mn-watchers-editorial .mn-editorial-copy {
          width: min(560px, 100%);
        }

        .mn-editorial-title-sea {
          font-size: clamp(26px, 3.2vw, 44px);
          line-height: 1.08;
          letter-spacing: 0.04em;
        }

        .mn-editorial-title .mn-title-line {
          display: block;
          white-space: nowrap;
        }

        .mn-editorial-copy {
          width: 100%;
          display: block;
        }

        .mn-editorial-copy .mn-body {
          color: #ffffff;
          font-family: "Poppins", var(--mn-sans);
          font-weight: 300;
          font-size: clamp(13.5px, 0.98vw, 15px);
          line-height: 1.9;
          max-width: none;
          margin: 0 0 18px;
        }

        .mn-editorial-copy .mn-body:last-child {
          margin-bottom: 0;
        }

        .mn-watchers-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .mn-watchers-grid .mn-gallery-card {
          min-height: 420px;
        }

        .mn-cliff-card,
        .mn-final-image-card {
          min-height: clamp(460px, 54vw, 780px);
        }

        .mn-final-action {
          padding: 40px 28px;
          display: grid;
          justify-items: center;
          gap: 16px;
          text-align: center;
        }

        .mn-body-shell .mn-copy-cell,
        .mn-body-shell .mn-media-cell,
        .mn-body-shell .mn-arena-text,
        .mn-body-shell .mn-opener-card,
        .mn-body-shell .mn-watchers-card,
        .mn-body-shell .mn-sea-card {
          border: 0;
          border-radius: 0;
          background: transparent;
          padding: 0;
        }

        .mn-body-shell .mn-quote-card {
          border: 0;
          border-radius: 0;
          background: transparent;
          padding: 74px 0;
        }

        .mn-body-shell .mn-section-band,
        .mn-body-shell .mn-image-band,
        .mn-body-shell .mn-tele-card,
        .mn-body-shell .mn-cliff-card,
        .mn-body-shell .mn-final-image-card,
        .mn-body-shell .mn-gallery-card {
          border: 0;
          background: transparent;
        }

        .mn-body-shell .mn-media-image,
        .mn-body-shell .mn-section-band,
        .mn-body-shell .mn-image-band,
        .mn-body-shell .mn-tele-card,
        .mn-body-shell .mn-cliff-card,
        .mn-body-shell .mn-final-image-card,
        .mn-body-shell .mn-gallery-card {
          border-radius: 28px;
        }

        .mn-body-shell .mn-section-band-copy {
          padding: 0;
          align-content: center;
        }

        .mn-body-shell .mn-section-band-title {
          padding: 34px;
        }

        .mn-body-shell .mn-gallery-card::before {
          left: 50%;
          top: 50%;
          bottom: auto;
          transform: translate(-50%, -50%);
        }

        .mn-body-shell .mn-section-title,
        .mn-body-shell .mn-profile-name,
        .mn-body-shell .mn-character-name,
        .mn-body-shell .mn-split-title {
          font-family: var(--mn-horizon);
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .mn-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 66px;
          padding: 0 28px;
          border-radius: 999px;
          border: 1px solid rgba(191, 248, 220, 0.28);
          background: var(--mn-mint);
          color: #050505;
          font-size: 1rem;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, color 180ms ease;
          box-shadow: 0 14px 34px rgba(191, 248, 220, 0.1);
        }

        .mn-action:hover {
          transform: translateY(-2px);
          background: #d8ffe9;
          box-shadow: 0 18px 42px rgba(191, 248, 220, 0.24);
          color: #050505;
        }

        .mn-action-caption {
          margin: 0;
          color: var(--mn-soft);
          font-size: 0.98rem;
          font-weight: 300;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .mn-footer {
          display: grid;
          gap: 8px;
          justify-items: center;
          padding: 28px clamp(20px, 4vw, 52px);
          background: var(--mn-bg);
        }

        .mn-footer-links {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }

        .mn-footer-link {
          color: #ffffff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .mn-footer .mn-note {
          margin: 0;
          color: #ffffff;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.06em;
        }

        .mn-footer-thin .mn-footer-link {
          font-size: 10px;
          font-weight: 100;
          letter-spacing: 0.14em;
        }

        .mn-footer-thin .mn-note {
          font-size: 10px;
          font-weight: 100;
          letter-spacing: 0.1em;
        }

        @media (max-width: 1120px) {
          .mn-intro-grid,
          .mn-dive-grid,
          .mn-feature-grid,
          .mn-feature-reverse,
          .mn-arenas-grid {
            grid-template-columns: 1fr;
          }

          .mn-feature-reverse .mn-media-cell,
          .mn-feature-reverse .mn-copy-cell {
            order: initial;
          }

          .mn-copy-cell-iroise {
            grid-template-rows: auto auto auto auto auto;
          }

          .mn-copy-cell-character {
            grid-template-rows: auto auto auto auto auto;
          }

          .mn-copy-cell-story {
            grid-template-rows: auto auto auto;
            align-content: start;
          }

          .mn-media-cell-character {
            min-height: 420px;
            height: auto;
          }

          .mn-media-cell-story {
            min-height: 420px;
            height: auto;
          }

          .mn-media-cell,
          .mn-cover-card,
          .mn-pitch-card,
          .mn-image-band,
          .mn-tele-card,
          .mn-cliff-card,
          .mn-final-image-card {
            min-height: 420px;
          }

          .mn-gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mn-arenas-grid {
            gap: 34px;
          }

          .mn-finale-quote {
            position: absolute;
            inset: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
          }

          .mn-audio-head {
            grid-template-columns: 1fr;
          }

          .mn-audio-chapters {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 899px) {
          .mn-page {
            padding: 24px 30px 80px;
          }

          .mn-shell {
            gap: 20px;
          }

          .mn-body-shell {
            padding: 24px;
            border-radius: 30px;
          }

          .mn-body-shell-inner {
            gap: 26px;
          }

          .mn-pitch-card {
            min-height: 580px;
            padding: 28px;
            gap: 24px;
            border-radius: 30px;
          }

          .mn-pitch-copy {
            width: min(520px, calc(100% - 72px));
            padding: 22px 24px;
            border-radius: 24px;
            gap: 16px;
          }

          .mn-pitch-copy .mn-body {
            font-size: 1rem;
            line-height: 1.7;
          }

          .mn-pitch-word {
            justify-self: end;
            text-align: right;
            font-size: 1rem;
          }

          .mn-pitch-line {
            width: fit-content;
            max-width: min(100%, 90%);
            margin: 16px auto 14px;
            padding: 12px 18px;
            border-radius: 22px;
            font-size: 1rem;
            line-height: 1.08;
          }

          .mn-section-band,
          .mn-image-band {
            border-radius: 30px;
          }

          .mn-quote-text,
          .mn-watchers-editorial,
          .mn-sea-editorial {
            width: min(100%, 620px);
            max-width: 100%;
            padding-left: 32px;
            padding-right: 32px;
          }

          .mn-dive-grid {
            grid-template-columns: 1fr;
            gap: 22px;
            width: min(100%, 620px);
            margin: 0 auto;
            padding: 4px 0 8px;
          }

          .mn-dive-grid > .mn-copy-cell:first-child,
          .mn-dive-grid > .mn-copy-cell:last-child {
            width: 100%;
            padding: 22px 24px;
            gap: 18px;
            border-radius: 26px;
          }

          .mn-dive-grid > .mn-copy-cell:first-child {
            min-height: 0;
            align-content: start;
            justify-items: center;
            text-align: center;
          }

          .mn-dive-grid > .mn-copy-cell:last-child {
            border-left: 0;
          }

          .mn-dive-hook,
          .mn-dive-accent,
          .mn-dive-beats {
            width: min(100%, 520px);
            margin-left: auto;
            margin-right: auto;
          }

          .mn-dive-hook,
          .mn-dive-accent {
            text-align: center;
          }

          .mn-dive-beats {
            gap: 14px;
          }

          .mn-dive-beats p {
            text-align: center;
          }

          .mn-image-band-mobile-inline {
            display: block;
            width: 100%;
            min-height: 380px;
            margin: 8px auto 0;
            border-radius: 26px;
          }

          .mn-image-band-default {
            display: none;
          }

          .mn-section-band-copy {
            display: none;
          }

          .mn-audio-card {
            gap: 20px;
          }

          .mn-audio-head {
            gap: 18px;
          }

          .mn-audio-title {
            font-size: clamp(1.38rem, 5vw, 1.96rem);
          }

          .mn-audio-controls {
            padding: 18px;
            border-radius: 24px;
          }

          .mn-audio-chapters {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mn-audio-sticky {
            width: min(680px, calc(100vw - 24px));
          }
        }

        @media (max-width: 720px) {
          .mn-page {
            padding: 16px 12px 64px;
          }

          .mn-shell {
            gap: 16px;
          }

          .mn-body-shell {
            padding: 16px;
            border-radius: 24px;
          }

          .mn-body-shell-inner {
            gap: 20px;
          }

          .mn-intro-card,
          .mn-brief-card,
          .mn-audio-card,
          .mn-copy-cell,
          .mn-opener-card,
          .mn-watchers-card,
          .mn-sea-card,
          .mn-arena-text,
          .mn-final-action {
            padding: 18px;
            border-radius: 22px;
          }

          .mn-copy-cell,
          .mn-media-cell,
          .mn-pitch-card,
          .mn-cover-card,
          .mn-teaser-card,
          .mn-section-band,
          .mn-image-band,
          .mn-tele-card,
          .mn-cliff-card,
          .mn-final-image-card,
          .mn-gallery-card {
            border-radius: 22px;
          }

          .mn-media-image {
            border-radius: 21px;
          }

          .mn-title {
            font-size: 2.9rem;
            line-height: 0.88;
          }

          .mn-session,
          .mn-pill {
            min-height: 36px;
            padding: 0 12px;
            font-size: 0.72rem;
            letter-spacing: 0.1em;
          }

          .mn-brief-step {
            grid-template-columns: 42px minmax(0, 1fr);
            gap: 10px;
            padding: 12px 14px;
          }

          .mn-brief-text {
            font-size: 0.92rem;
            line-height: 1.58;
          }

          .mn-brief-note {
            font-size: 0.72rem;
          }

          .mn-pitch-card {
            min-height: 520px;
            padding: 18px;
            gap: 18px;
          }

          .mn-pitch-copy {
            width: 100%;
            padding: 18px;
            border-radius: 20px;
            gap: 14px;
          }

          .mn-pitch-copy .mn-body {
            font-size: 0.96rem;
            line-height: 1.68;
          }

          .mn-pitch-word {
            justify-self: start;
            text-align: left;
            font-size: 0.96rem;
          }

          .mn-pitch-line {
            margin: 0;
            width: 100%;
            padding: 12px 14px;
            border-radius: 20px;
            font-size: 0.98rem;
            line-height: 1.08;
          }

          .mn-player-button {
            width: 72px;
            height: 72px;
          }

          .mn-player-icon {
            border-top-width: 11px;
            border-bottom-width: 11px;
            border-left-width: 18px;
          }

          .mn-teaser-card {
            min-height: 240px;
          }

          .mn-section-band {
            min-height: 240px;
          }

          .mn-section-band-copy {
            padding: 20px;
          }

          .mn-body-shell .mn-section-band-copy {
            padding: 0;
            align-content: center;
          }

          .mn-section-band-title {
            font-size: clamp(1.44rem, 7.2vw, 2.04rem);
            line-height: 0.92;
          }

          .mn-body-shell .mn-section-band-title {
            padding: 20px;
            font-size: clamp(1.44rem, 7.2vw, 2.04rem);
            line-height: 0.92;
          }

          .mn-dive-grid {
            padding: 10px 0 18px;
          }

          .mn-dive-grid > .mn-copy-cell:first-child,
          .mn-dive-grid > .mn-copy-cell:last-child {
            padding-left: 0;
            padding-right: 0;
            gap: 20px;
          }

          .mn-dive-grid > .mn-copy-cell:last-child {
            border-left: 0;
          }

          .mn-dive-hook,
          .mn-dive-accent {
            font-size: 0.92rem;
            line-height: 1.08;
          }

          .mn-dive-beats {
            gap: 12px;
          }

          .mn-dive-beats p,
          .mn-dive-grid > .mn-copy-cell:last-child .mn-body {
            font-size: 0.94rem;
            line-height: 1.72;
          }

          .mn-image-band {
            min-height: 280px;
          }

          .mn-feature-grid {
            gap: 18px;
          }

          .mn-body-shell .mn-feature-grid {
            margin-top: 8px;
          }

          .mn-media-cell-character,
          .mn-media-cell-story,
          .mn-media-cell,
          .mn-cover-card,
          .mn-image-band,
          .mn-tele-card,
          .mn-cliff-card,
          .mn-final-image-card {
            min-height: 340px;
          }

          .mn-character-name,
          .mn-profile-name,
          .mn-story-split .mn-split-title,
          .mn-watchers-card .mn-profile-name,
          .mn-sea-card .mn-section-title,
          .mn-arenas-title,
          .mn-arenas-column-title,
          .mn-editorial-title-watchers,
          .mn-editorial-title-sea,
          .mn-opener-card .mn-section-title {
            width: 100% !important;
            max-width: 100% !important;
            white-space: normal !important;
            text-wrap: balance;
          }

          .mn-opener-card .mn-section-title {
            font-size: 1.04rem;
          }

          .mn-story-split .mn-split-title,
          .mn-watchers-card .mn-profile-name,
          .mn-sea-card .mn-section-title {
            font-size: clamp(1.22rem, 6vw, 1.7rem);
            line-height: 1;
          }

          .mn-arenas-title {
            font-size: clamp(1.84rem, 8.2vw, 2.5rem);
          }

          .mn-arenas-column-title {
            font-size: 0.98rem;
            line-height: 1.18;
          }

          .mn-opener-card .mn-section-title .mn-title-line,
          .mn-story-split .mn-split-title .mn-title-line,
          .mn-editorial-title .mn-title-line {
            white-space: normal;
          }

          .mn-section-line,
          .mn-arenas-line,
          .mn-opener-card .mn-section-kicker,
          .mn-story-split .mn-section-kicker,
          .mn-editorial-kicker {
            font-size: 0.76rem;
            letter-spacing: 0.12em;
          }

          .mn-feature-grid .mn-copy-stack .mn-body,
          .mn-story-split .mn-copy-stack .mn-body,
          .mn-watchers-card .mn-body,
          .mn-sea-card .mn-body,
          .mn-arenas-column .mn-body,
          .mn-editorial-copy .mn-body,
          .mn-opener-card .mn-body {
            font-size: 0.94rem;
            line-height: 1.72;
          }

          .mn-copy-stack,
          .mn-story-split .mn-copy-stack,
          .mn-watchers-card .mn-copy-stack,
          .mn-sea-card .mn-copy-stack,
          .mn-arenas-column .mn-copy-stack {
            gap: 14px;
          }

          .mn-quote-card {
            padding: 44px 0;
          }

          .mn-quote-text {
            width: 100%;
            padding: 28px 20px;
          }

          .mn-quote-card p {
            font-size: 1rem;
            line-height: 1.48;
          }

          .mn-watchers-editorial,
          .mn-sea-editorial {
            width: 100%;
            padding-left: 8px;
            padding-right: 8px;
            margin-top: 18px;
            margin-bottom: 20px;
          }

          .mn-watchers-editorial {
            justify-items: start;
            min-height: 0;
          }

          .mn-editorial-kicker {
            margin-bottom: 18px;
            padding-bottom: 18px;
          }

          .mn-gallery-grid,
          .mn-watchers-grid {
            grid-template-columns: 1fr;
          }

          .mn-arenas-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .mn-arenas-column {
            gap: 16px;
          }

          .mn-arenas-column-title {
            white-space: normal;
          }

          .mn-gallery-card,
          .mn-watchers-grid .mn-gallery-card {
            min-height: 260px;
          }

          .mn-watchers-editorial,
          .mn-sea-editorial {
            width: 100%;
            padding-left: 8px;
            padding-right: 8px;
            margin-top: 28px;
            margin-bottom: 24px;
          }

          .mn-editorial-title-watchers {
            font-size: 1.04rem;
          }

          .mn-editorial-title-sea {
            font-size: 1.56rem;
          }

          .mn-tele-card,
          .mn-cliff-card,
          .mn-final-image-card {
            min-height: 300px;
          }

          .mn-finale-image {
            min-height: 320px;
          }

          .mn-finale-quote {
            display: grid;
            place-items: center;
            padding: 20px 16px;
          }

          .mn-word-card {
            width: 100%;
            padding: 22px 18px 20px;
            gap: 14px;
          }

          .mn-word-title {
            font-size: 0.95rem;
            letter-spacing: 0.1em;
            line-height: 1.6;
          }

          .mn-word-inline {
            letter-spacing: 0.1em;
          }

          .mn-word-copy .mn-body {
            font-size: 0.94rem;
            line-height: 1.78;
          }

          .mn-word-references {
            font-size: 0.72rem;
            letter-spacing: 0.14em;
          }

          .mn-finale-copy {
            max-width: min(520px, 86vw);
          }

          .mn-finale-quote p {
            font-size: clamp(0.7rem, 2.7vw, 0.95rem);
            line-height: 1.06;
          }

          .mn-story-split .mn-split-title {
            width: 100%;
          }

          .mn-pitch-line {
            width: 100%;
          }

          .mn-opener-card {
            width: 100%;
            gap: 18px;
            padding: 18px 0 10px;
          }

          .mn-final-action {
            padding: 24px 18px;
          }

          .mn-action {
            width: 100%;
            min-height: 56px;
            padding: 0 18px;
            font-size: 0.92rem;
            letter-spacing: 0.1em;
          }

          .mn-action-caption {
            font-size: 0.84rem;
          }

          .mn-footer {
            padding: 24px 16px;
          }

          .mn-audio-card {
            gap: 18px;
          }

          .mn-audio-head {
            gap: 16px;
          }

          .mn-audio-title {
            font-size: clamp(1.2rem, 6.4vw, 1.56rem);
          }

          .mn-audio-description,
          .mn-audio-note {
            font-size: 0.9rem;
            line-height: 1.62;
          }

          .mn-audio-controls {
            padding: 16px;
            border-radius: 20px;
          }

          .mn-audio-transport {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .mn-audio-toggle {
            width: 100%;
          }

          .mn-audio-progress-head {
            gap: 8px;
          }

          .mn-audio-current {
            font-size: 0.82rem;
          }

          .mn-audio-chapters {
            grid-template-columns: 1fr;
          }

          .mn-audio-chapter {
            min-height: 0;
          }

          .mn-audio-sticky {
            width: calc(100vw - 20px);
            gap: 8px;
            padding: 10px 12px;
          }

          .mn-audio-sticky-toggle,
          .mn-audio-sticky-jump {
            min-height: 40px;
            padding: 0 12px;
          }

          .mn-audio-sticky-title {
            font-size: 0.78rem;
          }
        }

        @media (max-width: 390px) {
          .mn-page {
            padding: 12px 16px 52px;
            overflow-x: hidden;
          }

          .mn-shell {
            gap: 14px;
            width: 100%;
            max-width: 100%;
          }

          .mn-body-shell {
            padding: 14px;
            border-radius: 22px;
            width: 100%;
            max-width: 100%;
          }

          .mn-body-shell-inner {
            gap: 18px;
            width: 100%;
            max-width: 100%;
          }

          .mn-intro-grid,
          .mn-quote-text,
          .mn-watchers-editorial,
          .mn-sea-editorial {
            width: 100%;
            max-width: 100%;
          }

          .mn-quote-text,
          .mn-watchers-editorial,
          .mn-sea-editorial {
            padding-left: 20px;
            padding-right: 20px;
          }

          .mn-intro-card,
          .mn-brief-card,
          .mn-audio-card,
          .mn-copy-cell,
          .mn-opener-card,
          .mn-watchers-card,
          .mn-sea-card,
          .mn-arena-text,
          .mn-final-action {
            padding: 16px;
            border-radius: 20px;
          }

          .mn-copy-cell,
          .mn-media-cell,
          .mn-pitch-card,
          .mn-cover-card,
          .mn-teaser-card,
          .mn-section-band,
          .mn-image-band,
          .mn-tele-card,
          .mn-cliff-card,
          .mn-final-image-card,
          .mn-gallery-card {
            border-radius: 20px;
          }

          .mn-media-image {
            border-radius: 19px;
          }

          .mn-title {
            font-size: clamp(2.08rem, 10vw, 2.44rem);
          }

          .mn-session,
          .mn-pill {
            min-height: 32px;
            padding: 0 9px;
            font-size: 0.62rem;
            letter-spacing: 0.07em;
          }

          .mn-brief-step {
            grid-template-columns: 38px minmax(0, 1fr);
            gap: 9px;
            padding: 10px 12px;
          }

          .mn-brief-index {
            min-height: 30px;
            font-size: 0.62rem;
          }

          .mn-brief-text {
            font-size: 0.82rem;
            line-height: 1.48;
          }

          .mn-brief-note {
            font-size: 0.64rem;
            letter-spacing: 0.08em;
          }

          .mn-pitch-card {
            min-height: 480px;
            padding: 16px;
            gap: 16px;
          }

          .mn-pitch-copy {
            padding: 16px;
            border-radius: 18px;
            gap: 12px;
          }

          .mn-pitch-copy .mn-body {
            font-size: 0.82rem;
            line-height: 1.56;
          }

          .mn-pitch-word,
          .mn-pitch-line {
            font-size: 0.84rem;
          }

          .mn-pitch-line {
            padding: 10px 12px;
            border-radius: 18px;
            letter-spacing: 0.01em;
            line-height: 1.04;
          }

          .mn-section-band {
            min-height: 220px;
          }

          .mn-section-band-copy,
          .mn-body-shell .mn-section-band-copy {
            padding: 18px;
          }

          .mn-section-band-title,
          .mn-body-shell .mn-section-band-title {
            font-size: clamp(1.12rem, 5.9vw, 1.48rem);
          }

          .mn-section-band-copy {
            display: none;
          }

          .mn-dive-grid {
            padding: 8px 0 8px;
          }

          .mn-image-band-mobile-inline {
            display: block;
            min-height: 220px;
            margin-top: 2px;
          }

          .mn-image-band-default {
            display: none;
          }

          .mn-dive-hook,
          .mn-dive-accent {
            font-size: 0.8rem;
            line-height: 1.06;
          }

          .mn-dive-beats p,
          .mn-dive-grid > .mn-copy-cell:last-child .mn-body {
            font-size: 0.82rem;
            line-height: 1.58;
          }

          .mn-feature-grid {
            gap: 16px;
          }

          .mn-body-shell .mn-feature-grid {
            margin-top: 6px;
          }

          .mn-media-cell-character,
          .mn-media-cell-story,
          .mn-media-cell,
          .mn-cover-card,
          .mn-image-band,
          .mn-tele-card,
          .mn-cliff-card,
          .mn-final-image-card {
            min-height: 300px;
          }

          .mn-character-name,
          .mn-profile-name,
          .mn-story-split .mn-split-title,
          .mn-watchers-card .mn-profile-name,
          .mn-sea-card .mn-section-title,
          .mn-arenas-title,
          .mn-arenas-column-title,
          .mn-editorial-title-watchers,
          .mn-editorial-title-sea,
          .mn-opener-card .mn-section-title {
            font-size: clamp(0.96rem, 5vw, 1.26rem);
            line-height: 1.02;
          }

          .mn-section-line,
          .mn-arenas-line,
          .mn-opener-card .mn-section-kicker,
          .mn-story-split .mn-section-kicker,
          .mn-editorial-kicker {
            font-size: 0.64rem;
            letter-spacing: 0.08em;
          }

          .mn-feature-grid .mn-copy-stack .mn-body,
          .mn-story-split .mn-copy-stack .mn-body,
          .mn-watchers-card .mn-body,
          .mn-sea-card .mn-body,
          .mn-arenas-column .mn-body,
          .mn-editorial-copy .mn-body,
          .mn-opener-card .mn-body,
          .mn-word-copy .mn-body {
            font-size: 0.82rem;
            line-height: 1.6;
          }

          .mn-copy-stack,
          .mn-story-split .mn-copy-stack,
          .mn-watchers-card .mn-copy-stack,
          .mn-sea-card .mn-copy-stack,
          .mn-arenas-column .mn-copy-stack,
          .mn-word-copy {
            gap: 12px;
          }

          .mn-quote-card {
            padding: 36px 0;
          }

          .mn-quote-text {
            padding: 22px 16px;
          }

          .mn-quote-card p {
            font-size: 0.84rem;
            line-height: 1.36;
          }

          .mn-watchers-editorial,
          .mn-sea-editorial {
            margin-top: 16px;
            margin-bottom: 16px;
          }

          .mn-editorial-title-watchers {
            font-size: 0.88rem;
          }

          .mn-editorial-title-sea {
            font-size: 1.18rem;
          }

          .mn-gallery-card,
          .mn-watchers-grid .mn-gallery-card {
            min-height: 220px;
          }

          .mn-tele-card,
          .mn-cliff-card,
          .mn-final-image-card {
            min-height: 260px;
          }

          .mn-finale-image {
            min-height: 280px;
          }

          .mn-finale-quote {
            padding: 18px 14px;
          }

          .mn-word-card {
            padding: 18px 16px;
            gap: 12px;
          }

          .mn-word-title {
            font-size: 0.8rem;
            letter-spacing: 0.08em;
            line-height: 1.42;
          }

          .mn-word-references {
            font-size: 0.62rem;
            letter-spacing: 0.1em;
          }

          .mn-opener-card {
            gap: 16px;
            padding: 16px 0 8px;
          }

          .mn-final-action {
            padding: 20px 16px;
          }

          .mn-action {
            min-height: 52px;
            font-size: 0.8rem;
          }

          .mn-action-caption {
            font-size: 0.72rem;
          }

          .mn-footer-links {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            max-width: 100%;
          }

          .mn-footer-link {
            white-space: nowrap;
            text-align: center;
            flex: 0 0 auto;
            text-transform: none;
          }

          .mn-footer-thin .mn-footer-link {
            font-size: 7px;
            letter-spacing: 0;
            font-weight: 200;
            line-height: 1;
          }

          .mn-footer {
            padding-left: 12px;
            padding-right: 12px;
          }

          .mn-audio-card {
            gap: 16px;
          }

          .mn-audio-title {
            font-size: clamp(1.04rem, 6.2vw, 1.28rem);
          }

          .mn-audio-meta,
          .mn-audio-time,
          .mn-audio-chapter-time,
          .mn-audio-sticky-meta {
            font-size: 0.58rem;
            letter-spacing: 0.08em;
          }

          .mn-audio-description,
          .mn-audio-note {
            font-size: 0.82rem;
            line-height: 1.54;
          }

          .mn-audio-controls {
            padding: 14px;
            gap: 12px;
          }

          .mn-audio-toggle {
            min-height: 42px;
            padding: 0 12px;
            font-size: 0.66rem;
            letter-spacing: 0.1em;
          }

          .mn-audio-current {
            font-size: 0.74rem;
          }

          .mn-audio-chapter {
            padding: 12px;
            gap: 10px;
            border-radius: 18px;
          }

          .mn-audio-chapter-index {
            min-width: 28px;
            min-height: 28px;
            font-size: 0.58rem;
          }

          .mn-audio-chapter-title {
            font-size: 0.76rem;
          }

          .mn-audio-sticky {
            width: calc(100vw - 16px);
            padding: 10px;
          }

          .mn-audio-sticky-toggle,
          .mn-audio-sticky-jump {
            min-height: 36px;
            padding: 0 10px;
            font-size: 0.6rem;
            letter-spacing: 0.08em;
          }

          .mn-audio-sticky-title {
            font-size: 0.72rem;
          }
        }

        @media (max-width: 320px) {
          .mn-footer {
            padding-left: 8px;
            padding-right: 8px;
          }

          .mn-footer-links {
            justify-content: center;
            gap: 4px;
          }

          .mn-footer-link {
            line-height: 1;
          }

          .mn-footer-thin .mn-note {
            font-size: 8px;
          }

          .mn-footer-thin .mn-footer-link {
            font-size: 6px;
            letter-spacing: 0;
            text-transform: none;
          }
        }
      `}</style>
      <div className="cursor" id="cursor" />
      <main className="mn-page">
        <div className="mn-shell">
          <section className="mn-intro-grid">
            <div className="mn-intro-card">
              <span className="mn-session">{page.sessionLabel}</span>
              <div className="mn-meta-row">
                {page.genres.map((genre) => (
                  <MetaPill key={genre} tone="mint">
                    {genre}
                  </MetaPill>
                ))}
                <MetaPill tone="mint">{page.format}</MetaPill>
              </div>
              <h1 className="mn-title">{page.title}</h1>
            </div>
            <aside className="mn-brief-card">
              <p className="mn-section-kicker">Consignes de déroulement</p>
              <div className="mn-brief-steps">
                {page.intro.notes.map((note, index) => (
                  <div className="mn-brief-step" key={note}>
                    <span className="mn-brief-index">{String(index + 1).padStart(2, "0")}</span>
                    <p className="mn-brief-text">{note}</p>
                  </div>
                ))}
              </div>
              <p className="mn-brief-note">{page.intro.estimatedDuration}</p>
            </aside>
          </section>
          <section className="mn-teaser-wrap">
            <div className="mn-teaser-card">
              <video
                className="mn-video"
                controlsList="nodownload noplaybackrate nofullscreen"
                disablePictureInPicture
                disableRemotePlayback
                id="mareeNoireVideo"
                playsInline
                poster={page.teaser.posterSrc}
                preload="auto"
              >
                <source data-desktop-src={page.teaser.desktopSrc} data-mobile-src={page.teaser.mobileSrc} />
              </video>
              <button aria-label="Lire le teaser" className="mn-player-overlay" id="mareeNoireOverlay" type="button">
                <span className="mn-player-button">
                  <span aria-hidden="true" className="mn-player-icon" />
                </span>
              </button>
            </div>
          </section>



          {audioData ? (
            <section className="mn-audio-card" ref={audioSectionRef}>
              <div className="mn-audio-head">
                <div className="mn-audio-copy">
                  {audioData.kicker ? <p className="mn-section-kicker mn-audio-kicker">{audioData.kicker}</p> : null}
                  <h2 className="mn-audio-title">{audioData.title}</h2>
                  <p className="mn-audio-meta">
                    {audioData.durationLabel} · {audioData.chapterCountLabel}
                  </p>
                  <p className="mn-audio-description">{audioData.description}</p>
                </div>
                <div className="mn-audio-controls">
                  <div className="mn-audio-transport">
                    <button
                      className={`mn-audio-toggle ${audioPlaying ? "is-playing" : ""}`}
                      onClick={toggleAudioPlayback}
                      type="button"
                    >
                      {audioPlaying
                        ? audioData.pauseLabel
                        : audioCurrentTime > 0
                          ? audioData.resumeLabel
                          : audioData.ctaLabel}
                    </button>
                    <div className="mn-audio-progress-block">
                      <div className="mn-audio-progress-head">
                        <span className="mn-audio-current">
                          {currentAudioChapter ? currentAudioChapter.title : audioData.stickyLabel}
                        </span>
                        <span className="mn-audio-time">
                          {formatAudioTime(audioCurrentTime)} / {formatAudioTime(resolvedAudioDuration)}
                        </span>
                      </div>
                      <input
                        aria-label="Progression du livre audio"
                        className="mn-audio-range"
                        max={resolvedAudioDuration || 1}
                        min="0"
                        onChange={handleAudioScrub}
                        step="0.1"
                        type="range"
                        value={Math.min(audioCurrentTime, resolvedAudioDuration || 0)}
                      />
                    </div>
                  </div>
                  <p className="mn-audio-note">{audioData.note}</p>
                </div>
              </div>
              <div className="mn-audio-chapters">
                {audioChapters.map((chapter, index) => (
                  <button
                    className={`mn-audio-chapter ${index === currentAudioChapterIndex ? "is-active" : ""}`}
                    key={chapter.label}
                    onClick={() => jumpToAudioChapter(chapter.time)}
                    type="button"
                  >
                    <span className="mn-audio-chapter-index">{chapter.label}</span>
                    <span className="mn-audio-chapter-copy">
                      <span className="mn-audio-chapter-title">{chapter.title}</span>
                      <span className="mn-audio-chapter-time">{formatAudioTime(chapter.time)}</span>
                    </span>
                  </button>
                ))}
              </div>
              <audio className="mn-audio-element" preload="metadata" ref={audioRef}>
                <source src={audioData.src} type={audioData.mimeType} />
              </audio>
            </section>
          ) : null}


          <section className="mn-pitch-card">
            {page.pitch.backgroundImage ? (
              <img alt="Pitch Marée Noire" className="mn-pitch-background" src={page.pitch.backgroundImage} />
            ) : null}
            <h2 className="mn-pitch-word">{page.pitch.word}</h2>
            <div className="mn-pitch-copy">
              {page.pitch.paragraphs.map((paragraph) => (
                <p className="mn-body" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mn-pitch-line">{page.pitch.finalLine}</div>
          </section>

          <section className="mn-body-shell">
            <div className="mn-body-shell-inner">
              <section className="mn-section-band">
                {page.dive.imageSrc ? <img alt="Dive into intrigue" src={page.dive.imageSrc} /> : null}
                <div className="mn-section-band-copy">
                  <RichText className="mn-section-band-title" html={page.dive.titleHtml} />
                </div>
              </section>

              <section className="mn-dive-grid">
                <div className="mn-copy-cell">
                  <RichText
                    className="mn-dive-hook"
                    html={`${page.dive.leftIntroHtml}<span class="mn-dive-dot">.</span>`}
                  />
                  <div className="mn-dive-beats">
                    {page.dive.beats.map((beat) => (
                      <p key={beat}>{beat}</p>
                    ))}
                  </div>
                  <RichText className="mn-dive-accent" html={page.dive.accentHtml} />
                  {page.dive.beachImage ? (
                    <section className="mn-image-band mn-image-band-mobile-inline">
                      <img alt="Noé sur la plage" src={page.dive.beachImage} />
                    </section>
                  ) : null}
                </div>
                <div className="mn-copy-cell">
                  <div className="mn-copy-stack">
                    {page.dive.paragraphs.map((paragraph, index) => (
                      <p className="mn-body" key={`dive-${index}`}>
                        <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              {page.dive.beachImage ? (
                <section className="mn-image-band mn-image-band-default">
                  <img alt="Noé sur la plage" src={page.dive.beachImage} />
                </section>
              ) : null}

              {page.characterFeatures.map((character) => (
                <SplitFeature character={character} item={character} key={character.nameHtml} />
              ))}

              {page.profiles.map((profile) => (
                <ProfileFeature item={profile} key={profile.name} />
              ))}

              <section className="mn-arenas-shell">
                <header className="mn-arenas-header">
                  <h2 className="mn-arenas-title">{page.arenas.title}</h2>
                </header>

                <section className="mn-arenas-grid">
                {page.arenas.columns.map((column) => (
                  <article className="mn-arenas-column" key={column.tag}>
                    <div className="mn-arenas-line">
                      <span>{column.tag}</span>
                    </div>
                    <h3 className="mn-arenas-column-title">{column.title}</h3>
                    <div className="mn-copy-stack">
                      {column.paragraphs.map((paragraph, index) => (
                        <p className="mn-body" key={`${column.tag}-${index}`}>
                          <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
                </section>
              </section>

              <section className="mn-gallery-grid">
                {page.arenas.gallery.slice(0, 4).map((image) => (
                  <article className="mn-gallery-card" data-label={image.label} key={image.label} tabIndex={0}>
                    {image.src ? <img alt={image.label} src={image.src} /> : null}
                  </article>
                ))}
              </section>

              {page.arenas.finaleImage ? (
                <section className="mn-finale-image">
                  <img alt="Arènes de Marée Noire" src={page.arenas.finaleImage} />
                  <div className="mn-finale-quote">
                    <RichText className="mn-finale-copy" html={`<p>${page.arenas.finaleQuoteHtml}</p>`} />
                    <p className="mn-finale-subline">{page.arenas.finaleSubline}</p>
                  </div>
                </section>
              ) : null}

              <section className="mn-opener-card">
                <p className="mn-section-kicker">{page.longArc.opening.kicker}</p>
                <RichText className="mn-section-title" html={page.longArc.opening.titleHtml} />
                <div className="mn-copy-stack">
                  {page.longArc.opening.paragraphs.map((paragraph) => (
                    <p className="mn-body" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              {page.longArc.teleImage ? (
                <section className="mn-tele-card">
                  <img alt={page.longArc.teleCaption} src={page.longArc.teleImage} />
                </section>
              ) : null}

              <section className="mn-quote-card">
                <RichText className="mn-quote-text" html={`<p>${page.longArc.secretsQuoteHtml}</p>`} />
              </section>

              {page.longArc.splits.slice(0, 3).map((item) => (
                <LongArcSplit item={item} key={item.kicker} />
              ))}

              {page.longArc.seaImage ? (
                <section className="mn-image-band">
                  <img alt="La mer de Marée Noire" src={page.longArc.seaImage} />
                </section>
              ) : null}

              <LongArcSplit item={page.longArc.splits[3]} />

              <section className="mn-quote-card mn-quote-card-before-watchers">
                <RichText className="mn-quote-text" html={`<p>${page.longArc.investigationQuoteHtml}</p>`} />
              </section>

              <section className="mn-watchers-editorial">
                <p className="mn-editorial-kicker">{page.longArc.watchers.kicker}</p>
                <RichText className="mn-editorial-title mn-editorial-title-watchers" html={page.longArc.watchers.titleHtml ?? page.longArc.watchers.title} />
                <div className="mn-editorial-copy">
                  {page.longArc.watchers.paragraphs.map((paragraph) => (
                    <p className="mn-body" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              <section className="mn-watchers-grid">
                {page.longArc.watchers.gridImages.map((image, index) => (
                  <article className="mn-gallery-card" key={`watcher-${index}`}>
                    {image ? <img alt={`Veilleurs ${index + 1}`} src={image} /> : null}
                  </article>
                ))}
              </section>

              {page.longArc.watchers.cliffImage ? (
                <section className="mn-cliff-card">
                  <img alt="Les Veilleurs face à la mer" src={page.longArc.watchers.cliffImage} />
                </section>
              ) : null}

              <section className="mn-sea-editorial">
                <p className="mn-editorial-kicker">{page.longArc.seaConclusion.kicker}</p>
                <RichText className="mn-editorial-title mn-editorial-title-sea" html={page.longArc.seaConclusion.titleHtml} />
                <div className="mn-editorial-copy">
                  {page.longArc.seaConclusion.paragraphs.map((paragraph) => (
                    <p className="mn-body" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              {page.longArc.finalImage ? (
                <section className="mn-final-image-card">
                  <img alt="Noé" src={page.longArc.finalImage} />
                </section>
              ) : null}
            </div>
          </section>

          <section className="mn-word-card">
            <h3 className="mn-word-title">Le mot de Give Me The Pitch</h3>
            <div className="mn-word-copy">
              <p className="mn-body">
                Avec <span className="mn-word-inline">Marée noire</span>, notre intention était de développer un projet capable d’articuler exigence
                narrative, puissance émotionnelle et véritable singularité d’univers.
                <br />
                Le retour de Noé, huit ans
                après sa disparition, ne constitue pas seulement un point de départ dramatique&nbsp;: il agit comme une
                déflagration intime et collective.
              </p>
              <p className="mn-body">
                Dans cette perspective, <span className="mn-word-inline">Marée noire</span> dialogue naturellement avec des œuvres comme{" "}
                <span className="mn-word-emphasis">Les Revenants</span>,{" "}
                <span className="mn-word-emphasis">Broadchurch</span> et{" "}
                <span className="mn-word-emphasis">The Leftovers</span> : pour leur sens du trouble,
                l’épaisseur de leurs personnages et leur capacité à faire du mystère un moteur de récit sans jamais
                rompre le lien avec l’émotion.
              </p>
            </div>
          </section>

          <section className="mn-final-action">
            <Link className="mn-action" href={PANEL_PUBLIC_TEST_PATH}>
              {page.longArc.finalActionLabel}
            </Link>
          </section>

          {audioData ? (
            <div className={`mn-audio-sticky ${audioHasStarted && audioStickyVisible ? "is-visible" : ""}`}>
              <button
                className={`mn-audio-sticky-toggle ${audioPlaying ? "is-playing" : ""}`}
                onClick={toggleAudioPlayback}
                type="button"
              >
                {audioPlaying ? "Pause" : "Lire"}
              </button>
              <div className="mn-audio-sticky-copy">
                <span className="mn-audio-sticky-title">
                  {currentAudioChapter ? currentAudioChapter.title : audioData.stickyLabel}
                </span>
                <span className="mn-audio-sticky-meta">
                  {formatAudioTime(audioCurrentTime)} / {formatAudioTime(resolvedAudioDuration)}
                </span>
                <div className="mn-audio-sticky-progress">
                  <span style={{ width: `${audioProgress}%` }} />
                </div>
              </div>
              <button className="mn-audio-sticky-jump" onClick={focusAudioPlayer} type="button">
                {audioData.compactJumpLabel}
              </button>
            </div>
          ) : null}

          <footer className="mn-footer mn-footer-thin">
            <div className="mn-footer-links">
              {page.footerLinks.map((link) => (
                <Link className="mn-footer-link" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="mn-note">© GIVE ME THE PITCH</p>
          </footer>
        </div>
      </main>
    </>
  );
}
