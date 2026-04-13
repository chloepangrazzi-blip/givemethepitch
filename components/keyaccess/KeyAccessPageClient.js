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
          min-height: 100vh;
          padding: 32px 20px 72px;
        }

        .ka-shell {
          width: min(1360px, 100%);
          margin: 0 auto;
        }

        .ka-stage {
          min-height: calc(100vh - 64px);
          border: 1px solid var(--ka-line-mint);
          border-radius: 34px;
          overflow: hidden;
          background: var(--ka-card);
          display: grid;
          grid-template-rows: 62px 1fr 62px;
        }

        .ka-rail {
          background: var(--ka-mint);
        }

        .ka-main {
          display: grid;
          place-items: center;
          padding: clamp(28px, 6vw, 72px);
          background: #000000;
        }

        .ka-content {
          width: min(1200px, 100%);
          display: grid;
          justify-items: center;
          gap: 22px;
        }

        .ka-title {
          margin: 0;
          color: #ffffff;
          font-family: var(--ka-display);
          font-size: clamp(4.2rem, 13vw, 11rem);
          line-height: 0.88;
          letter-spacing: 0.01em;
          text-align: center;
        }

        .ka-eyebrow {
          margin: -6px 0 8px;
          color: var(--ka-mint);
          font-size: 0.76rem;
          font-weight: 100;
          letter-spacing: 0.26em;
          text-transform: uppercase;
        }

        .ka-form {
          width: min(760px, 100%);
          display: grid;
          justify-items: center;
          gap: 18px;
        }

        .ka-input-shell {
          width: min(266px, 100%);
          min-height: 80px;
          border: 1.5px solid rgba(200, 245, 232, 0.62);
          border-radius: 999px;
          background: rgba(200, 245, 232, 0.1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .ka-input {
          width: 100%;
          min-height: 80px;
          padding: 0 22px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: var(--ka-mint);
          font-family: var(--ka-sans);
          font-size: 1.12rem;
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
          min-width: 266px;
          min-height: 80px;
          padding: 0 34px;
          border: none;
          border-radius: 999px;
          background: var(--ka-mint);
          color: #000000;
          font-family: var(--ka-sans);
          font-size: 1.38rem;
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
          min-height: 20px;
          margin: 0;
          color: var(--ka-rose);
          font-size: 0.78rem;
          font-weight: 300;
          letter-spacing: 0.08em;
          text-transform: uppercase;
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

        @media (max-width: 760px) {
          .ka-page {
            padding: 18px 14px 56px;
          }

          .ka-stage {
            min-height: calc(100vh - 74px);
            grid-template-rows: 52px 1fr 52px;
            border-radius: 28px;
          }

          .ka-title {
            font-size: clamp(3.1rem, 18vw, 6.4rem);
          }

          .ka-input {
            width: 100%;
            min-height: 68px;
            padding: 0 18px;
            font-size: 0.9rem;
          }

          .ka-input-shell {
            min-width: 220px;
            min-height: 68px;
          }

          .ka-enter {
            min-width: 220px;
            min-height: 68px;
            font-size: 1.14rem;
          }

          .cursor {
            display: none;
          }
        }

        @media (max-width: 320px) {
          .ka-page {
            min-height: 100svh;
            padding: 12px 10px;
            display: flex;
            align-items: center;
          }

          .ka-shell {
            width: 100%;
          }

          .ka-stage {
            min-height: calc(100svh - 24px);
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
