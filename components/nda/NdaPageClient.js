"use client";

import { useEffect, useMemo, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

export default function NdaPageClient({ styles, bodyHtml }) {
  const [form, setForm] = useState({ prenom: "", nom: "", consent: false });
  const [showError, setShowError] = useState(false);

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

    if (prenomInput) prenomInput.value = form.prenom;
    if (nomInput) nomInput.value = form.nom;
    if (consentInput) consentInput.checked = form.consent;
    if (errorHint) {
      errorHint.classList.toggle("visible", showError);
    }

    const syncForm = () => {
      setForm({
        prenom: prenomInput?.value ?? "",
        nom: nomInput?.value ?? "",
        consent: Boolean(consentInput?.checked),
      });
    };

    const submit = async () => {
      const prenom = prenomInput?.value.trim() ?? "";
      const nom = nomInput?.value.trim() ?? "";
      const consent = Boolean(consentInput?.checked);

      if (!prenom || !nom || !consent) {
        setShowError(true);
        window.setTimeout(() => setShowError(false), 3000);
        return;
      }

      try {
        const response = await fetch('/api/nda/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prenom, nom, consent }),
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'nda_sign_failed');
        }

        window.location.href = result.nextPath || '/mareenoire';
      } catch (error) {
        setShowError(true);
        window.setTimeout(() => setShowError(false), 3000);
      }
    };

    prenomInput?.addEventListener("input", syncForm);
    nomInput?.addEventListener("input", syncForm);
    consentInput?.addEventListener("change", syncForm);
    submitButton?.addEventListener("click", submit);

    return () => {
      prenomInput?.removeEventListener("input", syncForm);
      nomInput?.removeEventListener("input", syncForm);
      consentInput?.removeEventListener("change", syncForm);
      submitButton?.removeEventListener("click", submit);
    };
  }, [form.consent, form.nom, form.prenom, showError]);

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
      <div id="nda-root" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
