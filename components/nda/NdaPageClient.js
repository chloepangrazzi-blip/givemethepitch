"use client";

import { useEffect, useMemo, useRef } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

export default function NdaPageClient({ styles, bodyHtml }) {
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
    const errorHint = root.querySelector("#errorHint");

    if (!prenomInput || !nomInput || !consentInput || !submitButton || !errorHint) {
      return undefined;
    }

    submitButton.removeAttribute("onclick");
    submitButton.setAttribute("type", "button");

    let isSubmitting = false;

    const clearError = () => {
      errorHint.classList.remove("visible");
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const flashError = () => {
      errorHint.classList.add("visible");
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        errorHint.classList.remove("visible");
        timeoutRef.current = null;
      }, 3000);
    };

    const submit = async (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();

      if (isSubmitting) {
        return;
      }

      const prenom = prenomInput.value.trim();
      const nom = nomInput.value.trim();
      const consent = Boolean(consentInput.checked);

      if (!prenom || !nom || !consent) {
        flashError();
        return;
      }

      clearError();
      isSubmitting = true;
      submitButton.disabled = true;

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
        isSubmitting = false;
        submitButton.disabled = false;
        flashError();
      }
    };

    const handleEnter = (event) => {
      if (event.key === "Enter") {
        submit(event);
      }
    };

    const handleInput = () => {
      if (errorHint.classList.contains("visible")) {
        clearError();
      }
    };

    prenomInput.addEventListener("keydown", handleEnter);
    nomInput.addEventListener("keydown", handleEnter);
    prenomInput.addEventListener("input", handleInput);
    nomInput.addEventListener("input", handleInput);
    consentInput.addEventListener("change", handleInput);
    submitButton.addEventListener("click", submit);

    return () => {
      prenomInput.removeEventListener("keydown", handleEnter);
      nomInput.removeEventListener("keydown", handleEnter);
      prenomInput.removeEventListener("input", handleInput);
      nomInput.removeEventListener("input", handleInput);
      consentInput.removeEventListener("change", handleInput);
      submitButton.removeEventListener("click", submit);
      clearError();
    };
  }, []);

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
