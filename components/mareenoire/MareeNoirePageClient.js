"use client";

import { useEffect, useMemo } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

export default function MareeNoirePageClient({ styles, bodyHtml }) {
  useDesktopCursor({
    hoverSelector: "button, a, label, select, input, textarea",
    spotlightSelector: "",
  });

  useEffect(() => {
    const overlay = document.getElementById("teaserOverlay");
    const video = document.getElementById("teaserVideo");

    if (!overlay || !video) {
      return undefined;
    }

    const source = video.querySelector("source");
    const isMobile = window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window;

    if (source) {
      const wantedSrc = isMobile
        ? source.getAttribute("data-mobile-src")
        : source.getAttribute("data-desktop-src");

      if (wantedSrc && source.getAttribute("src") !== wantedSrc) {
        source.setAttribute("src", wantedSrc);
        video.load();
      }
    }

    const startVideo = (event) => {
      if (event) {
        event.preventDefault();
      }
      video.setAttribute("controls", "controls");
      overlay.classList.add("playing");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          overlay.classList.remove("playing");
        });
      }
    };

    const handlePlay = () => overlay.classList.add("playing");
    const handleEnded = () => overlay.classList.remove("playing");
    const handlePause = () => {
      if (!video.ended) {
        overlay.classList.remove("playing");
      }
    };

    overlay.addEventListener("click", startVideo);
    overlay.addEventListener("touchend", startVideo, { passive: false });
    video.addEventListener("play", handlePlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);

    const readyButton = document.getElementById("btn");
    const goToFormtest = () => {
      window.location.href = "/formtest";
    };

    readyButton?.addEventListener("click", goToFormtest);

    if (window.innerWidth <= 768) {
      document.querySelectorAll('div[style*="height:80px"]').forEach((element) => {
        element.style.height = "16px";
      });
    }

    return () => {
      overlay.removeEventListener("click", startVideo);
      overlay.removeEventListener("touchend", startVideo);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
      readyButton?.removeEventListener("click", goToFormtest);
    };
  }, []);

  const styleNodes = useMemo(
    () => styles.map((style, index) => (
      <style
        key={`mareenoire-style-${index}`}
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
