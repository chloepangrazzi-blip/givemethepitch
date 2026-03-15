"use client";

import { useEffect, useMemo } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

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
      "",
    ];
    let cleanupTimeouts = [];
    let cleanupInterval = null;

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

    const handleSubmit = () => {
      if (!processing || !confirm) {
        return;
      }

      processing.classList.add("visible");
      window.scrollTo({ top: 0, behavior: "smooth" });
      dots.forEach((dot) => dot.classList.remove("lit"));
      if (status) {
        status.textContent = messages[0];
      }

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
          const timeoutA = window.setTimeout(() => {
            const timeoutB = window.setTimeout(() => {
              processing.classList.remove("visible");
              confirm.classList.add("visible");
            }, 400);
            cleanupTimeouts.push(timeoutB);
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
