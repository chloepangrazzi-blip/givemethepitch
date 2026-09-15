"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";
import { PANEL_PUBLIC_TEST_PATH } from "../../lib/public-paths";
import {
  SIGNAL_SESSION_CLOSED_CTA_HREF,
  SIGNAL_SESSION_CLOSED_CTA_LABEL,
  SIGNAL_SESSION_CLOSED_TEXT,
  SIGNAL_SESSION_CLOSED_TITLE,
} from "../../lib/campaign-access";

const SIGNALS = [
  "Intrigue",
  "Attachement",
  "Tension",
  "Curiosité",
  "Trouble",
  "Désir de suite",
];

const WAVEFORM_BARS = [10, 18, 28, 38, 44, 36, 24, 16, 14, 22, 34, 46, 40, 30, 18, 12, 16, 26, 42, 50, 44, 32, 20, 14, 12, 20, 30, 42, 36, 24, 16, 10];

const CHAPTERS = [
  {
    id: "noe",
    number: "01",
    nav: "Le retour de Noé",
    signal: "Intrigue",
    feedback: "Signal reçu.",
    title: "Le retour de Noé",
    imageKey: "noe",
    audio: {
      label: "Enregistrement de l'intervention — 1:04",
      theme: "Enregistrement de l'intervention",
      duration: "1:04",
      src: "/audio/maree-noire-fragment-01-intervention.mp4",
    },
    paragraphs: [],
    question: "Ce retour ressemble d'abord à…",
    answers: ["un miracle", "une menace", "une erreur", "un secret qui remonte"],
    answerValues: {
      "un miracle": 70,
      "une menace": 90,
      "une erreur": 45,
      "un secret qui remonte": 100,
    },
    bonusIntro: "Accéder à la fiche personnage de Noé.",
    bonusTitle: "Noé",
    bonusCharacterNames: ["Noé"],
  },
  {
    id: "meres",
    number: "02",
    nav: "Deux mères",
    signal: "Attachement",
    feedback: "Signal reçu.",
    title: "Deux mères",
    imageKey: "meres",
    audio: {
      label: "Message audio de Camille — 1:52",
      theme: "Message audio de Camille",
      duration: "1:52",
      src: "/audio/maree-noire-fragment-02-camille.mp4",
    },
    paragraphs: [],
    question: "Face au retour de Noé, ce qui vous intéresse le plus est…",
    answers: ["ce qu'elles veulent croire", "ce qu'elles refusent de voir", "ce qu'elles se cachent", "ce que Noé leur fait redevenir"],
    answerValues: {
      "ce qu'elles veulent croire": 75,
      "ce qu'elles refusent de voir": 80,
      "ce qu'elles se cachent": 90,
      "ce que Noé leur fait redevenir": 100,
    },
    bonusIntro: "Accéder à la fiche personnage de Soaz et Camille.",
    bonusTitle: "Soaz & Camille",
    bonusCharacterNames: ["Soaz", "Camille"],
  },
  {
    id: "ville",
    number: "03",
    nav: "Sous la surface",
    signal: "Tension",
    feedback: "Signal reçu.",
    title: "Sous la surface",
    imageKey: "ville",
    audio: {
      label: "Archives appel à témoins - 2018 — 3:55",
      theme: "Archives appel à témoins - 2018",
      duration: "3:55",
      src: "/audio/maree-noire-fragment-03-repondeur-appel-temoins.mp4",
    },
    paragraphs: [],
    question: "Dans cette ville, le danger semble venir…",
    answers: ["des silences", "de la mer", "des habitants", "de ce qu'on a enterré"],
    answerValues: {
      "des silences": 85,
      "de la mer": 90,
      "des habitants": 75,
      "de ce qu'on a enterré": 100,
    },
  },
  {
    id: "chercheurs",
    number: "04",
    nav: "Ceux qui cherchent",
    signal: "Curiosité",
    feedback: "Signal reçu.",
    title: "Ceux qui cherchent",
    imageKey: "chercheurs",
    audio: {
      label: "Notes vocales de Vera — 1:23",
      theme: "Notes vocales de Vera",
      duration: "1:23",
      src: "/audio/maree-noire-fragment-04-vera.mp4",
    },
    paragraphs: [],
    question: "Pour approcher la vérité, vous suivriez plutôt…",
    answers: ["l'instinct d'Iroise", "l'enquête de Vikram", "la science de Vera", "personne ne semble fiable"],
    answerValues: {
      "l'instinct d'Iroise": 80,
      "l'enquête de Vikram": 75,
      "la science de Vera": 85,
      "personne ne semble fiable": 95,
    },
    bonusIntro: "Accéder aux fiches des trois points de vue.",
    bonusTitle: "Trois regards sur l'impossible",
    bonusCharacterNames: ["Iroise", "Vikram", "Vera"],
  },
  {
    id: "veilleurs",
    number: "05",
    nav: "Les Veilleurs",
    signal: "Trouble",
    feedback: "Signal reçu.",
    title: "Les Veilleurs",
    imageKey: "veilleurs",
    audio: {
      label: "Discours de Lenn — 1:51",
      theme: "Discours de Lenn",
      duration: "1:51",
      src: "/audio/maree-noire-fragment-05-lenn.mp4",
    },
    paragraphs: [],
    question: "Ce qui trouble le plus chez les Veilleurs, c'est…",
    answers: ["ce qu'ils croient", "ce qu'ils savent peut-être", "leur emprise sur la ville", "le besoin qu'ils viennent combler"],
    answerValues: {
      "ce qu'ils croient": 80,
      "ce qu'ils savent peut-être": 95,
      "leur emprise sur la ville": 90,
      "le besoin qu'ils viennent combler": 85,
    },
    bonusIntro: "Accéder au dossier confidentiel des Veilleurs.",
    bonusTitle: "Lenn & Le Braz",
    archive: true,
    bonusCharacterNames: ["Lenn", "Le Braz"],
  },
  {
    id: "mer",
    number: "06",
    nav: "Ce que la mer réclame",
    signal: "Désir de suite",
    feedback: "Signal reçu.",
    title: "Ce que la mer réclame",
    imageKey: "mer",
    audio: {
      label: "Appel téléphonique de Soaz — 0:48",
      theme: "Appel téléphonique de Soaz",
      duration: "0:48",
      src: "/audio/maree-noire-fragment-06-soaz.mp4",
    },
    paragraphs: [],
    question: "À ce stade, vous voulez surtout savoir…",
    answers: ["où Noé était", "ce que la ville cache", "ce que la mer réclame", "qui manipule le récit"],
    answerValues: {
      "où Noé était": 80,
      "ce que la ville cache": 85,
      "ce que la mer réclame": 100,
      "qui manipule le récit": 90,
    },
  },
];

function formatTime(value) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderInlineMarkdown(text) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${part}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    return <span key={key}>{part}</span>;
  });
}

function buildBonusCard(character) {
  return {
    title: character.name,
    meta: character.meta,
    paragraphs: character.paragraphs,
  };
}

function getChaptersWithEditorial(page) {
  const editorialChapters = new Map((page?.editorial?.chapters ?? []).map((chapter) => [chapter.number, chapter]));
  const editorialCharacters = new Map((page?.editorial?.characters ?? []).map((character) => [character.name, character]));

  return CHAPTERS.map((chapter) => {
    const editorialChapter = editorialChapters.get(chapter.number);
    const bonusCards = (chapter.bonusCharacterNames ?? [])
      .map((name) => editorialCharacters.get(name))
      .filter(Boolean)
      .map(buildBonusCard);

    return {
      ...chapter,
      nav: editorialChapter?.title ?? chapter.nav,
      title: editorialChapter?.title ?? chapter.title,
      paragraphs: editorialChapter?.paragraphs?.length ? editorialChapter.paragraphs : chapter.paragraphs,
      bonusCards,
    };
  });
}

function uniqueImages(values) {
  return [...new Set(values.filter(Boolean))];
}

function getSignalValues(answers, chapters = CHAPTERS) {
  return chapters.reduce((values, chapter) => {
    const answer = answers[chapter.id];
    return {
      ...values,
      [chapter.signal]: answer ? chapter.answerValues?.[answer] ?? 0 : 0,
    };
  }, Object.fromEntries(SIGNALS.map((signal) => [signal, 0])));
}

function getImages(page) {
  if (page?.experienceImages) return page.experienceImages;

  const featureByName = new Map(
    (page?.characterFeatures ?? []).map((item) => [String(item.nameHtml || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), item.imageSrc])
  );
  const profileByName = new Map((page?.profiles ?? []).map((item) => [item.name, item.imageSrc]));
  const dossierCharacterImage = (name) => page?.dossier?.characters?.items?.find((item) => item.name === name)?.image;
  const arenaGallery = [
    ...(page?.arenas?.gallery ?? []).map((item) => item?.src),
    ...(page?.dossier?.arenas?.gallery ?? []),
  ];
  const sets = {
    noe: uniqueImages([profileByName.get("Noé"), page?.dive?.beachImage]),
    meres: uniqueImages([featureByName.get("SOAZ & CAMILLE"), dossierCharacterImage("Soaz & Camille"), page?.longArc?.splits?.[2]?.imageSrc]),
    ville: uniqueImages([page?.arenas?.finaleImage, ...arenaGallery, page?.hero?.imageSrc]),
    chercheurs: uniqueImages([
      featureByName.get("IROISE"),
      featureByName.get("VIKRAM"),
      featureByName.get("VERA"),
      dossierCharacterImage("Iroise"),
      dossierCharacterImage("Vikram"),
      dossierCharacterImage("Vera"),
    ]),
    veilleurs: uniqueImages([profileByName.get("Lenn"), profileByName.get("Le Braz"), ...(page?.longArc?.watchers?.gridImages ?? [])]),
    mer: uniqueImages([page?.longArc?.seaImage, page?.longArc?.finalImage, page?.hero?.imageSrc]),
  };

  return {
    hero: page?.hero?.imageSrc || page?.pitch?.backgroundImage || page?.teaser?.posterSrc || "/catalogue-posters/maree-noire.png",
    teaserPoster: page?.teaser?.posterSrc || "/catalogue-posters/maree-noire.png",
    sets,
    noe: sets.noe[0],
    meres: sets.meres[0],
    ville: sets.ville[0],
    chercheurs: sets.chercheurs[0],
    veilleurs: sets.veilleurs[0],
    mer: sets.mer[0],
  };
}

function SignalBarometer({ answeredSignals, signalValues, compact = false }) {
  const activeCount = answeredSignals.size;
  const progress = Math.round((activeCount / SIGNALS.length) * 100);
  const radarLevel = activeCount >= 5 ? "strong" : activeCount >= 3 ? "medium" : activeCount >= 1 ? "soft" : "idle";

  return (
    <aside className={`mnv2-barometer ${compact ? "is-compact" : ""}`} aria-label="Baromètre du signal">
      <div>
        <p className="mnv2-eyebrow">Votre signal</p>
      </div>
      <div className={`mnv2-radar is-${radarLevel}`} aria-hidden="true" style={{ "--signal-progress": `${progress}%` }}>
        <span />
        <span />
        <span />
        <strong />
      </div>
      <div className="mnv2-signal-list">
        {SIGNALS.map((signal) => {
          const value = signalValues?.[signal] ?? 0;
          const isActive = value > 0;
          return (
            <div className={`mnv2-signal ${isActive ? "is-active" : ""}`} key={signal} style={{ "--signal-value": `${value}%` }}>
              <span aria-hidden="true" />
              <strong>{signal}</strong>
              <em>{value}</em>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ExperienceRail({ activeChapter, answeredSignals, chapters = CHAPTERS }) {
  const answeredCount = answeredSignals.size;
  const progressLabel = answeredCount === 0
    ? "Signal en attente"
    : answeredCount === chapters.length
      ? "Parcours complet"
      : "Signal en cours";

  return (
    <aside className="mnv2-rail" aria-label="Cartographie de l'expérience">
      <a className="mnv2-rail-logo" href="#top">Marée<br />Noire</a>
      <div className="mnv2-rail-block">
        <p>Projet série<br />thriller fantastique</p>
      </div>
      <nav className="mnv2-rail-nav" aria-label="Chapitres">
        <span>Découverte</span>
        {chapters.map((chapter) => (
          <a className={activeChapter === chapter.id ? "is-active" : ""} href={`#chapter-${chapter.id}`} key={chapter.id}>
            {chapter.nav}
          </a>
        ))}
        <a className={activeChapter === "final" ? "is-active" : ""} href="#signal-final">Votre signal</a>
      </nav>
      <div className="mnv2-rail-progress">
        <span>{progressLabel}</span>
        <strong>{answeredCount} / 6 fragments</strong>
        <div>
          {chapters.map((chapter) => (
            <i className={answeredSignals.has(chapter.signal) ? "is-active" : ""} key={chapter.id} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function FragmentAudio({ audio, id, playingId, setPlayingId }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const isPlaying = playingId === id;

  useEffect(() => {
    const node = ref.current;
    if (!node || isPlaying) return undefined;
    node.pause();
    return undefined;
  }, [isPlaying]);

  const toggle = async () => {
    const node = ref.current;
    if (!node) return;

    if (isPlaying) {
      node.pause();
      setPlayingId(null);
      return;
    }

    setPlayingId(id);
    try {
      await node.play();
    } catch {
      setPlayingId(null);
    }
  };

  const scrub = (event) => {
    const node = ref.current;
    if (!node) return;
    const next = Number(event.target.value);
    node.currentTime = next;
    setCurrent(next);
    setProgress(duration ? (next / duration) * 100 : 0);
  };

  return (
    <div className={`mnv2-audio ${isPlaying ? "is-playing" : ""}`}>
      <p className="mnv2-eyebrow">Écouter l'extrait</p>
      <div className="mnv2-audio-meta">
        <strong>{audio.theme || audio.label}</strong>
        <span>{audio.duration}</span>
      </div>
      <audio
        ref={ref}
        preload="none"
        src={audio.src}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => {
          const node = event.currentTarget;
          setCurrent(node.currentTime || 0);
          setProgress(node.duration ? (node.currentTime / node.duration) * 100 : 0);
        }}
        onPause={() => {
          if (playingId === id) setPlayingId(null);
        }}
        onEnded={() => setPlayingId(null)}
      />
      <button className={`mnv2-audio-button ${isPlaying ? "is-playing" : ""}`} type="button" onClick={toggle} aria-label={audio.label}>
        <span className="mnv2-play-icon" aria-hidden="true" />
      </button>
      <span className="mnv2-waveform" aria-hidden="true">
        {WAVEFORM_BARS.map((height, index) => (
          <i key={`${height}-${index}`} style={{ "--wave-height": `${height}px`, "--wave-index": index }} />
        ))}
      </span>
      <div className="mnv2-audio-progress">
        <input
          aria-label="Progression audio"
          min="0"
          max={duration || 0}
          step="0.1"
          type="range"
          value={current}
          onChange={scrub}
          style={{ "--audio-progress": `${progress}%` }}
        />
        <span>{formatTime(current)}</span>
      </div>
    </div>
  );
}

function Bonus({ item, children }) {
  const isChapterBonus = Boolean(item.bonusTitle || item.bonusIntro);

  return (
    <details className={`mnv2-bonus ${item.archive ? "is-archive" : ""}`}>
      <summary>
        <span>{isChapterBonus ? "Bonus" : item.title}</span>
        <p>{item.bonusIntro || item.cta || "Accéder au contenu bonus."}</p>
        <em>{isChapterBonus ? "Ouvrir le bonus" : item.cta}</em>
      </summary>
      <div className="mnv2-bonus-panel">
        {children}
        <span className="mnv2-close-copy">Refermer avec le bouton du dossier.</span>
      </div>
    </details>
  );
}

function BonusCard({ card }) {
  const [name, parsedMeta, ...tagParts] = card.title.split(" — ");
  const meta = card.meta ?? parsedMeta;
  const tags = tagParts.join(" — ");

  return (
    <article>
      <div className="mnv2-bonus-card-head">
        {card.hideTitle ? null : <h4>{name}</h4>}
        {meta ? <span className="mnv2-bonus-meta">{renderInlineMarkdown(meta)}</span> : null}
        {tags ? <span className="mnv2-bonus-tag">{tags}</span> : null}
      </div>
      <i aria-hidden="true" />
      <div className="mnv2-bonus-card-copy">
        {(card.paragraphs || [card.text]).filter(Boolean).map((paragraph) => (
          <p key={paragraph}>{renderInlineMarkdown(paragraph)}</p>
        ))}
      </div>
    </article>
  );
}

function MicroSignal({ chapter, answer, onAnswer }) {
  return (
    <div className="mnv2-micro">
      <p className="mnv2-eyebrow">Laissez un signal</p>
      <h3>{chapter.question}</h3>
      <div className="mnv2-chip-grid">
        {chapter.answers.map((option) => (
          <button
            className={answer === option ? "is-selected" : ""}
            key={option}
            type="button"
            onClick={() => onAnswer(chapter.id, option)}
            aria-pressed={answer === option}
          >
            {option}
          </button>
        ))}
      </div>
      <p className="mnv2-feedback" aria-live="polite">
        {answer ? chapter.feedback : "Un clic suffit. Vous pourrez modifier votre réponse."}
      </p>
    </div>
  );
}

function Chapter({ chapter, chapters, images = [], active, answer, onAnswer, playingId, setPlayingId, answeredSignals, signalValues }) {
  const chapterImages = images.filter(Boolean);
  const activeImage = chapterImages[0] || null;
  const stackedMediaLimit = ["ville", "chercheurs", "veilleurs", "mer"].includes(chapter.id) ? 3 : chapter.id === "noe" || chapter.id === "meres" ? 2 : 0;
  const stackedMediaClass = stackedMediaLimit === 3 ? "is-trio" : stackedMediaLimit === 2 ? "is-duo" : "";
  const hasBonus = Boolean(chapter.bonusCards?.length || chapter.bonusBody?.length);

  return (
    <section className={`mnv2-chapter ${active ? "is-active" : ""}`} id={`chapter-${chapter.id}`} data-chapter-id={chapter.id}>
      <ExperienceRail activeChapter={chapter.id} answeredSignals={answeredSignals} chapters={chapters} />
      <div className="mnv2-chapter-index">
        <strong>{chapter.number}</strong>
        <span>Chapitre</span>
        <i className={answer ? "is-complete" : ""} />
      </div>
      <div className={`mnv2-chapter-media ${stackedMediaClass}`}>
        {stackedMediaLimit ? (
          chapterImages.slice(0, stackedMediaLimit).map((src) => <img alt="" loading="lazy" src={src} key={src} />)
        ) : activeImage ? (
          <img alt="" loading="lazy" src={activeImage} />
        ) : null}
        {!stackedMediaLimit && chapterImages.length > 1 ? (
          <div className="mnv2-media-stack" aria-hidden="true">
            {chapterImages.slice(1, 3).map((src) => (
              <img alt="" loading="lazy" src={src} key={src} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="mnv2-chapter-copy">
        <p className="mnv2-eyebrow">{chapter.nav}</p>
        <h2>{chapter.title}</h2>
        <div className="mnv2-copy-stack">
          {chapter.paragraphs.map((paragraph) => (
            <p key={paragraph}>{renderInlineMarkdown(paragraph)}</p>
          ))}
        </div>
      </div>
      <SignalBarometer answeredSignals={answeredSignals} signalValues={signalValues} compact />
      <div className="mnv2-chapter-controls">
        <FragmentAudio audio={chapter.audio} id={chapter.id} playingId={playingId} setPlayingId={setPlayingId} />
        <MicroSignal chapter={chapter} answer={answer} onAnswer={onAnswer} />
        {hasBonus ? (
          <Bonus item={chapter}>
            {chapter.bonusCards?.length ? (
              <div className="mnv2-bonus-grid">
                {chapter.bonusCards.map((card) => (
                  <BonusCard card={card} key={card.title} />
                ))}
              </div>
            ) : null}
            {chapter.bonusBody?.map((paragraph) => (
              <p key={paragraph}>{renderInlineMarkdown(paragraph)}</p>
            ))}
          </Bonus>
        ) : null}
      </div>
    </section>
  );
}

export default function MareeNoirePageClient({ page, sessionClosed = false }) {
  useDesktopCursor({
    hoverSelector: "button, a, video, summary, input[type='range']",
    spotlightSelector: ".mnv2-chapter, .mnv2-audio, .mnv2-bonus, .mnv2-teaser-card, .mnv2-final",
  });

  const images = useMemo(() => getImages(page), [page]);
  const chapters = useMemo(() => getChaptersWithEditorial(page), [page]);
  const [answers, setAnswers] = useState({});
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id);
  const [playingId, setPlayingId] = useState(null);
  const teaserVideoRef = useRef(null);
  const [teaserStarted, setTeaserStarted] = useState(false);
  const heroGuide = page?.experienceGuide ?? {
    title: "Consignes",
    duration: "Parcours essentiel : 7-10 min environ",
    secondaryDuration: "Bonus en lecture libre",
    items: [
      "Regardez le teaser pour entrer dans l'atmosphère.",
      "Traversez les 6 fragments essentiels.",
      "Écoutez les courts segments audio immersifs si vous le souhaitez.",
      "Ouvrez les bonus uniquement pour approfondir.",
    ],
  };
  const heroTitle = page?.title ?? "Marée Noire";
  const heroTagline = page?.hero?.tagline ?? "La mer remonte ce qu'on enterre";
  const heroGenre = page?.genres?.length ? page.genres.join(" · ") : "Thriller fantastique";
  const heroFormat = page?.format ?? "6 × 52 min";
  const answeredSignals = useMemo(() => {
    const active = new Set();
    chapters.forEach((chapter) => {
      if (answers[chapter.id]) active.add(chapter.signal);
    });
    return active;
  }, [answers, chapters]);
  const signalValues = useMemo(() => getSignalValues(answers, chapters), [answers, chapters]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("[data-chapter-id]"));
    if (!nodes.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target) setActiveChapter(visible.target.getAttribute("data-chapter-id"));
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.12, 0.3, 0.5] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const answerSignal = (chapterId, value) => {
    setAnswers((current) => ({ ...current, [chapterId]: value }));
  };

  const startTeaser = async () => {
    const video = teaserVideoRef.current;

    if (!video) return;

    setTeaserStarted(true);

    try {
      await video.play();
    } catch {
      setTeaserStarted(false);
    }
  };

  if (sessionClosed) {
    return (
      <main className="mnv2-page">
        <section className="mnv2-closed">
          <h1>{SIGNAL_SESSION_CLOSED_TITLE}</h1>
          <p>{SIGNAL_SESSION_CLOSED_TEXT}</p>
          <Link className="mnv2-primary" href={SIGNAL_SESSION_CLOSED_CTA_HREF}>
            {SIGNAL_SESSION_CLOSED_CTA_LABEL}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mnv2-page">
      <style>{`
        :root {
          --mnv2-bg: #030404;
          --mnv2-panel: rgba(7, 9, 9, 0.82);
          --mnv2-panel-strong: #090c0c;
          --mnv2-line: rgba(var(--mnv2-mint-rgb), 0.18);
          --mnv2-line-strong: rgba(var(--mnv2-mint-rgb), 0.42);
          --mnv2-text: #f7fbf8;
          --mnv2-muted: rgba(247, 251, 248, 0.74);
          --mnv2-soft: rgba(247, 251, 248, 0.54);
          --mnv2-mint: #c6fff1;
          --mnv2-mint-rgb: 198, 255, 241;
          --mnv2-rose: #f0bdce;
          --mnv2-gold: #e5cf94;
          --mnv2-shadow: 0 28px 90px rgba(0, 0, 0, 0.45);
          --mnv2-sans: "Poppins", "Avenir Next", "Helvetica Neue", sans-serif;
          --mnv2-display: "Horizon", "Made Soulmaze", "Poppins", sans-serif;
        }

        html { scroll-behavior: smooth; }
        body { margin: 0; background: var(--mnv2-bg); color: var(--mnv2-text); font-family: var(--mnv2-sans); }
        * { box-sizing: border-box; }

        .mnv2-page {
          min-height: 100vh;
          overflow-x: clip;
          background:
            radial-gradient(circle at 74% 12%, rgba(var(--mnv2-mint-rgb), 0.12), transparent 22rem),
            radial-gradient(circle at 16% 42%, rgba(var(--mnv2-mint-rgb), 0.055), transparent 26rem),
            linear-gradient(180deg, #020303 0%, #050707 46%, #020303 100%);
          color: var(--mnv2-text);
        }

        .mnv2-hero {
          position: relative;
          min-height: 100svh;
          display: grid;
          align-items: end;
          padding: clamp(74px, 7vw, 108px) clamp(18px, 4vw, 52px) clamp(28px, 5vw, 64px);
          isolation: isolate;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-bottom-color: rgba(var(--mnv2-mint-rgb), 0.22);
        }

        .mnv2-hero-bg,
        .mnv2-hero-bg img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .mnv2-hero-bg img {
          object-fit: cover;
          object-position: center;
          filter: saturate(0.96) contrast(1.04) brightness(1.18);
        }
        .mnv2-hero-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.62), rgba(0,0,0,0.08) 52%, rgba(0,0,0,0.42)),
            linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.58));
        }

        .mnv2-hero-inner {
          position: relative;
          z-index: 1;
          width: min(1440px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(300px, 0.38fr);
          gap: clamp(22px, 4vw, 64px);
          align-items: stretch;
        }

        .mnv2-hero-inner > div {
          display: grid;
        }

        .mnv2-eyebrow {
          margin: 0;
          color: var(--mnv2-rose);
          font-size: 0.74rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          line-height: 1.45;
          text-transform: uppercase;
        }

        .mnv2-hero-main-title {
          margin: 18px 0 16px;
          font-family: var(--mnv2-display);
          font-size: clamp(2.8rem, 5vw, 5.8rem);
          font-weight: 400;
          letter-spacing: 0;
          line-height: 0.9;
          text-transform: uppercase;
          max-width: 100%;
          overflow-wrap: normal;
        }

        .mnv2-hero-subtitle {
          margin: 0 0 24px;
          color: var(--mnv2-mint);
          font-size: clamp(1rem, 1.6vw, 1.34rem);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .mnv2-lead {
          width: min(560px, 100%);
          display: grid;
          gap: 14px;
          color: rgba(255,255,255,0.86);
          font-size: clamp(1rem, 1.4vw, 1.18rem);
          line-height: 1.75;
          font-weight: 300;
        }

        .mnv2-hero-project {
          width: min(780px, 100%);
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(14px, 1.8vw, 22px);
          align-items: stretch;
          padding: clamp(22px, 2.2vw, 34px);
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.34);
          border-radius: 16px;
          background: transparent;
          box-shadow: none;
          height: 100%;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.72);
        }

        .mnv2-hero-project-copy {
          display: grid;
          gap: clamp(12px, 1.5vw, 18px);
          align-content: center;
          min-width: 0;
          padding: 0;
        }

        .mnv2-hero-project-kicker {
          margin: 0;
          color: var(--mnv2-mint);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          line-height: 1.35;
          text-transform: uppercase;
        }

        .mnv2-hero .mnv2-hero-project-title {
          margin: 0;
          font-family: var(--mnv2-display);
          color: var(--mnv2-text);
          font-size: clamp(2.8rem, 5vw, 5.8rem);
          font-weight: 400;
          letter-spacing: 0;
          line-height: 0.9;
          text-transform: uppercase;
        }

        .mnv2-hero-tagline {
          margin: 0;
          color: var(--mnv2-mint);
          font-size: clamp(1rem, 1.35vw, 1.22rem);
          font-weight: 500;
          letter-spacing: 0.1em;
          line-height: 1.45;
          text-transform: uppercase;
        }

        .mnv2-hero-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin: 2px 0 0;
        }

        .mnv2-hero-meta div {
          min-width: 0;
          padding: 10px 12px;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.26);
          border-radius: 10px;
          background: transparent;
        }

        .mnv2-hero-meta dt {
          margin: 0 0 4px;
          color: rgba(var(--mnv2-mint-rgb), 0.72);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          line-height: 1.35;
          text-transform: uppercase;
        }

        .mnv2-hero-meta dd {
          margin: 0;
          color: var(--mnv2-text);
          font-size: 0.82rem;
          font-weight: 500;
          line-height: 1.35;
        }

        .mnv2-hero-access {
          margin: 16px 0 0;
          color: var(--mnv2-mint);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          line-height: 1.6;
        }

        .mnv2-hero-guide {
          justify-self: end;
          width: min(390px, 100%);
          display: grid;
          gap: 18px;
          padding: clamp(22px, 2.3vw, 32px);
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.34);
          border-radius: 16px;
          background: transparent;
          box-shadow: none;
          height: 100%;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.72);
        }

        .mnv2-hero-guide h2 {
          margin: 0;
          color: var(--mnv2-mint);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          line-height: 1.45;
          text-transform: uppercase;
        }

        .mnv2-hero-guide ul {
          display: grid;
          gap: 12px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .mnv2-hero-guide li {
          position: relative;
          margin: 0;
          padding-left: 17px;
          color: rgba(247, 251, 248, 0.84);
          font-size: 0.9rem;
          font-weight: 300;
          line-height: 1.65;
        }

        .mnv2-hero-guide li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.72em;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: var(--mnv2-mint);
          box-shadow: 0 0 16px rgba(var(--mnv2-mint-rgb), 0.66);
        }

        .mnv2-hero-duration {
          display: grid;
          gap: 7px;
          padding-top: 17px;
          border-top: 1px solid rgba(var(--mnv2-mint-rgb), 0.16);
        }

        .mnv2-hero-duration strong,
        .mnv2-hero-duration span {
          display: block;
          margin: 0;
          font-size: 0.74rem;
          letter-spacing: 0.14em;
          line-height: 1.5;
          text-transform: uppercase;
        }

        .mnv2-hero-duration strong {
          color: var(--mnv2-text);
          font-weight: 600;
        }

        .mnv2-hero-duration span {
          color: var(--mnv2-mint);
          font-weight: 500;
        }

        .mnv2-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }

        .mnv2-primary,
        .mnv2-secondary,
        .mnv2-audio-button,
        .mnv2-chip-grid button,
        .mnv2-nav a {
          min-height: 46px;
          border: 1px solid var(--mnv2-line);
          border-radius: 999px;
          font: inherit;
          text-decoration: none;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .mnv2-primary,
        .mnv2-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .mnv2-primary { background: var(--mnv2-mint); color: #041311; border-color: var(--mnv2-mint); }
        .mnv2-secondary { background: rgba(255,255,255,0.06); color: var(--mnv2-text); }
        .mnv2-primary:hover, .mnv2-secondary:hover, .mnv2-audio-button:hover, .mnv2-chip-grid button:hover { transform: translateY(-1px); border-color: var(--mnv2-line-strong); }

        .mnv2-teaser-card {
          display: grid;
          gap: 14px;
        }

        .mnv2-teaser-section {
          grid-template-columns: 1fr;
          padding-top: clamp(34px, 5vw, 72px);
        }

        .mnv2-teaser-section .mnv2-main {
          grid-column: 1 / -1;
        }

        .mnv2-teaser-card {
          grid-template-columns: 1fr;
          justify-items: stretch;
          gap: clamp(18px, 3vw, 28px);
          align-items: center;
        }

        .mnv2-teaser-card > :not(.mnv2-video) {
          grid-column: 1;
        }

        .mnv2-teaser-card > .mnv2-video {
          grid-column: 1;
          grid-row: auto;
          width: min(980px, 100%);
          justify-self: center;
        }

        .mnv2-teaser-card .mnv2-eyebrow {
          color: var(--mnv2-mint);
          justify-self: start;
          font-size: 0.92rem;
        }

        .mnv2-video {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          border: 1px solid var(--mnv2-line);
          border-radius: 14px;
          background: var(--mnv2-mint);
          box-shadow: inset 0 0 0 1px rgba(4, 19, 17, 0.12);
        }

        .mnv2-video video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.24s ease;
        }

        .mnv2-video.is-started video {
          opacity: 1;
        }

        .mnv2-teaser-play {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
        }

        .mnv2-teaser-play::before {
          content: "";
          width: clamp(70px, 8vw, 112px);
          height: clamp(70px, 8vw, 112px);
          border: 1px solid rgba(4, 19, 17, 0.28);
          border-radius: 999px;
          background: rgba(4, 19, 17, 0.2);
          box-shadow: 0 0 46px rgba(var(--mnv2-mint-rgb), 0.5), inset 0 0 28px rgba(255,255,255,0.2);
          backdrop-filter: blur(6px);
        }

        .mnv2-teaser-play::after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          margin-left: 8px;
          border-top: 16px solid transparent;
          border-bottom: 16px solid transparent;
          border-left: 24px solid #041311;
        }

        .mnv2-video.is-started .mnv2-teaser-play {
          opacity: 0;
          pointer-events: none;
        }

        .mnv2-nav-wrap {
          position: sticky;
          top: 0;
          z-index: 20;
          border-block: 1px solid rgba(var(--mnv2-mint-rgb), 0.16);
          background: rgba(2, 4, 4, 0.88);
          backdrop-filter: blur(16px);
        }

        .mnv2-nav {
          width: min(1440px, 100%);
          margin: 0 auto;
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 12px clamp(14px, 3vw, 36px);
          scrollbar-width: none;
        }

        .mnv2-nav a {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 0 14px;
          color: var(--mnv2-muted);
          background: rgba(255,255,255,0.028);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .mnv2-nav a.is-active {
          color: #041311;
          background: var(--mnv2-mint);
          border-color: var(--mnv2-mint);
        }

        .mnv2-layout {
          width: min(1880px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(18px, 2vw, 30px);
          padding: clamp(28px, 5vw, 72px) clamp(14px, 3vw, 36px);
        }

        .mnv2-rail {
          position: sticky;
          top: 26px;
          align-self: start;
          min-height: calc(100vh - 52px);
          display: grid;
          align-content: start;
          gap: 34px;
          padding: 28px 20px;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.18);
          border-radius: 16px;
          background: rgba(4, 7, 7, 0.62);
          backdrop-filter: blur(16px);
        }

        .mnv2-rail-logo {
          color: #ffffff;
          font-family: var(--mnv2-display);
          font-size: 1.26rem;
          line-height: 0.86;
          text-transform: uppercase;
          text-decoration: none;
        }

        .mnv2-rail-block p,
        .mnv2-rail-nav span,
        .mnv2-rail-progress span {
          margin: 0;
          color: var(--mnv2-mint);
          font-size: 0.66rem;
          font-weight: 600;
          letter-spacing: 0.13em;
          line-height: 1.6;
          text-transform: uppercase;
        }

        .mnv2-rail-nav {
          display: grid;
          gap: 12px;
        }

        .mnv2-rail-nav a {
          position: relative;
          padding-left: 14px;
          color: var(--mnv2-soft);
          font-size: 0.8rem;
          line-height: 1.4;
          text-decoration: none;
        }

        .mnv2-rail-nav a::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: rgba(var(--mnv2-mint-rgb), 0.38);
        }

        .mnv2-rail-nav a.is-active {
          color: var(--mnv2-text);
          font-weight: 600;
        }

        .mnv2-rail-nav a.is-active::before {
          background: var(--mnv2-mint);
          box-shadow: 0 0 12px rgba(var(--mnv2-mint-rgb), 0.75);
        }

        .mnv2-rail-progress {
          display: grid;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid rgba(var(--mnv2-mint-rgb), 0.14);
        }

        .mnv2-rail-progress strong {
          color: var(--mnv2-muted);
          font-size: 0.82rem;
          font-weight: 400;
        }

        .mnv2-rail-progress div {
          display: flex;
          gap: 8px;
        }

        .mnv2-rail-progress i {
          width: 12px;
          height: 12px;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.38);
          border-radius: 999px;
        }

        .mnv2-rail-progress i.is-active {
          background: var(--mnv2-mint);
          box-shadow: 0 0 12px rgba(var(--mnv2-mint-rgb), 0.54);
        }

        .mnv2-main {
          display: grid;
          gap: clamp(18px, 2.8vw, 34px);
          min-width: 0;
        }

        .mnv2-side {
          position: sticky;
          top: 92px;
          align-self: start;
          display: none;
        }

        .mnv2-barometer {
          display: grid;
          gap: 14px;
          padding: 18px;
          border: 1px solid var(--mnv2-line);
          border-radius: 16px;
          background: rgba(4, 8, 8, 0.78);
          box-shadow: var(--mnv2-shadow);
          backdrop-filter: blur(16px);
        }

        .mnv2-radar {
          position: relative;
          width: min(86px, 100%);
          aspect-ratio: 1;
          justify-self: center;
          overflow: hidden;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.54);
          border-radius: 999px;
          background: conic-gradient(from -90deg, var(--mnv2-mint) 0 var(--signal-progress), rgba(var(--mnv2-mint-rgb), 0.14) var(--signal-progress) 100%);
          box-shadow: none;
          opacity: 0.82;
          transition: opacity 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
        }

        .mnv2-radar.is-soft { opacity: 0.9; border-color: rgba(var(--mnv2-mint-rgb), 0.68); box-shadow: 0 0 16px rgba(var(--mnv2-mint-rgb), 0.14); }
        .mnv2-radar.is-medium { opacity: 0.96; border-color: rgba(var(--mnv2-mint-rgb), 0.78); box-shadow: 0 0 20px rgba(var(--mnv2-mint-rgb), 0.2); }
        .mnv2-radar.is-strong { opacity: 1; border-color: var(--mnv2-mint); box-shadow: 0 0 26px rgba(var(--mnv2-mint-rgb), 0.28); }

        .mnv2-radar::before,
        .mnv2-radar::after {
          content: "";
          position: absolute;
          border-radius: inherit;
        }

        .mnv2-radar::before {
          inset: 8px;
          background: #050707;
          box-shadow: inset 0 0 0 1px rgba(var(--mnv2-mint-rgb), 0.18);
        }

        .mnv2-radar::after {
          inset: 33px;
          background: var(--mnv2-mint);
          box-shadow: 0 0 18px rgba(var(--mnv2-mint-rgb), 0.5), 0 0 38px rgba(var(--mnv2-mint-rgb), 0.2);
        }

        .mnv2-radar span {
          display: none;
        }

        .mnv2-radar strong {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--mnv2-mint);
          box-shadow: 0 0 18px rgba(var(--mnv2-mint-rgb), 0.72), 0 0 42px rgba(var(--mnv2-mint-rgb), 0.24);
          transform: translate(-50%, -50%);
        }

        .mnv2-signal-list {
          display: grid;
          gap: 9px;
        }

        .mnv2-signal {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 66px;
          gap: 10px;
          align-items: center;
          color: var(--mnv2-text);
          font-size: 0.78rem;
        }

        .mnv2-signal span {
          grid-column: 2;
          grid-row: 1;
          width: 66px;
          height: 8px;
          border-radius: 999px;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.38);
          background: linear-gradient(90deg, var(--mnv2-mint) 0 var(--signal-value), rgba(var(--mnv2-mint-rgb), 0.13) var(--signal-value) 100%);
          opacity: 1;
          transition: background 0.28s ease, opacity 0.28s ease, box-shadow 0.28s ease;
        }

        .mnv2-signal strong { grid-column: 1; grid-row: 1; min-width: 0; overflow-wrap: anywhere; font-weight: 600; color: inherit; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.68rem; }
        .mnv2-signal em { display: none; }
        .mnv2-signal.is-active {
          color: var(--mnv2-mint);
          text-shadow: 0 0 10px rgba(var(--mnv2-mint-rgb), 0.62), 0 0 26px rgba(var(--mnv2-mint-rgb), 0.24);
        }
        .mnv2-signal.is-active span {
          border-color: rgba(var(--mnv2-mint-rgb), 0.88);
          box-shadow: 0 0 12px rgba(var(--mnv2-mint-rgb), 0.46), 0 0 26px rgba(var(--mnv2-mint-rgb), 0.16);
        }

        .mnv2-mobile-barometer { display: none; }

        .mnv2-chapter {
          display: grid;
          grid-template-columns: minmax(230px, 0.56fr) 70px minmax(390px, 0.98fr) minmax(390px, 1fr) minmax(270px, 0.68fr);
          grid-template-rows: auto auto;
          gap: 0;
          align-items: start;
          scroll-margin-top: 92px;
          overflow: hidden;
          border: 1px solid var(--mnv2-line);
          border-radius: 16px;
          background:
            linear-gradient(135deg, rgba(var(--mnv2-mint-rgb), 0.045), transparent 42%),
            rgba(6, 10, 10, 0.78);
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
          transition: border-color 0.24s ease, transform 0.24s ease, box-shadow 0.24s ease;
        }

        .mnv2-chapter > .mnv2-rail {
          grid-column: 1;
          grid-row: 1 / 3;
          position: relative;
          top: auto;
          align-self: stretch;
          min-height: 100%;
          margin: 16px 0 16px 16px;
          border-radius: 14px;
          box-shadow: none;
        }

        .mnv2-chapter-index {
          grid-column: 2;
          grid-row: 1 / 3;
          display: grid;
          justify-items: center;
          align-content: start;
          gap: 12px;
          padding: 30px 12px;
          align-self: stretch;
          border-right: 1px solid rgba(255,255,255,0.11);
          background: rgba(0,0,0,0.18);
        }

        .mnv2-chapter-index strong {
          color: var(--mnv2-text);
          font-size: 1.2rem;
          font-weight: 600;
        }

        .mnv2-chapter-index span {
          color: var(--mnv2-soft);
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          writing-mode: vertical-rl;
        }

        .mnv2-chapter-index i {
          width: 18px;
          height: 18px;
          margin-top: 8px;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.48);
          border-radius: 999px;
          box-shadow: inset 0 0 0 5px rgba(var(--mnv2-mint-rgb), 0.08);
        }

        .mnv2-chapter-index i.is-complete {
          background: var(--mnv2-mint);
          box-shadow: 0 0 18px rgba(var(--mnv2-mint-rgb), 0.5);
        }

        .mnv2-chapter.is-active {
          border-color: rgba(var(--mnv2-mint-rgb), 0.42);
          box-shadow: 0 0 0 1px rgba(var(--mnv2-mint-rgb), 0.08), 0 24px 80px rgba(0, 0, 0, 0.34);
        }

        .mnv2-chapter-media {
          grid-column: 3;
          grid-row: 1;
          position: relative;
          align-self: start;
          height: auto;
          min-height: 0;
          overflow: hidden;
          padding: 22px;
          border: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.11);
          background: transparent;
        }

        .mnv2-chapter-media > img,
        .mnv2-media-stack img {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 10.5;
          object-fit: cover;
          object-position: center center;
          border-radius: 12px;
          filter: saturate(0.9) contrast(1.02) brightness(0.96);
        }

        .mnv2-chapter-media.is-duo,
        .mnv2-chapter-media.is-trio {
          display: grid;
          gap: clamp(14px, 1.2vw, 20px);
        }

        .mnv2-chapter-media.is-duo {
          grid-template-rows: repeat(2, minmax(0, 1fr));
        }

        .mnv2-chapter-media.is-trio {
          grid-template-rows: repeat(3, minmax(0, 1fr));
        }

        .mnv2-chapter-media.is-duo > img,
        .mnv2-chapter-media.is-trio > img {
          aspect-ratio: 16 / 10.5;
          min-height: 0;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.16);
        }

        .mnv2-chapter-media::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 58%, rgba(0,0,0,0.26));
        }

        .mnv2-media-stack {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .mnv2-media-stack img {
          aspect-ratio: 4 / 3;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .mnv2-chapter-copy {
          grid-column: 4;
          grid-row: 1;
          display: grid;
          align-content: start;
          gap: 18px;
          padding: clamp(34px, 3vw, 52px) clamp(34px, 3vw, 54px);
          border: 0;
          background: transparent;
        }

        .mnv2-chapter-controls {
          grid-column: 3 / 6;
          grid-row: 2;
          display: grid;
          grid-template-columns: minmax(320px, 0.95fr) minmax(430px, 1.2fr) minmax(320px, 0.85fr);
          align-items: stretch;
          gap: 14px;
          margin: 22px clamp(22px, 3vw, 40px) clamp(22px, 3vw, 40px);
          border: 0;
          border-radius: 0;
          background: transparent;
        }

        .mnv2-chapter-controls > * {
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.14);
          border-radius: 14px;
          background: rgba(255,255,255,0.018);
          min-width: 0;
        }

        .mnv2-chapter-controls > * + * {
          border-left: 1px solid rgba(var(--mnv2-mint-rgb), 0.14);
        }

        .mnv2-chapter-controls .mnv2-bonus summary {
          min-height: 100%;
          display: grid;
          align-content: center;
          justify-content: stretch;
          gap: 20px;
          padding: 30px 34px;
          text-align: left;
        }

        .mnv2-chapter-controls .mnv2-bonus summary span {
          color: var(--mnv2-rose);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mnv2-chapter-controls .mnv2-bonus summary p {
          margin: 0;
          color: var(--mnv2-muted);
          font-size: 0.9rem;
          line-height: 1.55;
          font-weight: 300;
        }

        .mnv2-chapter-controls .mnv2-bonus summary em {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(var(--mnv2-mint-rgb), 0.18);
          color: var(--mnv2-text);
          font-size: 0.78rem;
          font-style: normal;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mnv2-chapter-controls .mnv2-bonus summary em::after {
          content: "›";
          display: inline-flex;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(240,189,206,0.38);
          border-radius: 999px;
          color: var(--mnv2-mint);
        }

        .mnv2-chapter-controls .mnv2-bonus[open] {
          grid-column: 1 / -1;
          display: grid;
          gap: 14px;
          overflow: visible;
        }

        .mnv2-chapter-controls .mnv2-bonus[open] summary {
          min-height: auto;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.14);
          border-radius: 14px;
          background: rgba(255,255,255,0.018);
        }

        .mnv2-chapter-controls .mnv2-bonus[open] .mnv2-bonus-panel {
          width: 100%;
          min-width: 0;
          margin-top: 0;
          overflow: hidden;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.18);
          border-radius: 14px;
          background: rgba(4, 8, 8, 0.9);
        }

        .mnv2-chapter > .mnv2-barometer {
          grid-column: 5;
          grid-row: 1;
          align-self: start;
          margin: clamp(18px, 2vw, 32px);
          box-shadow: none;
        }

        .mnv2-chapter-copy h2,
        .mnv2-final h2 {
          margin: 0;
          font-family: var(--mnv2-display);
          font-size: clamp(1.28rem, 1.55vw, 2.15rem);
          line-height: 1.08;
          font-weight: 400;
          letter-spacing: 0;
        }

        .mnv2-copy-stack {
          display: grid;
          gap: 11px;
        }

        .mnv2-copy-stack p,
        .mnv2-bonus-panel p,
        .mnv2-final p {
          margin: 0;
          color: var(--mnv2-muted);
          font-size: 0.94rem;
          line-height: 1.66;
          font-weight: 300;
        }

        .mnv2-audio {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          grid-template-rows: auto auto auto;
          gap: 18px;
          align-content: center;
          padding: 30px 34px;
        }

        .mnv2-audio-button {
          grid-column: 1;
          grid-row: 2;
          width: 54px;
          min-height: 54px;
          display: inline-grid;
          place-items: center;
          padding: 0;
          color: var(--mnv2-text);
          background: rgba(0,0,0,0.14);
        }

        .mnv2-audio-button .mnv2-play-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: rgba(var(--mnv2-mint-rgb), 0.12);
          color: var(--mnv2-mint);
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.28);
        }

        .mnv2-audio-button .mnv2-play-icon::before {
          content: "";
          width: 0;
          height: 0;
          margin-left: 3px;
          border-top: 7px solid transparent;
          border-bottom: 7px solid transparent;
          border-left: 10px solid var(--mnv2-mint);
        }

        .mnv2-audio-button.is-playing .mnv2-play-icon::before {
          width: 10px;
          height: 14px;
          margin-left: 0;
          border: 0;
          border-left: 3px solid var(--mnv2-mint);
          border-right: 3px solid var(--mnv2-mint);
        }

        .mnv2-audio-button.is-playing { border-color: var(--mnv2-mint); background: rgba(var(--mnv2-mint-rgb), 0.1); }
        .mnv2-audio-progress { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; }
        .mnv2-audio .mnv2-eyebrow {
          grid-column: 1 / -1;
          color: var(--mnv2-rose);
        }
        .mnv2-audio-meta {
          grid-column: 1 / -1;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          min-width: 0;
          margin-top: -8px;
        }
        .mnv2-audio-meta strong,
        .mnv2-audio-meta span {
          color: var(--mnv2-text);
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          line-height: 1.35;
          text-transform: uppercase;
        }
        .mnv2-audio-meta strong {
          min-width: 0;
          color: var(--mnv2-mint);
          overflow-wrap: anywhere;
          text-shadow: 0 0 14px rgba(var(--mnv2-mint-rgb), 0.16);
        }
        .mnv2-audio-meta span {
          flex: 0 0 auto;
          color: var(--mnv2-text);
          opacity: 0.78;
        }
        .mnv2-waveform {
          grid-column: 2;
          grid-row: 2;
          align-self: center;
          min-width: 0;
          height: 54px;
          display: flex;
          align-items: center;
          gap: 5px;
          opacity: 1;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
        }
        .mnv2-waveform i {
          flex: 1 0 3px;
          max-width: 5px;
          height: var(--wave-height);
          border-radius: 999px;
          background: var(--mnv2-mint);
          box-shadow: 0 0 12px rgba(var(--mnv2-mint-rgb), 0.22);
          transform-origin: center;
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
        .mnv2-audio.is-playing .mnv2-waveform i {
          animation: mnv2-wave-pulse 0.86s ease-in-out infinite;
          animation-delay: calc(var(--wave-index) * -42ms);
          box-shadow: 0 0 14px rgba(var(--mnv2-mint-rgb), 0.34);
        }
        @keyframes mnv2-wave-pulse {
          0%, 100% { transform: scaleY(0.58); opacity: 0.58; }
          45% { transform: scaleY(1.14); opacity: 1; }
          68% { transform: scaleY(0.78); opacity: 0.78; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mnv2-audio.is-playing .mnv2-waveform i {
            animation: none;
          }
        }
        .mnv2-audio-progress {
          grid-column: 1 / -1;
          grid-row: 3;
        }
        .mnv2-audio-progress span { color: var(--mnv2-soft); font-size: 0.72rem; }
        .mnv2-audio-progress input {
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 999px;
          accent-color: var(--mnv2-mint);
          background: linear-gradient(90deg, var(--mnv2-mint) var(--audio-progress), rgba(var(--mnv2-mint-rgb), 0.22) var(--audio-progress));
          outline: none;
        }
        .mnv2-audio-progress input::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 999px;
          background: transparent;
        }
        .mnv2-audio-progress input::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          margin-top: -7px;
          border: 0;
          border-radius: 999px;
          background: var(--mnv2-mint);
          box-shadow: 0 0 16px rgba(var(--mnv2-mint-rgb), 0.58);
        }
        .mnv2-audio-progress input::-moz-range-track {
          height: 4px;
          border-radius: 999px;
          background: rgba(var(--mnv2-mint-rgb), 0.22);
        }
        .mnv2-audio-progress input::-moz-range-progress {
          height: 4px;
          border-radius: 999px;
          background: var(--mnv2-mint);
        }
        .mnv2-audio-progress input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border: 0;
          border-radius: 999px;
          background: var(--mnv2-mint);
          box-shadow: 0 0 16px rgba(var(--mnv2-mint-rgb), 0.58);
        }

        .mnv2-micro {
          display: grid;
          gap: 13px;
          padding: 16px;
          background: rgba(240,189,206,0.032);
        }

        .mnv2-micro h3 {
          margin: 0;
          font-family: var(--mnv2-sans);
          font-size: 1.1rem;
          line-height: 1.35;
          font-weight: 500;
        }

        .mnv2-chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .mnv2-chip-grid button {
          min-width: 0;
          min-height: 34px;
          padding: 0 16px;
          color: var(--mnv2-text);
          background: rgba(255,255,255,0.035);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .mnv2-chip-grid button.is-selected {
          color: #041311;
          background: var(--mnv2-mint);
          border-color: var(--mnv2-mint);
          box-shadow: 0 0 18px rgba(var(--mnv2-mint-rgb), 0.34);
        }

        .mnv2-feedback {
          margin: 0;
          color: var(--mnv2-rose);
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .mnv2-bonus {
          overflow: hidden;
        }

        .mnv2-bonus summary {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 16px;
          color: var(--mnv2-text);
          list-style: none;
          cursor: pointer;
        }

        .mnv2-bonus summary::-webkit-details-marker { display: none; }
        .mnv2-bonus summary span { font-weight: 500; }
        .mnv2-bonus summary em { color: var(--mnv2-mint); font-size: 0.72rem; font-style: normal; letter-spacing: 0.12em; text-transform: uppercase; }
        .mnv2-bonus[open] summary { border-bottom: 1px solid var(--mnv2-line); }
        .mnv2-bonus-panel {
          display: none;
          gap: clamp(20px, 2.2vw, 34px);
          padding: clamp(28px, 3vw, 46px);
        }

        .mnv2-bonus[open] .mnv2-bonus-panel {
          display: grid;
        }
        .mnv2-bonus.is-archive .mnv2-bonus-panel { background: linear-gradient(135deg, rgba(229,207,148,0.08), rgba(255,255,255,0.02)); }
        .mnv2-close-copy { color: var(--mnv2-soft); font-size: 0.76rem; }

        .mnv2-bonus-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr));
          gap: clamp(18px, 1.8vw, 28px);
        }

        .mnv2-bonus-grid article {
          display: grid;
          align-content: start;
          gap: clamp(18px, 1.6vw, 28px);
          min-width: 0;
          padding: clamp(26px, 2.6vw, 42px);
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.16);
          border-radius: 14px;
          background:
            linear-gradient(145deg, rgba(var(--mnv2-mint-rgb), 0.045), transparent 48%),
            rgba(255,255,255,0.018);
        }

        .mnv2-bonus-grid article:last-child {
          padding-bottom: clamp(26px, 2.6vw, 42px);
        }

        .mnv2-bonus-grid article > i {
          display: block;
          width: 34px;
          height: 1px;
          background: var(--mnv2-mint);
          opacity: 0.95;
        }

        .mnv2-bonus-card-head {
          display: grid;
          justify-items: start;
          gap: 10px;
        }

        .mnv2-bonus-grid h4 {
          margin: 0;
          color: var(--mnv2-text);
          font-family: var(--mnv2-display);
          font-size: clamp(1.65rem, 2vw, 2.85rem);
          line-height: 0.98;
          font-weight: 400;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .mnv2-bonus-meta,
        .mnv2-bonus-tag {
          display: inline-flex;
          width: fit-content;
          color: var(--mnv2-mint);
          font-size: clamp(0.66rem, 0.78vw, 0.78rem);
          font-weight: 300;
          letter-spacing: 0.18em;
          line-height: 1.25;
          text-transform: uppercase;
        }

        .mnv2-bonus-meta {
          font-style: italic;
        }

        .mnv2-bonus-tag {
          padding: 5px 12px;
          border: 1px solid rgba(var(--mnv2-mint-rgb), 0.7);
        }

        .mnv2-bonus-card-copy {
          display: grid;
          gap: 18px;
        }

        .mnv2-bonus-grid p {
          margin: 0;
          color: var(--mnv2-muted);
          font-size: clamp(0.78rem, 0.82vw, 0.9rem);
          font-weight: 300;
          line-height: 1.95;
        }

        .mnv2-bonus-panel > p {
          width: min(100%, 96ch);
          margin: 0;
          color: var(--mnv2-muted);
          font-size: clamp(0.78rem, 0.82vw, 0.9rem);
          font-weight: 300;
          line-height: 1.95;
        }

        .mnv2-final,
        .mnv2-closed {
          display: grid;
          gap: 20px;
          padding: clamp(22px, 4vw, 44px);
          border: 1px solid var(--mnv2-line-strong);
          border-radius: 16px;
          background: var(--mnv2-panel);
          box-shadow: var(--mnv2-shadow);
        }

        .mnv2-final-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 0.72fr);
          gap: 24px;
          align-items: start;
        }

        .mnv2-final-grid.is-signal-only {
          grid-template-columns: minmax(260px, 420px) minmax(220px, max-content);
          align-items: center;
          justify-content: space-between;
        }

        .mnv2-final-cta {
          display: flex;
          justify-content: flex-end;
        }

        .mnv2-footer {
          padding: 28px clamp(20px, 4vw, 52px);
          border-top: 1px solid rgba(255,255,255,0.05);
          text-align: center;
          font-family: "Poppins", var(--mnv2-body), sans-serif;
          font-weight: 100;
        }

        .mnv2-footer-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .mnv2-footer-nav > span {
          display: inline-flex;
          align-items: center;
          gap: 14px;
        }

        .mnv2-footer-nav a {
          color: var(--mnv2-mint);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }

        .mnv2-footer-nav a:hover,
        .mnv2-footer-nav a:focus-visible {
          color: var(--mnv2-mint);
          text-shadow: 0 0 14px rgba(var(--mnv2-mint-rgb), 0.34);
        }

        .mnv2-footer-sep {
          color: var(--mnv2-mint);
          font-size: 10px;
          opacity: 0.42;
        }

        .mnv2-footer-copy {
          margin: 0;
          color: var(--mnv2-mint);
          font-size: 10px;
          letter-spacing: 0.1em;
          opacity: 0.58;
        }

        .mnv2-closed {
          width: min(720px, calc(100% - 28px));
          margin: 12vh auto;
        }

        @media (max-width: 1500px) {
          .mnv2-chapter {
            grid-template-columns: minmax(210px, 0.52fr) 64px minmax(320px, 0.95fr) minmax(340px, 1fr) minmax(230px, 0.62fr);
          }

          .mnv2-chapter-controls {
            grid-template-columns: minmax(220px, 0.92fr) minmax(280px, 1.18fr) minmax(210px, 0.82fr);
          }
        }

        @media (max-width: 1125px) {
          .mnv2-hero-inner,
          .mnv2-layout,
          .mnv2-final-grid {
            grid-template-columns: 1fr;
          }

          .mnv2-hero-guide {
            justify-self: start;
            width: min(620px, 100%);
          }

          .mnv2-hero-project {
            width: min(720px, 100%);
          }

          .mnv2-layout {
            width: min(1060px, 100%);
            padding-inline: clamp(12px, 2.4vw, 24px);
          }

          .mnv2-chapter {
            grid-template-columns: minmax(180px, 0.54fr) 54px minmax(250px, 0.9fr) minmax(300px, 1fr) minmax(190px, 0.62fr);
          }

          .mnv2-chapter > .mnv2-rail {
            margin: 14px 0 14px 14px;
            padding: 22px 16px;
            gap: 24px;
          }

          .mnv2-chapter > .mnv2-rail .mnv2-rail-logo {
            font-size: 1.08rem;
          }

          .mnv2-chapter > .mnv2-rail .mnv2-rail-nav a {
            font-size: 0.74rem;
          }

          .mnv2-chapter-media {
            padding: 18px;
          }

          .mnv2-chapter-media.is-duo,
          .mnv2-chapter-media.is-trio {
            gap: 12px;
          }

          .mnv2-media-stack {
            gap: 12px;
            margin-top: 12px;
          }

          .mnv2-chapter-copy {
            padding: 26px;
          }

          .mnv2-chapter-copy h2,
          .mnv2-final h2 {
            font-size: clamp(1.16rem, 2vw, 1.72rem);
          }

          .mnv2-chapter > .mnv2-barometer {
            margin: 18px;
            padding: 16px;
          }

          .mnv2-chapter-controls {
            grid-template-columns: minmax(250px, 0.9fr) minmax(330px, 1.12fr) minmax(230px, 0.78fr);
            margin: 18px;
          }

          .mnv2-audio,
          .mnv2-chapter-controls .mnv2-bonus summary {
            padding: 24px;
          }

          .mnv2-side,
          .mnv2-mobile-barometer {
            display: none;
          }
        }

        @media (max-width: 850px) {
          .mnv2-chapter {
            grid-template-columns: 1fr;
          }

          .mnv2-mobile-barometer { display: block; }

          .mnv2-chapter > .mnv2-rail {
            grid-column: 1;
            grid-row: auto;
            min-height: auto;
            margin: 14px;
            display: grid;
          }

          .mnv2-chapter > .mnv2-rail .mnv2-rail-block,
          .mnv2-chapter > .mnv2-rail .mnv2-rail-nav a:not(.is-active) {
            display: none;
          }

          .mnv2-chapter > .mnv2-rail .mnv2-rail-nav {
            gap: 8px;
          }

          .mnv2-chapter > .mnv2-rail .mnv2-rail-progress {
            padding-top: 14px;
          }

          .mnv2-chapter-media {
            grid-column: 1;
            grid-row: auto;
            position: relative;
            top: auto;
            height: auto;
            min-height: auto;
            aspect-ratio: 16 / 10;
            border-right: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.11);
          }

          .mnv2-chapter-media.is-duo,
          .mnv2-chapter-media.is-trio {
            aspect-ratio: auto;
          }

          .mnv2-chapter-copy,
          .mnv2-chapter-controls,
          .mnv2-chapter-index,
          .mnv2-chapter > .mnv2-barometer {
            grid-column: 1;
            grid-row: auto;
          }

          .mnv2-chapter > .mnv2-barometer {
            margin: 16px;
          }

          .mnv2-chapter-controls {
            grid-template-columns: 1fr;
            margin: 16px;
          }

          .mnv2-chapter-controls .mnv2-bonus[open] {
            display: block;
          }

          .mnv2-chapter-controls .mnv2-bonus[open] summary,
          .mnv2-chapter-controls .mnv2-bonus[open] .mnv2-bonus-panel {
            grid-column: auto;
            grid-row: auto;
          }

          .mnv2-chapter-controls .mnv2-bonus[open] summary {
            min-height: auto;
          }

          .mnv2-chapter-controls .mnv2-bonus[open] .mnv2-bonus-panel {
            margin-top: 0;
            border-top: 0;
            border-radius: 0 0 14px 14px;
          }

          .mnv2-chapter-controls > * + * {
            border-left: 0;
            border-top: 1px solid rgba(var(--mnv2-mint-rgb), 0.14);
          }

          .mnv2-chapter-index {
            grid-template-columns: auto auto minmax(0, 1fr);
            justify-items: start;
            align-items: center;
            padding: 14px 16px;
            border-right: 0;
            border-bottom: 1px solid rgba(255,255,255,0.11);
          }
          .mnv2-chapter-index span {
            writing-mode: initial;
          }
          .mnv2-chapter-index i {
            justify-self: end;
            margin-top: 0;
          }
          .mnv2-hero { min-height: auto; padding-top: 96px; }
        }

        @media (max-width: 768px) {
          .mnv2-hero {
            padding: 86px 14px 24px;
          }

          .mnv2-hero-inner,
          .mnv2-hero-inner > *,
          .mnv2-lead {
            min-width: 0;
            max-width: 100%;
          }

          .mnv2-hero-main-title {
            font-size: clamp(2.86rem, 14.2vw, 4.5rem);
            line-height: 0.9;
          }

          .mnv2-hero .mnv2-hero-project-title {
            font-size: clamp(2.5rem, 12vw, 4.5rem);
          }

          .mnv2-hero-project {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .mnv2-hero-project-copy {
            padding: 2px 2px 4px;
          }

          .mnv2-chapter-copy,
          .mnv2-final,
          .mnv2-barometer {
            padding: 16px;
          }

          .mnv2-actions { flex-direction: column; }
          .mnv2-primary, .mnv2-secondary { width: 100%; }
          .mnv2-nav-wrap { top: 0; }
          .mnv2-nav { padding: 10px 12px; }
          .mnv2-nav a { min-height: 40px; font-size: 0.68rem; }
          .mnv2-layout { padding: 22px 12px 46px; }
          .mnv2-main { gap: 34px; }
          .mnv2-audio-meta {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
          }
          .mnv2-footer {
            padding: 28px 20px;
          }
          .mnv2-footer-nav {
            gap: 8px;
            justify-content: center;
          }
          .mnv2-footer-nav > span {
            gap: 8px;
          }
          .mnv2-teaser-card {
            grid-template-columns: 1fr;
          }
          .mnv2-teaser-card > :not(.mnv2-video),
          .mnv2-teaser-card > .mnv2-video {
            grid-column: 1;
            grid-row: auto;
          }
          .mnv2-bonus-grid {
            grid-template-columns: 1fr;
          }
          .mnv2-bonus-panel {
            padding: 22px;
          }
          .mnv2-bonus-grid article {
            padding: 22px;
          }
          .mnv2-bonus-grid h4 {
            font-size: clamp(1.28rem, 8.8vw, 2rem);
            line-height: 1;
          }
          .mnv2-bonus-grid p,
          .mnv2-bonus-panel > p {
            font-size: 0.86rem;
            line-height: 1.9;
          }
          .mnv2-signal {
            grid-template-columns: minmax(0, 1fr) 54px;
          }
        }

        @media (max-width: 430px) {
          .mnv2-hero h1 { font-size: clamp(2rem, 11.6vw, 3.15rem); }
          .mnv2-hero-subtitle { font-size: 0.88rem; }
          .mnv2-lead { font-size: 0.95rem; line-height: 1.68; }
          .mnv2-chip-grid button { width: 100%; justify-content: center; }
          .mnv2-bonus summary { align-items: flex-start; flex-direction: column; padding: 14px; }
        }
      `}</style>

      <section className="mnv2-hero" id="top">
        <div className="mnv2-hero-bg" aria-hidden="true">
          <img alt="" src={images.hero} />
        </div>
        <div className="mnv2-hero-inner">
          <div>
            <article className="mnv2-hero-project" aria-label="Fiche projet Marée Noire">
              <div className="mnv2-hero-project-copy">
                <p className="mnv2-hero-project-kicker">Projet série</p>
                <h1 className="mnv2-hero-project-title">{heroTitle}</h1>
                <p className="mnv2-hero-tagline">{heroTagline}</p>
                <dl className="mnv2-hero-meta">
                  <div>
                    <dt>Genre</dt>
                    <dd>{heroGenre}</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>{heroFormat}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>
          <aside className="mnv2-hero-guide" aria-label="Consignes de l'expérience">
            <h2>{heroGuide.title}</h2>
            <ul>
              {heroGuide.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mnv2-hero-duration">
              <strong>{heroGuide.duration}</strong>
              <span>{heroGuide.secondaryDuration}</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="mnv2-layout mnv2-teaser-section" id="teaser">
        <div className="mnv2-main">
          <article className="mnv2-teaser-card mnv2-final">
            <p className="mnv2-eyebrow">Teaser</p>
            <div className={`mnv2-video ${teaserStarted ? "is-started" : ""}`}>
              <video
                controls
                playsInline
                preload="metadata"
                ref={teaserVideoRef}
                onPlay={() => setTeaserStarted(true)}
              >
                <source media="(max-width: 768px)" src={page?.teaser?.mobileSrc || "/Teaser_MOBILE.mp4"} type="video/mp4" />
                <source src={page?.teaser?.desktopSrc || "/Teaser_site.mp4"} type="video/mp4" />
              </video>
              <button className="mnv2-teaser-play" type="button" onClick={startTeaser} aria-label="Lancer le teaser" />
            </div>
          </article>
        </div>
      </section>

      <div className="mnv2-layout">
        <div className="mnv2-main">
          <div className="mnv2-mobile-barometer">
            <SignalBarometer answeredSignals={answeredSignals} signalValues={signalValues} compact />
          </div>

          {chapters.map((chapter) => (
            <Chapter
              active={activeChapter === chapter.id}
              answer={answers[chapter.id]}
              chapter={chapter}
              chapters={chapters}
              images={images.sets?.[chapter.imageKey] ?? [images[chapter.imageKey]]}
              key={chapter.id}
              onAnswer={answerSignal}
              playingId={playingId}
              setPlayingId={setPlayingId}
              answeredSignals={answeredSignals}
              signalValues={signalValues}
            />
          ))}

          <section className="mnv2-final" id="signal-final" data-chapter-id="final">
            <div className="mnv2-final-grid is-signal-only">
              <SignalBarometer answeredSignals={answeredSignals} signalValues={signalValues} />
              <div className="mnv2-final-cta">
                <Link className="mnv2-primary" href={PANEL_PUBLIC_TEST_PATH}>
                  {page?.immersive?.finalActionLabel || "Lancer le test"}
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div className="mnv2-side">
          <SignalBarometer answeredSignals={answeredSignals} signalValues={signalValues} />
        </div>
      </div>

      <footer className="mnv2-footer">
        <nav className="mnv2-footer-nav" aria-label="Liens légaux">
          {(page?.footerLinks || [
            { href: "/mentions-legales", label: "Mentions légales" },
            { href: "/confidentialite", label: "Confidentialité" },
            { href: "/cgu", label: "CGU" },
            { href: "/cookies", label: "Cookies" },
          ]).map((link, index, links) => (
            <span key={link.href}>
              <Link href={link.href}>{link.label}</Link>
              {index < links.length - 1 ? <span className="mnv2-footer-sep" aria-hidden="true">|</span> : null}
            </span>
          ))}
        </nav>
        <p className="mnv2-footer-copy">© Give Me The Pitch</p>
      </footer>
    </main>
  );
}
