"use client";

import { useEffect, useMemo } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

function getInputLabel(input) {
  return input?.closest("label")?.querySelector(".chip-label")?.textContent?.trim() || input?.value || "";
}

function collectFormAnswers() {
  const answers = {};

  document.querySelectorAll("input[name], textarea[name], select[name]").forEach((field) => {
    const key = field.name;
    if (!key) {
      return;
    }

    if (field.type === "radio") {
      if (!field.checked) {
        return;
      }
      answers[key] = field.value || getInputLabel(field);
      return;
    }

    if (field.type === "checkbox") {
      if (!field.checked) {
        return;
      }
      const currentValue = field.value || getInputLabel(field);
      answers[key] = Array.isArray(answers[key])
        ? [...answers[key], currentValue]
        : answers[key]
          ? [answers[key], currentValue]
          : [currentValue];
      return;
    }

    if (field.value?.trim()) {
      answers[key] = field.value.trim();
    }
  });

  return answers;
}

function hasMissingRequiredAnswers() {
  const requiredFields = Array.from(document.querySelectorAll("input[required], textarea[required], select[required]"));

  return requiredFields.some((field) => {
    if (field.type === "radio") {
      return !document.querySelector(`input[name="${field.name}"]:checked`);
    }
    if (field.type === "checkbox") {
      return !field.checked;
    }
    return !field.value?.trim();
  });
}

export default function FormtestPageClient({ styles, bodyHtml }) {
  useDesktopCursor({
    hoverSelector: "button, label, select, input, textarea",
    spotlightSelector: ".btn-pill",
  });

  useEffect(() => {
    const emotionInputs = document.querySelectorAll('input[name="emotion"]');
    const emotionCond = document.getElementById("cond-emotion");
    const roomInputs = document.querySelectorAll('input[name="room_suffisant"]');
    const roomCond = document.getElementById("cond-suffisant");
    const submitButton = document.getElementById("btn-submit");
    const processing = document.getElementById("processing");
    const confirm = document.getElementById("confirm");
    const status = document.getElementById("procMsg");
    const dots = ["pp1", "pp2", "pp3", "pp4", "pp5"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const messages = [
      "Anonymisation en cours...",
      "Consolidation du panel...",
      "Analyse des dimensions...",
      "Scoring en cours...",
      "Restitution en préparation...",
    ];
    let cleanupTimeouts = [];
    let cleanupInterval = null;
    let isSubmitting = false;

    const handleEmotionChange = (event) => {
      if (!emotionCond) {
        return;
      }
      if (event.target.id === "emotion-autre") {
        emotionCond.classList.add("visible");
      } else {
        emotionCond.classList.remove("visible");
      }
    };

    const handleRoomChange = (event) => {
      if (!roomCond) {
        return;
      }
      if (event.target.value === "non") {
        roomCond.classList.add("visible");
      } else {
        roomCond.classList.remove("visible");
      }
    };

    const handleSubmit = async () => {
      if (isSubmitting || !processing || !confirm) {
        return;
      }

      if (hasMissingRequiredAnswers()) {
        window.alert("Merci de renseigner tous les champs obligatoires avant de soumettre.");
        return;
      }

      isSubmitting = true;
      submitButton && (submitButton.disabled = true);
      processing.classList.add("visible");
      window.scrollTo({ top: 0, behavior: "smooth" });
      dots.forEach((dot) => dot.classList.remove("lit"));
      if (status) {
        status.textContent = messages[0];
      }

      const submittedAccessCode = window.sessionStorage?.getItem("gmtp_access_code") || "";

      const requestPromise = fetch("/api/tests/submit", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode: submittedAccessCode,
          answers: collectFormAnswers(),
        }),
      }).then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.detail || result.error || "test_submit_failed");
        }
        return result;
      });

      let requestSucceeded = false;
      requestPromise
        .then(() => {
          requestSucceeded = true;
        })
        .catch(() => {
          requestSucceeded = false;
        });

      let index = 0;
      cleanupInterval = window.setInterval(() => {
        if (dots[index]) {
          dots[index].classList.add("lit");
        }
        if (status) {
          status.textContent = messages[index] || "";
        }
        index += 1;

        if (index >= dots.length) {
          window.clearInterval(cleanupInterval);
          cleanupInterval = null;
          const timeoutA = window.setTimeout(async () => {
            try {
              await requestPromise;
              const timeoutB = window.setTimeout(() => {
                processing.classList.remove("visible");
                confirm.classList.add("visible");
              }, 400);
              cleanupTimeouts.push(timeoutB);
            } catch (error) {
              processing.classList.remove("visible");
              isSubmitting = false;
              submitButton && (submitButton.disabled = false);
              const message = error instanceof Error ? error.message : "test_submit_failed";
              setDebugInfo((current) => ({ ...current, lastError: message }));
              window.alert(`Une erreur est survenue pendant l'envoi du questionnaire.\n${message}`);
            }
          }, 400);
          cleanupTimeouts.push(timeoutA);
        }
      }, 520);
    };

    emotionInputs.forEach((input) => input.addEventListener("change", handleEmotionChange));
    roomInputs.forEach((input) => input.addEventListener("change", handleRoomChange));
    submitButton?.addEventListener("click", handleSubmit);

    return () => {
      emotionInputs.forEach((input) => input.removeEventListener("change", handleEmotionChange));
      roomInputs.forEach((input) => input.removeEventListener("change", handleRoomChange));
      submitButton?.removeEventListener("click", handleSubmit);
      if (cleanupInterval) {
        window.clearInterval(cleanupInterval);
      }
      cleanupTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const styleNodes = useMemo(
    () => styles.map((style, index) => (
      <style
        key={`formtest-style-${index}`}
        dangerouslySetInnerHTML={{ __html: style }}
      />
    )),
    [styles]
  );

  return (
    <>
      {styleNodes}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
