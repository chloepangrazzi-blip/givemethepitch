"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function isVisible(question, answers) {
  if (!question.visibleWhen) {
    return true;
  }
  return answers[question.visibleWhen.name] === question.visibleWhen.value;
}

function isEmptyAnswer(value) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return !value || !String(value).trim();
}

function getOptionValue(option) {
  return typeof option === "string" ? option : option.value;
}

function getOptionLabel(option) {
  return typeof option === "string" ? option : option.label;
}

function normalizeTrackingValue(value) {
  return String(value || "").trim().toUpperCase();
}

function GmtpLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#080808" height="8" rx="2.4" width="8" x="1" y="1" />
      <rect fill="#080808" height="8" rx="2.4" width="8" x="12" y="1" />
      <rect fill="#080808" height="8" rx="2.4" width="8" x="23" y="1" />
      <rect fill="#080808" height="8" rx="2.4" width="8" x="1" y="12" />
      <rect fill="#080808" height="8" rx="2.4" width="8" x="12" y="12" />
      <rect fill="#080808" height="8" rx="2.4" width="8" x="23" y="12" />
      <rect fill="#080808" height="8" rx="2.4" width="8" x="1" y="23" />
      <rect fill="#080808" height="8" rx="2.4" width="8" x="12" y="23" />
      <rect fill="#080808" height="8" rx="2.4" width="8" x="23" y="23" />
    </svg>
  );
}

function ChipGroup({ name, onChange, options, type, value }) {
  const isCheckbox = type === "checkbox";

  return (
    <div className="room-form-chip-group">
      {options.map((option) => {
        const optionValue = getOptionValue(option);
        const optionLabel = getOptionLabel(option);
        const selected = isCheckbox ? Array.isArray(value) && value.includes(optionValue) : value === optionValue;

        return (
          <label className="room-form-chip" key={optionValue}>
            <input
              checked={selected}
              name={type === "radio" ? name : undefined}
              onChange={() => onChange(optionValue)}
              type={type}
            />
            <span className={`room-form-chip-label room-form-chip-label-${type}`}>{optionLabel}</span>
          </label>
        );
      })}
    </div>
  );
}

function QuestionField({ onChange, question, value }) {
  if (question.type === "radio" || question.type === "checkbox") {
    return <ChipGroup name={question.name} onChange={onChange} options={question.options} type={question.type} value={value} />;
  }

  if (question.type === "textarea") {
    return (
      <textarea
        className="room-form-input room-form-textarea"
        onChange={(event) => onChange(event.target.value)}
        placeholder={question.placeholder}
        rows={4}
        value={value || ""}
      />
    );
  }

  return (
    <input
      className="room-form-input"
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.placeholder}
      type={question.type}
      value={value || ""}
    />
  );
}

export default function TheRoomPageClient(page) {
  const [view, setView] = useState("landing");
  const [answers, setAnswers] = useState({});
  const [consent, setConsent] = useState(false);
  const [requestState, setRequestState] = useState("idle");
  const [message, setMessage] = useState("");
  const [launchCode, setLaunchCode] = useState("");
  const [prefilledAccessCode, setPrefilledAccessCode] = useState("");
  const hasTrackedLaunchClick = useRef(false);
  const hasTrackedFormStart = useRef(false);

  useDesktopCursor({
    hoverSelector: "button, a, input, textarea, label",
    spotlightSelector: ".room-cta, .room-form-chip-label, .room-block, .room-section, .room-form-card",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const inviteFromUrl = normalizeTrackingValue(url.searchParams.get("invite"));
    const codeFromUrl = normalizeTrackingValue(url.searchParams.get("code"));
    const storedLaunchCode = normalizeTrackingValue(window.sessionStorage?.getItem("gmtp_panel_launch_code"));
    const storedAccessCode = normalizeTrackingValue(window.sessionStorage?.getItem("gmtp_access_code_prefill"));
    const resolvedLaunchCode = inviteFromUrl || storedLaunchCode;
    const resolvedAccessCode = codeFromUrl || storedAccessCode;

    if (resolvedLaunchCode) {
      setLaunchCode(resolvedLaunchCode);
      window.sessionStorage?.setItem("gmtp_panel_launch_code", resolvedLaunchCode);
    }

    if (resolvedAccessCode) {
      setPrefilledAccessCode(resolvedAccessCode);
      window.sessionStorage?.setItem("gmtp_access_code_prefill", resolvedAccessCode);
    }

    if (inviteFromUrl && !hasTrackedLaunchClick.current) {
      hasTrackedLaunchClick.current = true;
      void fetch("/api/panel/launch/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          launchCode: inviteFromUrl,
          stage: "clicked",
        }),
      }).catch(() => {});
    }

    if (inviteFromUrl || codeFromUrl) {
      url.searchParams.delete("invite");
      url.searchParams.delete("code");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  useEffect(() => {
    if (view !== "form" || !launchCode || hasTrackedFormStart.current) {
      return;
    }

    hasTrackedFormStart.current = true;

    void fetch("/api/panel/launch/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        launchCode,
        stage: "form_started",
      }),
    }).catch(() => {});
  }, [launchCode, view]);

  const visibleQuestions = useMemo(
    () =>
      page.form.sections.flatMap((section) =>
        section.questions.filter((question) => isVisible(question, answers)).map((question) => ({
          ...question,
          sectionId: section.id,
        }))
      ),
    [answers, page.form.sections]
  );

  const missingRequiredQuestions = useMemo(
    () => visibleQuestions.filter((question) => question.required && isEmptyAnswer(answers[question.name])),
    [answers, visibleQuestions]
  );

  const setAnswer = (question, nextValue) => {
    setAnswers((current) => {
      if (question.type === "checkbox") {
        const currentValues = Array.isArray(current[question.name]) ? current[question.name] : [];
        const updatedValues = currentValues.includes(nextValue)
          ? currentValues.filter((item) => item !== nextValue)
          : [...currentValues, nextValue];

        return {
          ...current,
          [question.name]: updatedValues,
        };
      }

      return {
        ...current,
        [question.name]: nextValue,
      };
    });
  };

  const handleSubmit = async () => {
    if (requestState === "loading") {
      return;
    }

    if (missingRequiredQuestions.length > 0 || !consent) {
      setMessage("Merci de renseigner tous les champs obligatoires et d'accepter le consentement.");
      setRequestState("error");
      return;
    }

    setRequestState("loading");
    setMessage("Préparation de votre accès...");

    const payload = {
      fullName: answers.fullName?.trim() || "",
      email: answers.email?.trim() || "",
      mobile: answers.mobile?.trim() || "",
      city: answers.city?.trim() || "",
      consent,
      launchCode,
      accessCode: prefilledAccessCode,
      answers: {
        age_band: answers.age,
        viewing_frequency: answers.freq,
        streaming_subscription: answers.platforms_yn,
        streaming_platforms: answers.streaming_platforms || [],
        tv_series_watching: answers.tv_yn,
        tv_channels: answers.tv_channels || [],
        replay_series_watching: answers.replay_yn,
        replay_platforms: answers.replay_platforms || [],
        liked_genres: answers.liked_genres || [],
        main_genre: answers.genre_favori,
        origin_preference: answers.origin,
        origin_preference_detail: answers.origin_detail?.trim() || "",
        french_series_perception: answers.fr_quality,
        french_series_reason_primary: answers.fr_raison,
        french_series_reason_detail: answers.fr_raison_detail?.trim() || "",
        recommendation_frequency: answers.prescripteur,
      },
      panelProfile: {
        ageBand: answers.age,
        viewingFrequency: answers.freq,
        platforms: [...(answers.streaming_platforms || []), ...(answers.tv_channels || []), ...(answers.replay_platforms || [])],
        likedGenres: answers.liked_genres || [],
        mainGenre: answers.genre_favori,
        frenchSeriesPerception: answers.fr_quality,
        frenchSeriesReason: answers.fr_raison,
        recommendationFrequency: answers.prescripteur,
      },
    };

    try {
      const response = await fetch("/api/access/request", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.detail || result.error || "request_failed");
      }

      setRequestState("success");

      if (result.invitedFlow) {
        if (typeof window !== "undefined") {
          window.sessionStorage?.removeItem("gmtp_access_code_prefill");
          window.sessionStorage?.removeItem("gmtp_panel_launch_code");
        }

        setMessage(
          result.emailSent
            ? "Vos informations sont enregistrées. Votre clé d'accès vous a été envoyée par mail."
            : "Vos informations sont bien enregistrées. L'envoi de la clé par mail n'est pas encore activé sur cet environnement."
        );
        return;
      }

      setMessage(
        result.emailSent
          ? "Votre clé d'accès est envoyée sur votre mail."
          : "Votre demande est bien enregistrée. L'envoi par mail n'est pas encore activé sur cet environnement."
      );
    } catch (caughtError) {
      const errorMessage = caughtError instanceof Error ? caughtError.message : "request_failed";
      const friendlyErrors = {
        invited_email_mismatch: "Merci d'utiliser l'adresse email qui a reçu cette invitation.",
        invalid_launch_invite: "Ce lien d'invitation n'est plus valide.",
        invalid_invite_access_pair: "Cette invitation ne correspond plus à un accès valide.",
        missing_invite_access_code: "Cette invitation ne peut pas encore générer de clé d'accès.",
      };
      setRequestState("error");
      setMessage(
        friendlyErrors[errorMessage] || `Le formulaire n'a pas pu être enregistré. ${errorMessage}`
      );
    }
  };

  const isAboutView = view === "about";
  const isFormView = view === "form";
  const questionsByName = useMemo(
    () =>
      Object.fromEntries(
        page.form.sections.flatMap((section) => section.questions.map((question) => [question.name, question]))
      ),
    [page.form.sections]
  );
  const getQuestion = (name) => questionsByName[name];
  const renderRequiredMark = (question) => (question?.required ? <span className="room-form-req">*</span> : null);
  const renderChoiceQuestion = (questionName, labelClassName = "room-form-q-label") => {
    const question = getQuestion(questionName);

    if (!question) {
      return null;
    }

    return (
      <>
        <div className={labelClassName}>
          {question.label} {renderRequiredMark(question)}
        </div>
        <QuestionField
          onChange={(nextValue) => setAnswer(question, nextValue)}
          question={question}
          value={answers[question.name]}
        />
      </>
    );
  };
  const renderTextQuestion = (questionName) => {
    const question = getQuestion(questionName);

    if (!question) {
      return null;
    }

    return (
      <div className="room-form-field-wrap">
        <label className="room-form-field-label">
          {question.label} {renderRequiredMark(question)}
        </label>
        <QuestionField
          onChange={(nextValue) => setAnswer(question, nextValue)}
          question={question}
          value={answers[question.name]}
        />
      </div>
    );
  };

  return (
    <>
      <style>{`
        :root {
          --room-bg: #000000;
          --room-card: #070707;
          --room-card-soft: #0d0d0d;
          --room-line: rgba(255, 255, 255, 0.1);
          --room-line-mint: rgba(191, 248, 220, 0.28);
          --room-text: #ffffff;
          --room-muted: #ffffff;
          --room-mint: #c8f5e8;
          --room-rose: #f5c6d8;
          --room-pink: #f5c6d8;
          --room-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", "Segoe UI", sans-serif;
          --room-display: "Made Soulmaze", "Poppins", sans-serif;
          --room-horizon: "Horizon", "Made Soulmaze", sans-serif;
        }

        html,
        body {
          margin: 0;
          background: var(--room-bg);
          color: var(--room-text);
          font-family: var(--room-sans);
          cursor: none;
        }

        * {
          box-sizing: border-box;
        }

        .room-page,
        .room-page * {
          cursor: none !important;
        }

        .cursor {
          position: fixed;
          width: 14px;
          height: 14px;
          background: var(--room-mint);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: width 0.25s ease, height 0.25s ease, background 0.25s ease, opacity 0.2s ease;
          mix-blend-mode: difference;
        }

        .cursor.hovering {
          width: 42px;
          height: 42px;
        }

        .room-page {
          min-height: 100vh;
          padding: 32px 20px 72px;
        }

        .room-page-about {
          padding: 0 0 72px;
        }

        .room-shell {
          width: min(1360px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .room-shell-about {
          width: 100%;
          gap: 0;
        }

        .room-stage {
          border: 1px solid var(--room-line-mint);
          border-radius: 34px;
          background: var(--room-card);
          padding: 28px;
          display: grid;
          gap: 24px;
        }

        .room-stage-landing {
          padding: 0;
          overflow: hidden;
          min-height: calc(100vh - 64px);
          gap: 0;
        }

        .room-stage-about {
          border: none;
          border-radius: 0;
          background: transparent;
          padding: 0;
          gap: 0;
        }

        .room-page-form {
          padding: 0;
          background: var(--room-bg);
        }

        .room-shell-form {
          width: 100%;
          gap: 0;
        }

        .room-stage-form {
          min-height: 100vh;
          border: none;
          border-radius: 0;
          background: var(--room-bg);
          padding: 0;
          gap: 0;
        }

        .room-form-header {
          padding: 80px 6vw 64px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .room-form-header-inner,
        .room-form-body {
          width: min(820px, 100%);
          margin: 0 auto;
        }

        .room-form-title {
          margin: 0;
          font-family: var(--room-display);
          font-weight: 400;
          font-size: clamp(48px, 9vw, 110px);
          line-height: 1;
          color: #ffffff;
          -webkit-text-stroke: 0;
        }

        .room-form-body {
          padding: 64px 6vw 100px;
        }

        .room-form-section-title {
          margin-top: 60px;
          margin-bottom: 28px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(200, 245, 232, 0.22);
          color: var(--room-mint);
          font-family: var(--room-sans);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .room-form-section-title:first-child {
          margin-top: 0;
        }

        .room-form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .room-form-field-wrap {
          display: grid;
          gap: 9px;
        }

        .room-form-field-label,
        .room-form-q-label {
          color: rgba(255, 255, 255, 0.9);
          font-family: var(--room-sans);
          font-size: 15px;
          font-weight: 300;
          line-height: 1.5;
        }

        .room-form-q-label {
          margin-bottom: 14px;
        }

        .room-form-q-sub {
          margin: 24px 0 12px;
          color: rgba(255, 255, 255, 0.5);
          font-family: var(--room-sans);
          font-size: 12px;
          font-weight: 300;
          line-height: 1.5;
        }

        .room-form-req {
          color: var(--room-rose);
          margin-left: 2px;
          font-size: 13px;
        }

        .room-form-input {
          width: 100%;
          padding: 15px 22px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          font-family: var(--room-sans);
          font-size: 13px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          -webkit-appearance: none;
        }

        .room-form-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .room-form-input:focus {
          border-color: rgba(200, 245, 232, 0.4);
          background: rgba(255, 255, 255, 0.06);
        }

        .room-form-textarea {
          min-height: 100px;
          resize: none;
          line-height: 1.7;
        }

        .room-form-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: flex-start;
        }

        .room-form-chip {
          position: relative;
          max-width: 100%;
          flex: 0 1 auto;
        }

        .room-form-chip input {
          display: none;
        }

        .room-form-chip-label {
          display: inline-flex;
          width: fit-content;
          max-width: 100%;
          padding: 11px 22px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.75);
          font-family: var(--room-sans);
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.02em;
          line-height: 1.4;
          transition: all 0.2s ease;
          white-space: normal;
          overflow-wrap: anywhere;
          text-wrap: pretty;
          text-align: left;
          user-select: none;
        }

        .room-form-chip:hover .room-form-chip-label {
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .room-form-chip input[type="checkbox"]:checked + .room-form-chip-label {
          background: var(--room-rose);
          border-color: var(--room-rose);
          color: #080808;
        }

        .room-form-chip input[type="radio"]:checked + .room-form-chip-label {
          background: var(--room-mint);
          border-color: var(--room-mint);
          color: #080808;
        }

        .room-form-card {
          margin-bottom: 16px;
          padding: 36px;
          border: 1px solid rgba(200, 245, 232, 0.15);
          border-radius: 24px;
          background: rgba(200, 245, 232, 0.06);
        }

        .room-form-card-divider {
          height: 1px;
          margin: 28px 0;
          background: rgba(200, 245, 232, 0.12);
        }

        .room-form-textarea-wrap {
          margin-top: 16px;
        }

        .room-form-consent-wrap {
          margin-top: 48px;
          padding: 28px 32px;
          border: 1px solid rgba(200, 245, 232, 0.15);
          border-radius: 24px;
          background: rgba(200, 245, 232, 0.06);
          display: flex;
          align-items: flex-start;
          gap: 18px;
          transition: border-color 0.3s ease;
        }

        .room-form-consent-wrap:hover {
          border-color: rgba(255, 255, 255, 0.18);
        }

        .room-form-consent-wrap input {
          display: none;
        }

        .room-form-consent-box {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          margin-top: 2px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .room-form-consent-wrap input:checked + .room-form-consent-box {
          background: var(--room-rose);
          border-color: var(--room-rose);
        }

        .room-form-consent-wrap input:checked + .room-form-consent-box::after {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 3px;
          background: #080808;
          display: block;
        }

        .room-form-consent-text {
          color: rgba(255, 255, 255, 0.55);
          font-family: var(--room-sans);
          font-size: 13px;
          font-weight: 300;
          line-height: 1.8;
        }

        .room-form-consent-text strong {
          font-family: var(--room-display);
          font-weight: 400;
          color: rgba(255, 255, 255, 0.85);
        }

        .room-form-submit-wrap {
          margin-top: 52px;
          display: flex;
          justify-content: center;
        }

        .room-form-submit {
          min-height: auto;
          padding: 20px 72px;
          border: 1.5px solid transparent;
          font-family: var(--room-display);
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.04em;
        }

        .room-form-submit:hover {
          background: #080808;
          color: var(--room-mint);
          border-color: var(--room-mint);
          transform: scale(1.03);
        }

        .room-header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .room-wordmark {
          margin: 0;
          color: var(--room-mint);
          font-size: 0.8rem;
          font-weight: 300;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .room-back {
          color: var(--room-mint);
          text-decoration: none;
          font-size: 2rem;
          line-height: 1;
        }

        .room-title {
          margin: 0;
          font-family: var(--room-display);
          font-size: clamp(2.8rem, 7vw, 6rem);
          line-height: 0.9;
        }

        .room-landing-shell {
          min-height: calc(100vh - 64px);
          display: grid;
          grid-template-rows: 62px 1fr 62px;
          background: #000;
        }

        .room-landing-rail {
          display: block;
          background: var(--room-mint);
        }

        .room-landing-main {
          display: grid;
          place-items: center;
          padding: clamp(28px, 6vw, 72px);
        }

        .room-landing-content {
          display: grid;
          justify-items: center;
          gap: 22px;
          width: min(1200px, 100%);
          animation: roomLandingFade 720ms ease both;
        }

        .room-landing-title {
          margin: 0;
          font-family: var(--room-display);
          font-size: clamp(4.2rem, 13vw, 11rem);
          line-height: 0.88;
          letter-spacing: 0.01em;
          text-align: center;
          color: var(--room-text);
        }

        .room-landing-tagline {
          margin: -6px 0 10px;
          font-family: var(--room-sans);
          font-size: 0.76rem;
          font-weight: 100;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--room-mint);
        }

        .room-landing-cta {
          min-width: 266px;
          min-height: 80px;
          padding: 0 34px;
          border-radius: 999px;
          border: none;
          background: var(--room-mint);
          color: #000;
          font-family: var(--room-sans);
          font-size: 1.38rem;
          font-weight: 300;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }

        .room-landing-cta:hover {
          transform: translateY(-2px);
          background: #d4ffee;
          box-shadow: 0 16px 30px rgba(191, 248, 220, 0.18);
        }

        @keyframes roomLandingFade {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .room-subtitle {
          margin: 0;
          color: var(--room-rose);
          font-size: 1.05rem;
          font-weight: 300;
          line-height: 1.75;
          max-width: 68ch;
        }

        .room-paragraphs,
        .room-grid,
        .room-form-grid {
          display: grid;
          gap: 18px;
        }

        .room-body {
          margin: 0;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 300;
          line-height: 1.85;
        }

        .room-cta-row,
        .room-footer {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
        }

        .room-cta {
          min-height: 58px;
          padding: 0 28px;
          border: none;
          border-radius: 999px;
          background: var(--room-mint);
          color: #000;
          font-family: var(--room-display);
          font-size: 1rem;
          text-decoration: none;
          transition: transform 160ms ease, background 160ms ease;
        }

        .room-cta:hover {
          transform: translateY(-1px);
          background: #d4ffee;
        }

        .room-cta.room-form-submit {
          min-height: auto;
          padding: 20px 72px;
          border: 1.5px solid transparent;
          font-family: var(--room-display);
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.04em;
        }

        .room-cta.room-form-submit:hover {
          background: #080808;
          color: var(--room-mint);
          border-color: var(--room-mint);
          transform: scale(1.03);
        }

        .room-cta-secondary {
          background: rgba(255, 255, 255, 0.04);
          color: var(--room-text);
          border: 1px solid var(--room-line);
          font-family: var(--room-sans);
          font-weight: 300;
        }

        .room-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .room-about-shell {
          display: grid;
          gap: 0;
          animation: roomLandingFade 520ms ease both;
          background: var(--room-bg);
        }

        .room-about-mint-bar {
          display: none;
        }

        .room-about-hero {
          padding: 20px 0 60px;
        }

        .room-about-hero-inner {
          width: max-content;
          max-width: 100%;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .room-about-title {
          margin: 0;
          font-family: var(--room-display);
          font-size: clamp(40px, 6.5vw, 92px);
          line-height: 0.92;
          color: #ffffff;
          -webkit-text-stroke: 0;
          text-align: left;
        }

        .room-about-tagline {
          margin: 6px 0 0 auto;
          color: var(--room-mint);
          font-family: var(--room-sans);
          font-size: clamp(12px, 1.1vw, 14px);
          font-weight: 300;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-align: right;
        }

        .room-about-column,
        .room-about-section-inner {
          width: min(640px, 100%);
          margin: 0 auto;
          padding: 0 clamp(24px, 4vw, 60px);
        }

        .room-about-column {
          display: grid;
          gap: 0;
        }

        .room-about-copy {
          display: grid;
          gap: 0;
        }

        .room-about-copy .room-body,
        .room-about-quote-text,
        .room-about-quote-source,
        .room-about-step-text,
        .room-about-mint-line,
        .room-about-mint-reveal,
        .room-about-pillar-text,
        .room-about-accent,
        .room-about-closing-accent,
        .room-about-closing-line {
          margin: 0;
          font-family: var(--room-sans);
          font-weight: 300;
        }

        .room-about-copy .room-body,
        .room-about-step-text {
          color: #ffffff;
          font-size: clamp(14px, 1.5vw, 16px);
          line-height: 1.95;
          margin-bottom: 22px;
        }

        .room-about-mint-card {
          margin: 36px 0;
          padding: 22px 32px;
          border-radius: 22px;
          background: var(--room-mint);
          display: grid;
          gap: 1px;
          text-align: center;
        }

        .room-about-mint-line {
          color: rgba(8, 8, 8, 0.65);
          font-size: clamp(12px, 1.15vw, 14px);
          line-height: 1.25;
        }

        .room-about-mint-reveal {
          color: rgba(8, 8, 8, 0.88);
          font-size: clamp(12px, 1.15vw, 14px);
          line-height: 1.4;
          letter-spacing: 0.03em;
          margin-top: 10px;
        }

        .room-about-quote-card {
          margin: 44px 0;
          padding: 6px 0 6px 28px;
          border-left: 2px solid var(--room-pink);
        }

        .room-about-quote-text {
          color: #ffffff;
          font-size: clamp(14px, 1.3vw, 16px);
          line-height: 1.85;
          font-style: italic;
        }

        .room-about-quote-source {
          display: block;
          margin-top: 14px;
          color: var(--room-rose);
          font-size: 12px;
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .room-about-pivot {
          padding: 100px clamp(24px, 4vw, 60px);
        }

        .room-about-pivot-inner {
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          text-align: center;
        }

        .room-about-pivot-pill,
        .room-about-pivot-pill-filled {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
          padding: 16px 44px;
          border-radius: 999px;
          font-family: var(--room-sans);
          font-size: clamp(14px, 1.5vw, 17px);
          font-weight: 300;
          letter-spacing: 0.01em;
        }

        .room-about-pivot-pill {
          border: 1.5px solid var(--room-rose);
          color: #ffffff;
        }

        .room-about-pivot-pill-filled {
          background: var(--room-rose);
          color: #080808;
        }

        .room-about-pivot-title {
          margin: 12px auto 0;
          font-family: var(--room-horizon);
          font-size: clamp(30px, 5.2vw, 72px);
          line-height: 0.96;
          letter-spacing: 0.04em;
          color: var(--room-text);
          text-align: center;
          text-transform: uppercase;
        }

        .room-about-pivot-title-line {
          display: block;
        }

        .room-about-section {
          padding: 80px 0;
          border-top: 1px solid rgba(200, 245, 232, 0.18);
        }

        .room-about-section-alt {
          background: rgba(200, 245, 232, 0.04);
        }

        .room-about-section-label {
          margin-bottom: 32px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(200, 245, 232, 0.28);
        }

        .room-about-kicker {
          margin: 0;
          color: var(--room-mint);
          font-family: var(--room-sans);
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .room-about-rule {
          display: none;
        }

        .room-about-centered-copy .room-body {
          max-width: 760px;
          margin: 0 auto 18px;
          text-align: center;
        }

        .room-about-pillar-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0;
          background: transparent;
          margin-top: 40px;
        }

        .room-about-pillar {
          background: var(--room-bg);
          padding: 36px 32px;
          display: grid;
          gap: 12px;
        }

        .room-about-pillar + .room-about-pillar {
          border-left: 1px solid rgba(200, 245, 232, 0.24);
        }

        .room-about-pillar-pill {
          display: block;
          color: var(--room-mint);
          font-family: var(--room-display);
          font-size: 18px;
          letter-spacing: 0.05em;
        }

        .room-about-pillar-text {
          color: #ffffff;
          font-size: 14px;
          font-weight: 300;
          line-height: 1.8;
        }

        .room-about-process-steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0;
        }

        .room-about-step {
          display: flex;
          align-items: baseline;
          gap: 24px;
          padding: 22px 0;
          border-bottom: 1px solid rgba(200, 245, 232, 0.16);
        }

        .room-about-step-index {
          color: var(--room-rose);
          font-family: var(--room-display);
          font-size: 30px;
          line-height: 1;
          flex: 0 0 auto;
        }

        .room-about-step-text {
          font-size: clamp(15px, 1.45vw, 17px);
          line-height: 1.7;
        }

        .room-about-accent {
          color: #ffffff;
          font-size: clamp(16px, 1.8vw, 19px);
          line-height: 1.95;
          border-left: 2px solid var(--room-rose);
          padding-left: 24px;
          margin-top: 8px;
        }

        .room-about-closing {
          padding: 100px 0 0;
          border-top: none;
        }

        .room-about-closing-inner {
          width: min(640px, 100%);
          margin: 0 auto;
          padding: 0 clamp(24px, 4vw, 60px) 64px;
        }

        .room-about-closing-rule {
          width: 36px;
          height: 1px;
          background: var(--room-mint);
          margin-bottom: 52px;
        }

        .room-about-closing-label {
          margin: 0 0 48px;
          color: var(--room-mint);
          font-family: var(--room-sans);
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .room-about-closing-line {
          color: #ffffff;
          font-size: clamp(20px, 2.2vw, 28px);
          line-height: 1.65;
          margin-bottom: 8px;
        }

        .room-about-closing-accent {
          color: var(--room-rose);
          font-size: clamp(16px, 1.7vw, 20px);
          line-height: 1.8;
          font-style: italic;
          margin-top: 32px;
          margin-bottom: 64px;
        }

        .room-about-closing .room-cta-row {
          justify-content: center;
        }

        .room-about-closing .room-cta {
          min-height: 76px;
          padding: 0 58px;
          font-size: 1.18rem;
        }

        .room-block,
        .room-section {
          border-radius: 28px;
          border: 1px solid var(--room-line);
          background: var(--room-card-soft);
          padding: 22px;
          display: grid;
          gap: 14px;
        }

        .room-block-title,
        .room-section-title {
          margin: 0;
          color: var(--room-rose);
          font-size: 1.35rem;
          line-height: 1.15;
        }

        .room-form-section-head {
          display: grid;
          gap: 8px;
        }

        .room-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .room-field {
          display: grid;
          gap: 12px;
          padding: 18px;
          border-radius: 24px;
          border: 1px solid var(--room-line);
          background: rgba(255, 255, 255, 0.02);
        }

        .room-label {
          margin: 0;
          line-height: 1.6;
        }

        .room-required {
          color: var(--room-rose);
          margin-left: 6px;
        }

        .room-chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .room-chip {
          min-height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid var(--room-line);
          background: rgba(255, 255, 255, 0.03);
          color: var(--room-text);
          font-family: var(--room-sans);
          font-size: 0.92rem;
          font-weight: 300;
          transition: transform 160ms ease, background 160ms ease;
        }

        .room-chip:hover {
          transform: translateY(-1px);
        }

        .room-chip-active {
          background: var(--room-mint);
          border-color: rgba(191, 248, 220, 0.72);
          color: #000;
        }

        .room-input {
          width: 100%;
          min-height: 52px;
          padding: 0 16px;
          border-radius: 20px;
          border: 1px solid var(--room-line);
          background: rgba(255, 255, 255, 0.03);
          color: var(--room-text);
          font-family: var(--room-sans);
          font-size: 0.98rem;
          outline: none;
        }

        .room-textarea {
          min-height: 140px;
          padding: 16px;
          resize: vertical;
        }

        .room-consent {
          display: grid;
          gap: 12px;
          padding: 20px;
          border-radius: 26px;
          border: 1px solid var(--room-line);
          background: rgba(255, 255, 255, 0.02);
        }

        .room-consent-row {
          display: flex;
          gap: 14px;
          align-items: start;
        }

        .room-consent-box {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          border: 1px solid var(--room-line);
          background: ${"rgba(255, 255, 255, 0.03)"};
          flex: 0 0 auto;
          margin-top: 2px;
          position: relative;
        }

        .room-consent-box-active {
          background: var(--room-mint);
          border-color: rgba(191, 248, 220, 0.72);
        }

        .room-consent-box-active::after {
          content: "";
          position: absolute;
          inset: 6px;
          border-radius: 4px;
          background: #000;
        }

        .room-note,
        .room-message {
          margin: 0;
          color: var(--room-muted);
          line-height: 1.7;
        }

        .room-message-success {
          color: var(--room-mint);
        }

        .room-message-error {
          color: var(--room-rose);
        }

        .room-footer {
          display: grid;
          gap: 8px;
          justify-items: center;
          padding: 28px clamp(20px, 4vw, 52px);
          border-top: none;
          background: var(--room-bg);
        }

        .room-footer-links {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }

        .room-footer-link {
          color: #ffffff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .room-footer .room-note {
          color: #ffffff;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.06em;
        }

        .room-footer-thin .room-footer-link {
          font-size: 10px;
          font-weight: 100;
          letter-spacing: 0.14em;
        }

        .room-footer-thin .room-note {
          font-size: 10px;
          font-weight: 100;
          letter-spacing: 0.1em;
        }

        @media (max-width: 860px) {
          .room-grid,
          .room-form-grid,
          .room-about-pillar-grid {
            grid-template-columns: 1fr;
          }

          .room-form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .room-page {
            padding: 18px 14px 56px;
          }

          .room-page-about {
            padding: 0 0 56px;
          }

          .room-page-form {
            padding: 0;
          }

          .room-stage {
            padding: 20px;
            border-radius: 28px;
          }

          .room-stage-landing {
            padding: 0;
          }

          .room-stage-form {
            padding: 52px 0 0;
            border-radius: 0;
          }

          .room-landing-shell {
            min-height: calc(100vh - 74px);
            grid-template-rows: 52px 1fr 52px;
          }

          .room-landing-title {
            font-size: clamp(3.1rem, 18vw, 6.4rem);
          }

          .room-landing-cta {
            min-width: 220px;
            min-height: 68px;
            font-size: 1.14rem;
          }

          .room-about-hero {
            padding: 20px 0 32px;
          }

          .room-about-title {
            font-size: clamp(52px, 16vw, 80px);
          }

          .room-about-tagline {
            font-size: 12px;
          }

          .room-about-column,
          .room-about-section-inner,
          .room-about-closing-inner {
            padding: 0 20px;
          }

          .room-about-section {
            padding: 48px 0;
          }

          .room-about-mint-card {
            padding: 24px 20px;
          }

          .room-about-pivot {
            padding: 48px 20px;
          }

          .room-about-pivot-pill,
          .room-about-pivot-pill-filled {
            min-height: 0;
            padding: 10px 16px;
            font-size: 13px;
          }

          .room-about-pillar + .room-about-pillar {
            border-left: none;
            border-top: 1px solid rgba(200, 245, 232, 0.24);
          }

          .room-about-pivot-title {
            font-size: clamp(18px, 6.4vw, 30px);
          }

          .room-about-step {
            gap: 16px;
          }

          .room-about-step-index {
            font-size: 24px;
          }

          .room-about-closing {
            padding-top: 48px;
          }

          .room-about-closing-inner {
            padding-bottom: 40px;
          }

          .room-about-closing-line {
            font-size: clamp(24px, 7vw, 34px);
          }

          .room-about-closing-accent {
            font-size: clamp(18px, 5vw, 22px);
          }

          .room-about-closing .room-cta {
            min-height: 68px;
            padding: 0 42px;
            font-size: 1.05rem;
          }

          .room-form-header {
            padding: 72px 20px 32px;
          }

          .room-form-body {
            padding: 32px 20px 64px;
          }

          .room-form-section-title {
            font-size: 10px;
            letter-spacing: 0.3em;
          }

          .room-form-card {
            padding: 24px 20px;
          }

          .room-form-q-label {
            font-size: 13px;
          }

          .room-form-q-sub {
            font-size: 12px;
          }

          .room-form-chip-group {
            gap: 7px;
          }

          .room-form-chip-label {
            padding: 8px 14px;
            font-size: 11px;
          }

          .room-form-input {
            font-size: 13px;
          }

          .room-form-consent-text {
            font-size: 12px;
          }

          .cursor {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .room-shell {
            padding-left: clamp(16px, 5vw, 28px);
            padding-right: clamp(16px, 5vw, 28px);
          }

          .room-page .room-body,
          .room-page .room-about-copy .room-body,
          .room-page .room-about-step-text,
          .room-page .room-about-pillar-text,
          .room-page .room-about-accent,
          .room-page .room-about-closing-accent {
            font-size: clamp(16px, 3.8vw, 18px);
            line-height: 1.55;
          }

          .room-page .room-about-quote-text {
            font-size: clamp(16px, 4.2vw, 20px);
            line-height: 1.5;
          }

          .room-page h1,
          .room-page .room-title {
            font-size: clamp(44px, 10vw, 84px);
            line-height: 0.95;
          }
        }

        @media (max-width: 480px) {
          .room-page-form {
            background: var(--room-bg);
          }

          .room-form-header {
            padding: 56px clamp(16px, 5vw, 24px) 20px;
          }

          .room-form-body {
            padding: 24px clamp(16px, 5vw, 24px) 52px;
          }

          .room-form-field-label,
          .room-form-q-label,
          .room-form-q-sub,
          .room-form-consent-text {
            font-size: clamp(15px, 4vw, 17px);
            line-height: 1.55;
          }

          .room-form-q-sub {
            margin: 18px 0 10px;
          }

          .room-form-card {
            padding: 20px 16px;
          }

          .room-form-card-divider {
            margin: 22px 0;
          }

          input.room-form-input {
            min-height: 52px;
            padding: 0 16px;
            font-size: 15px;
          }

          .room-form-textarea {
            min-height: 92px;
            padding: 14px 16px;
          }

          .room-form-consent-wrap {
            margin-top: 32px;
            padding: 20px 16px;
            gap: 14px;
          }

          .room-form-submit-wrap {
            margin-top: 36px;
          }

          .room-cta.room-form-submit {
            padding: 18px 22px;
            font-size: clamp(18px, 5vw, 22px);
          }

          .room-footer-links {
            display: flex;
            justify-content: center;
            flex-wrap: nowrap;
            gap: 12px;
            white-space: nowrap;
          }

          .room-footer-link {
            white-space: nowrap;
          }
        }

        @media (max-width: 380px) {
          .room-form-chip-label {
            padding: 7px 12px;
            font-size: 10px;
          }
        }

        @media (max-width: 360px) {
          .room-page:not(.room-page-about):not(.room-page-form) {
            padding: 10px 10px 12px;
          }

          .room-stage-landing {
            border: none;
            border-radius: 0;
            background: transparent;
            box-shadow: none;
            padding: 0;
          }

          .room-landing-shell {
            height: calc(100svh - 22px);
            max-height: 96svh;
            border: 1px solid var(--room-line-mint);
            border-radius: 34px;
            overflow: hidden;
            grid-template-rows: clamp(32px, 10vw, 44px) minmax(0, 1fr) clamp(32px, 10vw, 44px);
          }

          .room-landing-main {
            border: none;
            outline: none;
            box-shadow: none;
            padding: clamp(10px, 3vw, 16px);
          }

          .room-landing-main::before,
          .room-landing-main::after,
          .room-landing-shell::before,
          .room-landing-shell::after {
            content: none !important;
            display: none !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }

          .room-landing-content {
            gap: 10px;
            padding: 0 6px;
          }

          .room-landing-content .room-landing-title {
            max-width: 100%;
            white-space: nowrap;
            font-size: clamp(40px, 12vw, 54px);
            line-height: 0.9;
            letter-spacing: 0;
          }

          .room-landing-content .room-landing-tagline {
            margin: 6px 0 2px;
            font-size: clamp(10px, 3.2vw, 13px);
            letter-spacing: 0.22em;
          }

          .room-landing-content .room-landing-cta {
            width: min(240px, 82vw);
            min-width: 0;
            min-height: 54px;
            padding: 14px 18px;
            font-size: clamp(15px, 4.5vw, 17px);
          }
        }
      `}</style>

      <div className="cursor" id="cursor" />

      <main className={`room-page${isAboutView ? " room-page-about" : ""}${isFormView ? " room-page-form" : ""}`}>
        <div className={`room-shell${isAboutView ? " room-shell-about" : ""}${isFormView ? " room-shell-form" : ""}`}>
          <section
            className={`room-stage${view === "landing" ? " room-stage-landing" : ""}${isAboutView ? " room-stage-about" : ""}${isFormView ? " room-stage-form" : ""}`}
          >

            {view === "landing" ? (
              <div className="room-landing-shell">
                <div className="room-landing-rail" />
                <div className="room-landing-main">
                  <div className="room-landing-content">
                    <h1 className="room-landing-title">{page.title}</h1>
                    <p className="room-landing-tagline">{page.landing.eyebrow}</p>
                    <button className="room-landing-cta" onClick={() => setView("about")} type="button">
                      {page.landing.ctaLabel}
                    </button>
                  </div>
                </div>
                <div className="room-landing-rail" />
              </div>
            ) : null}

            {view === "about" ? (
              <>
                <div className="room-about-shell">
                  <div className="room-about-mint-bar" />

                  <section className="room-about-hero">
                    <div className="room-about-hero-inner">
                      <h1 className="room-about-title">{page.about.title}</h1>
                      <p className="room-about-tagline">{page.about.tagline}</p>
                    </div>
                  </section>

                  <div className="room-about-column">
                    <div className="room-about-copy">
                      {page.about.intro.map((paragraph) => (
                        <p className="room-body" key={paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <article className="room-about-mint-card">
                      {page.about.observationBox.lines.map((line) => (
                        <p className="room-about-mint-line" key={line}>
                          {line}
                        </p>
                      ))}
                      <p className="room-about-mint-reveal">{page.about.observationBox.reveal}</p>
                    </article>

                    <div className="room-about-copy">
                      {page.about.algorithmProblem.map((paragraph) => (
                        <p className="room-body" key={paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <blockquote className="room-about-quote-card">
                      <p className="room-about-quote-text">“{page.about.quoteOne.text}”</p>
                      <p className="room-about-quote-source">{page.about.quoteOne.source}</p>
                    </blockquote>

                    <div className="room-about-copy">
                      {page.about.algorithmLoop.map((paragraph) => (
                        <p className="room-body" key={paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <article className="room-about-mint-card">
                      {page.about.cycleBox.lines.map((line) => (
                        <p className="room-about-mint-line" key={line}>
                          {line}
                        </p>
                      ))}
                      <p className="room-about-mint-reveal">{page.about.cycleBox.reveal}</p>
                    </article>

                    <div className="room-about-copy">
                      {page.about.signalProblem[0] ? <p className="room-body">{page.about.signalProblem[0]}</p> : null}
                    </div>

                    <blockquote className="room-about-quote-card">
                      <p className="room-about-quote-text">“{page.about.quoteTwo.text}”</p>
                      <p className="room-about-quote-source">{page.about.quoteTwo.source}</p>
                    </blockquote>

                    <div className="room-about-copy">
                      {page.about.signalProblem.slice(1).map((paragraph) => (
                        <p className="room-body" key={paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  <section className="room-about-pivot">
                    <div className="room-about-pivot-inner">
                      <span className="room-about-pivot-pill">{page.about.pivot.intro}</span>
                      <span className="room-about-pivot-pill-filled">{page.about.pivot.signal}</span>
                      <h2 className="room-about-pivot-title">
                        {page.about.pivot.title}
                        {page.about.pivot.emphasis ? (
                          <span className="room-about-pivot-title-line">{page.about.pivot.emphasis}</span>
                        ) : null}
                      </h2>
                    </div>
                  </section>

                  <section className="room-about-section">
                    <div className="room-about-section-inner">
                      <div className="room-about-section-label">
                        <p className="room-about-kicker">{page.about.gmtp.label}</p>
                        <div className="room-about-rule" />
                      </div>
                      <div className="room-about-copy room-about-centered-copy">
                        <p className="room-body">{page.about.gmtp.intro}</p>
                      </div>
                      <div className="room-about-pillar-grid">
                        {page.about.gmtp.pillars.map((pillar) => (
                          <article className="room-about-pillar" key={pillar.pill}>
                            <span className="room-about-pillar-pill">{pillar.pill}</span>
                            <p className="room-about-pillar-text">{pillar.text}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>

                  {[page.about.signal, page.about.room].map((block, index) => (
                    <section className={`room-about-section${index % 2 === 0 ? " room-about-section-alt" : ""}`} key={block.label}>
                      <div className="room-about-section-inner">
                        <div className="room-about-section-label">
                          <p className="room-about-kicker">{block.label}</p>
                          <div className="room-about-rule" />
                        </div>
                        <div className="room-about-copy">
                          {block.paragraphs.map((paragraph) => (
                            <p className="room-body" key={paragraph}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </section>
                  ))}

                  <section className="room-about-section room-about-section-alt">
                    <div className="room-about-section-inner">
                      <div className="room-about-section-label">
                        <p className="room-about-kicker">{page.about.process.label}</p>
                        <div className="room-about-rule" />
                      </div>
                      <div className="room-about-process">
                        <ol className="room-about-process-steps">
                          {page.about.process.steps.map((step, index) => (
                            <li className="room-about-step" key={step}>
                              <span className="room-about-step-index">{String(index + 1).padStart(2, "0")}</span>
                              <p className="room-about-step-text">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </section>

                  {[page.about.utility, page.about.data, page.about.ai].map((block, index) => (
                    <section className={`room-about-section${index === 1 ? " room-about-section-alt" : ""}`} key={block.label}>
                      <div className="room-about-section-inner">
                        <div className="room-about-section-label">
                          <p className="room-about-kicker">{block.label}</p>
                          <div className="room-about-rule" />
                        </div>
                        <div className="room-about-copy">
                          {block.paragraphs.map((paragraph) => (
                            <p className="room-body" key={paragraph}>
                              {paragraph}
                            </p>
                          ))}
                          {"accent" in block && block.accent ? <p className="room-about-accent">{block.accent}</p> : null}
                        </div>
                      </div>
                    </section>
                  ))}

                  <section className="room-about-closing">
                    <div className="room-about-closing-inner">
                      <div className="room-about-closing-rule" />
                      <p className="room-about-closing-label">Pour résumer</p>
                      {page.about.closing.lines.map((line) => (
                        <p className="room-about-closing-line" key={line}>
                          {line}
                        </p>
                      ))}
                      <p className="room-about-closing-accent">{page.about.closing.accent}</p>
                      <div className="room-cta-row">
                        <button className="room-cta" onClick={() => setView("form")} type="button">
                          {page.form.title}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            ) : null}

            {view === "form" ? (
              <>
                <div className="room-form-header">
                  <div className="room-form-header-inner">
                    <h1 className="room-form-title" dangerouslySetInnerHTML={{ __html: page.form.headerTitleHtml }} />
                  </div>
                </div>

                <div className="room-form-body">
                  <div className="room-form-section-title">{page.form.sections[0]?.title}</div>
                  <div className="room-form-row">
                    {renderTextQuestion("fullName")}
                    {renderTextQuestion("email")}
                  </div>
                  <div className="room-form-row">
                    {renderTextQuestion("mobile")}
                    {renderTextQuestion("city")}
                  </div>

                  <div className="room-form-section-title">tranche d'âge</div>
                  {renderChoiceQuestion("age")}

                  <div className="room-form-section-title">{page.form.sections[1]?.title}</div>
                  <div className="room-form-card">
                    {renderChoiceQuestion("freq")}

                    <div className="room-form-card-divider" />

                    {renderChoiceQuestion("platforms_yn")}
                    <div className="room-form-q-sub">si oui, lesquelles ? (plusieurs réponses possibles)</div>
                    <QuestionField
                      onChange={(nextValue) => setAnswer(getQuestion("streaming_platforms"), nextValue)}
                      question={getQuestion("streaming_platforms")}
                      value={answers.streaming_platforms}
                    />

                    <div className="room-form-card-divider" />

                    {renderChoiceQuestion("tv_yn")}
                    <div className="room-form-q-sub">si oui, quelles sont vos chaînes de prédilection ?</div>
                    <QuestionField
                      onChange={(nextValue) => setAnswer(getQuestion("tv_channels"), nextValue)}
                      question={getQuestion("tv_channels")}
                      value={answers.tv_channels}
                    />

                    <div className="room-form-card-divider" />

                    {renderChoiceQuestion("replay_yn")}
                    <div className="room-form-q-sub">si oui, sur quelles plateformes ?</div>
                    <QuestionField
                      onChange={(nextValue) => setAnswer(getQuestion("replay_platforms"), nextValue)}
                      question={getQuestion("replay_platforms")}
                      value={answers.replay_platforms}
                    />
                  </div>

                  <div className="room-form-section-title">{page.form.sections[2]?.title}</div>
                  <div className="room-form-card">
                    {renderChoiceQuestion("liked_genres")}

                    <div className="room-form-card-divider" />

                    {renderChoiceQuestion("genre_favori")}

                    <div className="room-form-card-divider" />

                    {renderChoiceQuestion("origin")}
                    <div className="room-form-textarea-wrap">
                      <QuestionField
                        onChange={(nextValue) => setAnswer(getQuestion("origin_detail"), nextValue)}
                        question={getQuestion("origin_detail")}
                        value={answers.origin_detail}
                      />
                    </div>

                    <div className="room-form-card-divider" />

                    {renderChoiceQuestion("fr_quality")}

                    <div className="room-form-card-divider" />

                    {renderChoiceQuestion("fr_raison")}

                    <div className="room-form-card-divider" />

                    <div className="room-form-q-label">{getQuestion("fr_raison_detail")?.label}</div>
                    <div className="room-form-textarea-wrap">
                      <QuestionField
                        onChange={(nextValue) => setAnswer(getQuestion("fr_raison_detail"), nextValue)}
                        question={getQuestion("fr_raison_detail")}
                        value={answers.fr_raison_detail}
                      />
                    </div>

                    <div className="room-form-card-divider" />

                    {renderChoiceQuestion("prescripteur")}
                  </div>

                  <div className="room-form-section-title">consentement</div>
                  <label className="room-form-consent-wrap">
                    <input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
                    <div className="room-form-consent-box" />
                    <div
                      className="room-form-consent-text"
                      dangerouslySetInnerHTML={{ __html: page.form.consentLabel.replace("THE ROOM", "<strong>THE ROOM</strong>") }}
                    />
                  </label>

                  <div className="room-form-submit-wrap">
                    <button className="room-cta room-form-submit" disabled={requestState === "loading"} onClick={handleSubmit} type="button">
                      {page.form.submitLabel}
                    </button>
                  </div>

                  {requestState !== "idle" ? (
                    <p
                      className={`room-message ${
                        requestState === "success"
                          ? "room-message-success"
                          : requestState === "error"
                            ? "room-message-error"
                            : ""
                      }`}
                    >
                      {message}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </section>

          {view === "about" ? (
            <footer className={`room-footer${isAboutView ? " room-footer-thin" : ""}`}>
              <div className="room-footer-links">
                {page.footerLinks.map((link) => (
                  <Link className="room-footer-link" href={link.href} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <p className="room-note">© GIVE ME THE PITCH</p>
            </footer>
          ) : null}
        </div>
      </main>
    </>
  );
}
