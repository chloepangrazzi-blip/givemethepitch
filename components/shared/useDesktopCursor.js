"use client";

import { useEffect } from "react";

export default function useDesktopCursor(options = {}) {
  const {
    hoverSelector = "button, a, label, select, input, textarea",
    pointerSelector = "",
    hoverClass = "hovering",
    pointerClass = "pointer",
    spotlightSelector = ".btn-pill",
  } = options;

  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (!cursor || isCoarsePointer) {
      if (cursor) {
        cursor.style.display = "none";
      }
      return undefined;
    }

    const handleMouseMove = (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    };

    const handlePointerOver = (event) => {
      if (hoverSelector && event.target.closest(hoverSelector)) {
        cursor.classList.add(hoverClass);
      }
      if (pointerSelector && event.target.closest(pointerSelector)) {
        cursor.classList.add(pointerClass);
      }
    };

    const handlePointerOut = (event) => {
      if (hoverSelector && event.target.closest(hoverSelector)) {
        cursor.classList.remove(hoverClass);
      }
      if (pointerSelector && event.target.closest(pointerSelector)) {
        cursor.classList.remove(pointerClass);
      }
    };

    const handleSpotlight = (event) => {
      if (!spotlightSelector) {
        return;
      }

      const target = event.target.closest(spotlightSelector);
      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
      target.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("mousemove", handleSpotlight);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("mousemove", handleSpotlight);
    };
  }, [hoverClass, hoverSelector, pointerClass, pointerSelector, spotlightSelector]);
}
