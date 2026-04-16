"use client";

import { useEffect, useRef, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function normalizeAccessCode(value) {
  return String(value || "").trim().toUpperCase();
}

export default function KeyAccessPageClient({
  nextPath = "/nda",
  pageTitle = "THE ROOM",
  eyebrow = "ideas begin with you",
  placeholder = "access key",
  submitLabel = "enter",
  loadingLabel = "verification...",
  errorLabel = "clé incorrecte - réessaie",
}) {
  const [accessKey, setAccessKey] = useState("");
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasAutoSubmitted = useRef(false);

  useDesktopCursor({
    hoverSelector: "button, input",
    spotlightSelector: ".ka-enter, .ka-input-shell",
  });

  const flashError = () => {
    setShowError(false);
    window.requestAnimationFrame(() => {
      setShowError(true);
      window.setTimeout(() => setShowError(false), 2500);
    });
  };

  const verifyKey = async (rawCode) => {
    if (isLoading) {
      return false;
    }

    const normalizedCode = normalizeAccessCode(rawCode);

    if (!normalizedCode) {
      flashError();
      return false;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/access/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessCode: normalizedCode }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "invalid_code");
      }

      window.sessionStorage?.setItem("gmtp_access_code", normalizedCode);
      window.sessionStorage?.removeItem("gmtp_access_code_prefill");
      setShowError(false);
      window.location.href = nextPath;
      return true;
    } catch {
      flashError();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkKey = async () => {
    await verifyKey(accessKey);
  };

  useEffect(() => {
    if (typeof window === "undefined" || hasAutoSubmitted.current) {
      return;
    }

    const codeFromUrl = normalizeAccessCode(new URL(window.location.href).searchParams.get("code"));
    const storedCode = normalizeAccessCode(window.sessionStorage?.getItem("gmtp_access_code_prefill"));
    const resolvedCode = codeFromUrl || storedCode;

    if (!resolvedCode) {
      return;
    }

    hasAutoSubmitted.current = true;
    setAccessKey(resolvedCode);
    window.sessionStorage?.setItem("gmtp_access_code_prefill", resolvedCode);

    if (codeFromUrl) {
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    void verifyKey(resolvedCode);
  }, []);

  return (
    <>
      <style>{`
        :root {
          --ka-bg: #000000;
          --ka-card: #070707;
          --ka-line-mint: rgba(191, 248, 220, 0.28);
          --ka-text: #ffffff;
          --ka-mint: #c8f5e8;
          --ka-rose: #f5c6d8;
          --ka-sans: "Poppins", "Avenir Next", "Avenir", "Helvetica Neue", "Segoe UI", sans-serif;
          --ka-display: "Made Soulmaze", "Poppins", sans-serif;
        }

        html,
        body {
          margin: 0;
          background: var(--ka-bg);
          color: var(--ka-text);
          font-family: var(--ka-sans);
          cursor: none;
        }

        * {
          box-sizing: border-box;
        }

        .ka-page,
        .ka-page * {
          cursor: none !important;
        }

        .cursor {
          position: fixed;
          width: 14px;
          height: 14px;
          background: var(--ka-mint);
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

        .ka-page {
          --ka-viewport-pad-y: clamp(10px, 2.4vh, 32px);
          --ka-viewport-pad-x: clamp(12px, 2.4vw, 24px);
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--ka-viewport-pad-y) var(--ka-viewport-pad-x);
          overflow: hidden;
        }

        .ka-shell {
          width: min(1360px, 100%);
          margin: 0 auto;
        }

        .ka-stage {
          min-height: 0;
          height: min(calc(100svh - (var(--ka-viewport-pad-y) * 2)), 980px);
          max-height: 100%;
          width: 100%;
          border: 1px solid var(--ka-line-mint);
          border-radius: 34px;
          overflow: hidden;
          background: var(--ka-card);
          display: grid;
          grid-template-rows: clamp(34px, 6.2vh, 62px) minmax(0, 1fr) clamp(34px, 6.2vh, 62px);
        }

        .ka-rail {
          display: block;
          background: var(--ka-mint);
        }

        .ka-main {
          min-height: 0;
          display: grid;
          place-items: center;
          padding: clamp(22px, 4vh, 60px) clamp(16px, 3.2vw, 48px);
          background: #000000;
        }

        .ka-content {
          width: min(980px, 100%);
          display: grid;
          justify-items: center;
          align-content: center;
          gap: clamp(10px, 2.2vh, 24px);
          text-align: center;
        }

        .ka-title {
          margin: 0;
          color: #ffffff;
          font-family: var(--ka-display);
          font-size: clamp(2.8rem, min(12vw, 11.2vmin), 11rem);
          line-height: 0.88;
          letter-spacing: 0.01em;
          text-align: center;
          white-space: nowrap;
        }

        .ka-eyebrow {
          margin: -2px 0 2px;
          color: var(--ka-mint);
          font-family: var(--ka-sans);
          font-size: clamp(0.58rem, min(1.2vw, 1.55vmin), 0.76rem);
          font-weight: 100;
          letter-spacing: clamp(0.14em, 0.38vw, 0.26em);
          text-transform: uppercase;
        }

        .ka-form {
          width: min(760px, 100%);
          display: grid;
          justify-items: center;
          gap: clamp(10px, 1.8vh, 16px);
        }

        .ka-input-shell {
          width: min(244px, 78vw);
          min-height: clamp(50px, 6.6vmin, 72px);
          border: 1.5px solid rgba(200, 245, 232, 0.62);
          border-radius: 999px;
          background: rgba(200, 245, 232, 0.08);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .ka-input {
          width: 100%;
          min-height: clamp(50px, 6.6vmin, 72px);
          padding: 0 20px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: var(--ka-mint);
          font-family: var(--ka-sans);
          font-size: clamp(0.88rem, min(1.55vw, 1.7vmin), 1rem);
          font-weight: 300;
          letter-spacing: 0.12em;
          text-align: center;
          text-transform: lowercase;
          outline: none;
          caret-color: var(--ka-mint);
        }

        .ka-input::placeholder {
          color: rgba(200, 245, 232, 0.68);
          letter-spacing: 0.16em;
          text-transform: lowercase;
        }

        .ka-input-shake {
          animation: ka-shake 0.35s linear;
        }

        .ka-enter {
          width: min(244px, 78vw);
          min-width: 0;
          min-height: clamp(50px, 6.6vmin, 72px);
          padding: 0 clamp(18px, 2.4vw, 28px);
          border: none;
          border-radius: 999px;
          background: var(--ka-mint);
          color: #000000;
          font-family: var(--ka-sans);
          font-size: clamp(0.94rem, min(1.85vw, 2vmin), 1.18rem);
          font-weight: 300;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }

        .ka-enter:hover {
          transform: translateY(-2px);
          background: #d4ffee;
          box-shadow: 0 16px 30px rgba(191, 248, 220, 0.18);
        }

        .ka-enter:disabled {
          opacity: 0.65;
        }

        .ka-error {
          min-height: 18px;
          margin: 0;
          color: var(--ka-rose);
          font-family: var(--ka-sans);
          font-size: clamp(0.56rem, min(0.92vw, 1.1vmin), 0.72rem);
          font-weight: 100;
          letter-spacing: 0.12em;
          line-height: 1.25;
          text-transform: uppercase;
          text-align: center;
          opacity: 0;
          transition: opacity 160ms ease;
        }

        .ka-error-visible {
          opacity: 1;
        }

        @keyframes ka-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        @media (max-height: 620px) {
          .ka-page {
            --ka-viewport-pad-y: clamp(8px, 2vh, 16px);
          }

          .ka-stage {
            grid-template-rows: clamp(28px, 5.8vh, 44px) minmax(0, 1fr) clamp(28px, 5.8vh, 44px);
          }

          .ka-main {
            padding: clamp(8px, 2vh, 18px) clamp(12px, 3vw, 28px);
          }

          .ka-title {
            font-size: clamp(2.4rem, min(10vw, 9.8vmin), 4.8rem);
          }

          .ka-input,
          .ka-input-shell,
          .ka-enter {
            min-height: clamp(48px, 6.8vmin, 60px);
          }

          .ka-enter {
            font-size: clamp(0.92rem, min(2vw, 2.1vmin), 1.08rem);
          }
        }

        @media (max-height: 460px) and (orientation: landscape) {
          .ka-stage {
            grid-template-rows: 24px minmax(0, 1fr) 24px;
          }

          .ka-content {
            gap: 6px;
          }

          .ka-title {
            font-size: clamp(2rem, min(8vw, 8.8vmin), 3.8rem);
          }

          .ka-eyebrow {
            font-size: clamp(0.5rem, min(0.9vw, 1.1vmin), 0.64rem);
          }

          .ka-form {
            gap: 6px;
          }

          .ka-error {
            font-size: 0.54rem;
          }
        }

        @media (max-width: 900px) and (orientation: portrait) {
          .ka-page {
            --ka-viewport-pad-y: clamp(10px, 2.2vh, 24px);
            --ka-viewport-pad-x: clamp(12px, 3.8vw, 24px);
            --ka-stage-width: clamp(272px, 76vw, 420px);
            --ka-shell-radius: clamp(34px, 8vw, 42px);
            --ka-rail-height: clamp(34px, 5.4vh, 48px);
            --ka-center-pad-y: clamp(52px, 9.4vh, 82px);
            --ka-center-pad-x: clamp(12px, 2.8vw, 20px);
            --ka-title-size: clamp(2.1rem, 8.2vw, 3.8rem);
            --ka-eyebrow-size: clamp(0.54rem, 0.92vw, 0.68rem);
            --ka-control-width: min(252px, 74vw);
            --ka-control-height: clamp(50px, 7vh, 60px);
            --ka-error-size: clamp(0.54rem, 0.82vw, 0.64rem);
          }

          .ka-shell {
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .ka-stage {
            width: min(var(--ka-stage-width), calc(100vw - (var(--ka-viewport-pad-x) * 2)));
            min-height: 0;
            height: auto;
            max-height: calc(100svh - (var(--ka-viewport-pad-y) * 2));
            border: none;
            border-radius: var(--ka-shell-radius);
            background: transparent;
            overflow: hidden;
            grid-template-rows: auto auto auto;
            row-gap: 0;
          }

          .ka-rail {
            width: 100%;
            height: var(--ka-rail-height);
            justify-self: center;
          }

          .ka-main {
            min-height: 0;
            height: auto;
            box-shadow:
              inset 1px 0 0 var(--ka-line-mint),
              inset -1px 0 0 var(--ka-line-mint);
            padding: var(--ka-center-pad-y) var(--ka-center-pad-x);
            margin: 0;
          }

          .ka-content {
            width: 100%;
            gap: clamp(10px, 1.8vh, 16px);
          }

          .ka-title {
            width: 100%;
            font-size: min(
              var(--ka-title-size),
              calc((var(--ka-stage-width) - (var(--ka-center-pad-x) * 2) - 24px) / 4.6)
            );
            line-height: 0.88;
          }

          .ka-eyebrow {
            margin: -4px 0 0;
            font-size: var(--ka-eyebrow-size);
            letter-spacing: clamp(0.16em, 0.28vw, 0.24em);
          }

          .ka-form {
            width: 100%;
            gap: clamp(8px, 1.5vh, 12px);
          }

          .ka-input-shell,
          .ka-enter {
            width: var(--ka-control-width);
            min-height: var(--ka-control-height);
          }

          .ka-input {
            min-height: var(--ka-control-height);
            padding: 0 clamp(16px, 3.4vw, 24px);
            font-size: clamp(0.88rem, 1.6vw, 1rem);
          }

          .ka-enter {
            font-size: clamp(0.98rem, 1.8vw, 1.12rem);
          }

          .ka-error {
            font-size: var(--ka-error-size);
            white-space: nowrap;
          }
        }

        @media (max-width: 520px) and (orientation: portrait) {
          .ka-page {
            --ka-stage-width: clamp(264px, 82vw, 330px);
            --ka-shell-radius: clamp(30px, 8.6vw, 36px);
            --ka-rail-height: clamp(28px, 4.6vh, 38px);
            --ka-center-pad-y: clamp(46px, 8.2vh, 64px);
            --ka-center-pad-x: clamp(10px, 3vw, 16px);
            --ka-title-size: clamp(1.9rem, 8.8vw, 3.2rem);
            --ka-eyebrow-size: clamp(0.5rem, 0.86vw, 0.62rem);
            --ka-control-width: min(236px, 80vw);
            --ka-control-height: clamp(48px, 6vh, 54px);
            --ka-error-size: clamp(0.5rem, 0.8vw, 0.6rem);
          }

          .ka-content {
            gap: 10px;
          }
        }

        @media (max-height: 760px) and (max-width: 900px) and (orientation: portrait) {
          .ka-page {
            --ka-center-pad-y: clamp(40px, 6.8vh, 56px);
            --ka-rail-height: clamp(24px, 4.2vh, 38px);
          }
        }

        @media (max-width: 760px) {
          .cursor {
            display: none;
          }
        }
      `}</style>

      <div className="cursor" id="cursor" />

      <main className="ka-page">
        <div className="ka-shell">
          <section className="ka-stage">
            <div className="ka-rail" />
            <div className="ka-main">
              <div className="ka-content">
                <h1 className="ka-title">{pageTitle}</h1>
                <p className="ka-eyebrow">{eyebrow}</p>

                <div className="ka-form">
                  <div className="ka-input-shell">
                    <input
                      autoCapitalize="characters"
                      autoComplete="off"
                      autoCorrect="off"
                      className={`ka-input${showError ? " ka-input-shake" : ""}`}
                      onChange={(event) => setAccessKey(event.target.value.toUpperCase())}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          checkKey();
                        }
                      }}
                      placeholder={placeholder}
                      spellCheck={false}
                      type="password"
                      value={accessKey}
                    />
                  </div>
                  <button className="ka-enter" disabled={isLoading} onClick={checkKey} type="button">
                    {isLoading ? loadingLabel : submitLabel}
                  </button>
                  <p className={`ka-error${showError ? " ka-error-visible" : ""}`}>{errorLabel}</p>
                </div>
              </div>
            </div>
            <div className="ka-rail" />
          </section>
        </div>
      </main>
    </>
  );
}
