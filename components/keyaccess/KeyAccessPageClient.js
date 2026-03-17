"use client";

import { useMemo, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

export default function KeyAccessPageClient({ styles }) {
  const [accessKey, setAccessKey] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useDesktopCursor({
    hoverSelector: "button",
    spotlightSelector: ".btn-enter, .btn-session",
  });

  const styleNodes = useMemo(
    () => styles.map((style, index) => (
      <style
        key={`keyaccess-style-${index}`}
        dangerouslySetInnerHTML={{ __html: style }}
      />
    )),
    [styles]
  );

  const checkKey = async () => {
    if (isLoading) {
      return;
    }

    if (!accessKey.trim()) {
      setShowError(false);
      window.requestAnimationFrame(() => {
        setShowError(true);
        window.setTimeout(() => setShowError(false), 2500);
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/access/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessCode: accessKey }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "invalid_code");
      }

      setShowError(false);
      setHasAccess(true);
    } catch (error) {
      setShowError(false);
      window.requestAnimationFrame(() => {
        setShowError(true);
        window.setTimeout(() => setShowError(false), 2500);
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {styleNodes}
      <style>{`
        html, body {
          background: var(--black) !important;
          overflow: hidden !important;
        }

        body::after {
          content: "";
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: env(safe-area-inset-bottom, 0px);
          background: var(--black) !important;
          z-index: 119;
          pointer-events: none;
        }

        nav {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          height: 52px !important;
          min-height: 52px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          z-index: 120 !important;
        }

        .bottom-bar {
          display: block !important;
          position: fixed !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 !important;
          margin: 0 !important;
          z-index: 120 !important;
        }

        .canvas {
          position: fixed !important;
          top: 52px !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 52px !important;
          min-height: auto !important;
          margin: 0 !important;
          padding: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .access-form,
        .welcome-screen {
          width: min(340px, 88vw) !important;
          margin: 0 auto !important;
        }

        .access-input {
          caret-color: var(--white) !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        }

        .access-input::-webkit-credentials-auto-fill-button,
        .access-input::-webkit-contacts-auto-fill-button,
        .access-input::-webkit-caps-lock-indicator {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          position: absolute !important;
          right: 0 !important;
        }

        .btn-enter[disabled] {
          opacity: 0.92 !important;
          transform: none !important;
        }

        @media (max-width: 768px) {
          .canvas {
            padding: 24px 20px !important;
          }
        }
      `}</style>      <div className="cursor" id="cursor" />

      <nav>
        <div className="gmtp-logo">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="8" height="8" rx="2.4" fill="#080808" />
            <rect x="12" y="1" width="8" height="8" rx="2.4" fill="#080808" />
            <rect x="23" y="1" width="8" height="8" rx="2.4" fill="#080808" />
            <rect x="1" y="12" width="8" height="8" rx="2.4" fill="#080808" />
            <rect x="12" y="12" width="8" height="8" rx="2.4" fill="#080808" />
            <rect x="23" y="12" width="8" height="8" rx="2.4" fill="#080808" />
            <rect x="1" y="23" width="8" height="8" rx="2.4" fill="#080808" />
            <rect x="12" y="23" width="8" height="8" rx="2.4" fill="#080808" />
            <rect x="23" y="23" width="8" height="8" rx="2.4" fill="#080808" />
          </svg>
        </div>
      </nav>

      <div className="canvas">
        <div
          className="access-form"
          id="accessForm"
          style={{
            opacity: hasAccess ? 0 : 1,
            transform: hasAccess ? "translateY(-10px)" : "translateY(0)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            pointerEvents: hasAccess ? "none" : "all",
          }}
        >
          <input
            className={`access-input${showError ? " shake" : ""}`}
            id="accessInput"
            type="password"
            placeholder="access key"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                checkKey();
              }
            }}
          />
          <button className="btn-enter" id="btnEnter" type="button" onClick={checkKey} disabled={isLoading}>
            enter
          </button>
          <div className={`error-msg${showError ? " visible" : ""}`} id="errorMsg">
            cle incorrecte - reessayez
          </div>
        </div>

        <div className={`welcome-screen${hasAccess ? " visible" : ""}`} id="welcomeScreen">
          <div className="welcome-title">welcome inside</div>
          <button
            className="btn-session"
            id="btnSession"
            type="button"
            onClick={() => {
              window.location.href = "/nda";
            }}
          >
            session 01
          </button>
        </div>
      </div>

      <div className="bottom-bar" />
    </>
  );
}
