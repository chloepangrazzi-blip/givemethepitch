"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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

function getVisibleQuestions(page, answers) {
  return page.sections.flatMap((section) =>
    section.questions.filter((question) => isVisible(question, answers)).map((question) => ({
      ...question,
      sectionId: section.id,
    }))
  );
}

function ChipGroup({ name, onChange, options, type, value }) {
  const isCheckbox = type === "checkbox";

  return (
    <div className="ft-chip-group">
      {options.map((option) => {
        const selected = isCheckbox ? Array.isArray(value) && value.includes(option) : value === option;

        return (
          <label className="ft-chip" key={`${name}-${option}`}>
            <input
              checked={selected}
              name={type === "radio" ? name : undefined}
              onChange={() => onChange(option)}
              type={type}
            />
            <span className="ft-chip-label">{option}</span>
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
        className="ft-field-input ft-field-textarea"
        onChange={(event) => onChange(event.target.value)}
        placeholder={question.placeholder}
        rows={5}
        value={value || ""}
      />
    );
  }

  return (
    <input
      className="ft-field-input"
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.placeholder}
      type={question.type || "text"}
      value={value || ""}
    />
  );
}

export default function FormtestPageClient(page) {
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState("idle");
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState("");
  const timeoutRef = useRef([]);
  const previewMode = page.previewMode === "confirm" || page.previewMode === "processing" ? page.previewMode : "";
  const effectivePhase = previewMode === "confirm" || previewMode === "processing" ? previewMode : phase;
  const effectiveProgressStep =
    previewMode === "processing" ? page.processingMessages.length - 1 : progressStep;

  useDesktopCursor({
    hoverSelector: "button, a, textarea, input, label",
    spotlightSelector: ".ft-submit, .ft-chip-label, .ft-card-section",
  });

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const visibleQuestions = useMemo(() => getVisibleQuestions(page, answers), [answers, page]);
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
    if (effectivePhase === "processing") {
      return;
    }

    if (missingRequiredQuestions.length > 0) {
      setError("Merci de renseigner tous les champs obligatoires avant de soumettre.");
      return;
    }

    setError("");
    setPhase("processing");
    setProgressStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const submittedAccessCode = window.sessionStorage?.getItem("gmtp_access_code") || "";
    const minimumProcessingDelay = page.processingMessages.length * 520 + 800;

    const progressTimers = page.processingMessages.map((_, index) =>
      window.setTimeout(() => setProgressStep(index), index * 520)
    );

    timeoutRef.current = progressTimers;

    try {
      const requestPromise = fetch("/api/tests/submit", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode: submittedAccessCode,
          answers,
        }),
      }).then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.detail || result.error || "test_submit_failed");
        }

        return result;
      });

      await Promise.all([
        requestPromise,
        new Promise((resolve) => {
          const timeoutId = window.setTimeout(resolve, minimumProcessingDelay);
          timeoutRef.current.push(timeoutId);
        }),
      ]);

      setPhase("confirm");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "test_submit_failed";
      setError(message);
      setPhase("idle");
      window.alert(`Une erreur est survenue pendant l'envoi du questionnaire.\n${message}`);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --ft-bg: #000000;
          --ft-text: #ffffff;
          --ft-muted: rgba(255, 255, 255, 0.7);
          --ft-soft: rgba(255, 255, 255, 0.5);
          --ft-mint: #c8f5e8;
          --ft-rose: #f5c6d8;
          --ft-line: rgba(255, 255, 255, 0.09);
          --ft-line-mint: rgba(200, 245, 232, 0.15);
          --ft-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", "Segoe UI", sans-serif;
          --ft-display: "Made Soulmaze", "Poppins", sans-serif;
        }

        html,
        body {
          margin: 0;
          background: var(--ft-bg);
          color: var(--ft-text);
          font-family: var(--ft-sans);
          cursor: none;
        }

        * {
          box-sizing: border-box;
        }

        .ft-page,
        .ft-page * {
          cursor: none !important;
        }

        .cursor {
          position: fixed;
          width: 14px;
          height: 14px;
          background: var(--ft-mint);
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

        .ft-page {
          min-height: 100vh;
          background: #000;
        }

        .ft-shell {
          width: 100%;
        }

        .ft-form-header {
          padding: 80px 6vw 64px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ft-form-header-inner,
        .ft-form-body {
          width: min(820px, 100%);
          margin: 0 auto;
        }

        .ft-form-header-inner {
          display: grid;
          justify-items: center;
          text-align: center;
        }

        .ft-form-title {
          margin: 0;
          color: #ffffff;
          font-family: var(--ft-display);
          font-size: clamp(48px, 9vw, 110px);
          font-weight: 400;
          line-height: 1;
        }

        .ft-form-subtitle {
          margin: 12px 0 0;
          color: var(--ft-mint);
          font-size: clamp(1rem, 1.8vw, 1.32rem);
          font-weight: 300;
          line-height: 1.5;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .ft-form-intro {
          margin: 18px 0 0;
          color: var(--ft-muted);
          font-size: 0.98rem;
          font-weight: 300;
          line-height: 1.9;
        }

        .ft-form-body {
          padding: 64px 6vw 100px;
        }

        .ft-block-label {
          margin-top: 60px;
          margin-bottom: 28px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(200, 245, 232, 0.42);
          color: var(--ft-mint);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .ft-block-label:first-child {
          margin-top: 0;
        }

        .ft-card-section {
          padding: 36px;
          border: 1px solid var(--ft-line-mint);
          border-radius: 24px;
          background: rgba(200, 245, 232, 0.06);
        }

        .ft-question-block {
          display: grid;
          gap: 14px;
        }

        .ft-card-divider {
          height: 1px;
          margin: 28px 0;
          background: rgba(200, 245, 232, 0.12);
        }

        .ft-q-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 15px;
          font-weight: 300;
          line-height: 1.5;
        }

        .ft-required {
          color: var(--ft-rose);
          margin-left: 2px;
          font-size: 13px;
        }

        .ft-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: flex-start;
        }

        .ft-chip {
          position: relative;
          max-width: 100%;
          flex: 0 1 auto;
        }

        .ft-chip input {
          display: none;
        }

        .ft-chip-label {
          display: inline-flex;
          width: fit-content;
          max-width: 100%;
          padding: 11px 22px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.75);
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

        .ft-chip:hover .ft-chip-label {
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .ft-chip input[type="checkbox"]:checked + .ft-chip-label {
          background: var(--ft-rose);
          border-color: var(--ft-rose);
          color: #080808;
        }

        .ft-chip input[type="radio"]:checked + .ft-chip-label {
          background: var(--ft-mint);
          border-color: var(--ft-mint);
          color: #080808;
        }

        .ft-field-input {
          width: 100%;
          padding: 15px 22px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          font-family: var(--ft-sans);
          font-size: 13px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          -webkit-appearance: none;
        }

        .ft-field-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .ft-field-input:focus {
          border-color: rgba(200, 245, 232, 0.4);
          background: rgba(255, 255, 255, 0.06);
        }

        .ft-field-textarea {
          min-height: 100px;
          resize: none;
          line-height: 1.7;
        }

        .ft-form-submit-wrap {
          margin-top: 52px;
          display: grid;
          gap: 12px;
          justify-items: center;
        }

        .ft-submit {
          min-height: auto;
          padding: 20px 72px;
          border: 1.5px solid transparent;
          border-radius: 999px;
          background: var(--ft-mint);
          color: #080808;
          font-family: var(--ft-display);
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.04em;
          box-shadow: 0 14px 34px rgba(200, 245, 232, 0.1);
          transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, color 180ms ease;
        }

        .ft-submit:hover {
          transform: translateY(-2px);
          background: #d8ffe9;
          box-shadow: 0 18px 42px rgba(200, 245, 232, 0.24);
          color: #050505;
        }

        .ft-submit:disabled {
          opacity: 0.65;
        }

        .ft-submit-note,
        .ft-error {
          margin: 0;
          text-align: center;
          line-height: 1.8;
        }

        .ft-submit-note {
          max-width: 360px;
          color: var(--ft-soft);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ft-error {
          color: var(--ft-rose);
          font-size: 0.86rem;
        }

        .ft-processing-screen,
        .ft-confirm-screen {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 24px;
          background: #000000;
        }

        .ft-processing-screen {
          gap: 0;
        }

        .ft-proc-logo {
          margin: 0 0 52px;
          color: rgba(200, 245, 232, 0.3);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          text-align: center;
        }

        .ft-proc-status {
          margin: 0 0 28px;
          min-height: 22px;
          color: #ffffff;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.22em;
          line-height: 1.5;
          text-transform: uppercase;
          text-align: center;
        }

        .ft-proc-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 0;
        }

        .ft-proc-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(200, 245, 232, 0.15);
          transition: background 0.3s ease;
        }

        .ft-proc-dot-active {
          background: var(--ft-mint);
        }

        .ft-confirm-screen {
          gap: 24px;
        }

        .ft-confirm-signal {
          margin: 0 0 -8px;
          color: var(--ft-mint);
          font-size: clamp(14px, 2vw, 24px);
          font-weight: 300;
          letter-spacing: 0.25em;
          line-height: 1.5;
          text-transform: uppercase;
          text-align: center;
        }

        .ft-confirm-title {
          margin: 0;
          font-family: var(--ft-display);
          font-size: clamp(80px, 18vw, 200px);
          color: var(--ft-mint);
          line-height: 1;
          text-align: center;
        }

        .ft-confirm-sub {
          margin: 0;
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.12em;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 760px) {
          .ft-form-header {
            padding: 72px 20px 32px;
          }

          .ft-form-body {
            padding: 32px 20px 64px;
          }

          .ft-block-label {
            font-size: 10px;
            letter-spacing: 0.3em;
          }

          .ft-card-section {
            padding: 24px 20px;
          }

          .ft-q-label {
            font-size: 13px;
          }

          .ft-chip-group {
            gap: 7px;
          }

          .ft-chip-label {
            padding: 8px 14px;
            font-size: 11px;
          }

          .ft-field-input {
            font-size: 13px;
          }

          .ft-submit-note {
            font-size: 11px;
            line-height: 1.7;
          }

          .ft-form-subtitle {
            font-size: 0.92rem;
            letter-spacing: 0.14em;
          }

          .ft-proc-logo {
            font-size: 9px;
            margin-bottom: 36px;
          }

          .ft-proc-status {
            font-size: 11px;
            letter-spacing: 0.15em;
          }

          .ft-proc-dots {
            gap: 6px;
          }

          .ft-proc-dot {
            width: 6px;
            height: 6px;
          }

          .ft-confirm-signal {
            font-size: clamp(11px, 3.5vw, 16px);
            letter-spacing: 0.18em;
          }

          .ft-confirm-title {
            font-size: clamp(64px, 20vw, 140px);
          }

          .ft-confirm-sub {
            font-size: 12px;
          }

          .cursor {
            display: none;
          }
        }

        @media (max-width: 380px) {
          .ft-chip-label {
            padding: 7px 12px;
            font-size: 10px;
          }
        }

        @media (max-width: 500px) {
          .ft-form-header {
            padding: 56px clamp(16px, 5vw, 24px) 20px;
          }

          .ft-form-body {
            padding: 24px clamp(16px, 5vw, 24px) 52px;
          }

          .ft-q-label {
            font-size: clamp(15px, 4vw, 17px);
            line-height: 1.55;
          }

          .ft-card-section {
            padding: 20px 16px;
          }

          .ft-card-divider {
            margin: 22px 0;
          }

          .ft-field-input {
            min-height: 52px;
            padding: 0 16px;
            font-size: 15px;
          }

          .ft-field-input::placeholder {
            font-size: 12px;
            line-height: 1.35;
            color: rgba(255, 255, 255, 0.3);
          }

          .ft-field-textarea {
            min-height: 92px;
            padding: 14px 16px;
          }

          .ft-chip-group {
            gap: 8px;
          }

          .ft-chip {
            flex: 1 1 auto;
            display: flex;
          }

          .ft-chip-label {
            display: flex;
            width: 100%;
            min-height: 42px;
            padding: 10px 14px;
            font-size: 11px;
            line-height: 1.35;
            align-items: center;
            justify-content: center;
            text-align: center;
            white-space: normal;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .ft-form-submit-wrap {
            margin-top: 36px;
          }

          .ft-submit {
            padding: 18px 22px;
            font-size: clamp(18px, 5vw, 22px);
          }

          .ft-submit-note {
            font-size: 12px;
            line-height: 1.65;
            max-width: 62ch;
            color: rgba(255, 255, 255, 0.5);
          }
        }

        @media (max-width: 390px) {
          .ft-form-header {
            padding-top: 52px;
            padding-bottom: 18px;
          }

          .ft-form-body {
            padding-top: 22px;
            padding-bottom: 48px;
          }

          .ft-form-title {
            font-size: clamp(42px, 11vw, 56px);
          }

          .ft-block-label {
            margin-top: 52px;
            margin-bottom: 24px;
            padding-bottom: 12px;
            font-size: 9px;
            letter-spacing: 0.28em;
          }

          .ft-q-label {
            font-size: 13px;
            line-height: 1.45;
          }

          .ft-card-section {
            padding: 18px 14px;
          }

          .ft-card-divider {
            margin: 20px 0;
          }

          .ft-field-input {
            min-height: 48px;
            padding: 0 14px;
            font-size: 13px;
          }

          .ft-field-input::placeholder {
            font-size: 11px;
          }

          .ft-field-textarea {
            min-height: 88px;
            padding: 13px 14px;
          }

          .ft-chip-group {
            gap: 7px;
          }

          .ft-chip-label {
            min-height: 40px;
            padding: 9px 12px;
            font-size: 10.5px;
            line-height: 1.3;
          }

          .ft-form-submit-wrap {
            margin-top: 32px;
          }

          .ft-submit {
            min-height: 54px;
            padding: 16px 20px;
            font-size: clamp(16px, 4.8vw, 18px);
            letter-spacing: 0.03em;
          }

          .ft-submit-note {
            font-size: 11px;
            line-height: 1.6;
          }
        }
      `}</style>

      <div className="cursor" id="cursor" />

      <main className="ft-page">
        <div className="ft-shell">
          <div className="ft-form-header">
            <div className="ft-form-header-inner">
              <h1 className="ft-form-title">{page.headerTitle}</h1>
              <p className="ft-form-subtitle">{page.headerSubtitle}</p>
            </div>
          </div>

          <div className="ft-form-body">
            {page.sections.map((section) => {
              const sectionQuestions = section.questions.filter((question) => isVisible(question, answers));

              return (
                <Fragment key={section.id}>
                  <div className="ft-block-label">{section.title}</div>
                  <div className="ft-card-section">
                    {sectionQuestions.map((question, index) => (
                      <Fragment key={question.name}>
                        <div className="ft-question-block">
                          <div className="ft-q-label">
                            {question.label}
                            {question.required ? <span className="ft-required">*</span> : null}
                          </div>
                          <QuestionField
                            onChange={(nextValue) => setAnswer(question, nextValue)}
                            question={question}
                            value={answers[question.name]}
                          />
                        </div>
                        {index < sectionQuestions.length - 1 ? <div className="ft-card-divider" /> : null}
                      </Fragment>
                    ))}
                  </div>
                </Fragment>
              );
            })}

            <div className="ft-form-submit-wrap">
              <button className="ft-submit" disabled={effectivePhase === "processing"} onClick={handleSubmit} type="button">
                {page.submitLabel}
              </button>
              <p className="ft-submit-note">{page.legalNote}</p>
              {error ? <p className="ft-error">{error}</p> : null}
            </div>
          </div>
        </div>
      </main>

      {effectivePhase === "processing" ? (
        <div className="ft-processing-screen">
          <div className="ft-proc-logo">{page.processingLogo || "Give Me The Pitch"}</div>
          <div className="ft-proc-status">{page.processingMessages[effectiveProgressStep] ?? page.processingMessages[0] ?? ""}</div>
          <div className="ft-proc-dots">
            {page.processingMessages.map((message, index) => (
              <span className={`ft-proc-dot${index <= effectiveProgressStep ? " ft-proc-dot-active" : ""}`} key={`${message}-${index}`} />
            ))}
          </div>
        </div>
      ) : null}

      {effectivePhase === "confirm" ? (
        <div className="ft-confirm-screen">
          <div className="ft-confirm-signal">{page.confirmSignal || "un signal a ete cree"}</div>
          <h2 className="ft-confirm-title">{page.confirmTitle}</h2>
          <p className="ft-confirm-sub">{page.confirmSubtext}</p>
        </div>
      ) : null}
    </>
  );
}
