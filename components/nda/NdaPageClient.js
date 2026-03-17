"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

export default function NdaPageClient({ styles, bodyHtml }) {
  const [showError, setShowError] = useState(false);
  const timeoutRef = useRef(null);

  useDesktopCursor({
    hoverSelector: "button, label, input",
    spotlightSelector: ".btn-pill",
  });

  useEffect(() => {
    const root = document.getElementById("nda-root");
    if (!root) {
      return undefined;
    }

    const prenomInput = root.querySelector("#sigPrenom");
    const nomInput = root.querySelector("#sigNom");
    const consentInput = root.querySelector("#ndaConsent");
    const submitButton = root.querySelector(".btn-pill");

    const flashError = () => {
      setShowError(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => setShowError(false), 3000);
    };

    const submit = async () => {
      const prenom = prenomInput?.value.trim() ?? "";
      const nom = nomInput?.value.trim() ?? "";
      const consent = Boolean(consentInput?.checked);

      if (!prenom || !nom || !consent) {
        flashError();
        return;
      }

      try {
        const response = await fetch("/api/nda/sign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prenom, nom, consent }),
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.error || "nda_sign_failed");
        }

        window.location.href = result.nextPath || "/mareenoire";
      } catch (error) {
        flashError();
      }
    };

    const handleEnter = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    };

    prenomInput?.addEventListener("keydown", handleEnter);
    nomInput?.addEventListener("keydown", handleEnter);
    submitButton?.addEventListener("click", submit);

    return () => {
      prenomInput?.removeEventListener("keydown", handleEnter);
      nomInput?.removeEventListener("keydown", handleEnter);
      submitButton?.removeEventListener("click", submit);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const root = document.getElementById("nda-root");
    const errorHint = root?.querySelector("#errorHint");
    if (errorHint) {
      errorHint.classList.toggle("visible", showError);
    }
  }, [showError]);

  const styleNodes = useMemo(
    () => styles.map((style, index) => (
      <style
        key={`nda-style-${index}`}
        dangerouslySetInnerHTML={{ __html: style }}
      />
    )),
    [styles]
  );

  return (
    <>
      {styleNodes}
      <style>{`
        .field-input {
          caret-color: var(--white) !important;
        }
      `}</style>
      <div id="nda-root" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
