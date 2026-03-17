"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import useDesktopCursor from "../shared/useDesktopCursor";

const HtmlSection = memo(function HtmlSection({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
});

function getChipLabel(input) {
  return input?.closest("label")?.querySelector(".chip-label")?.textContent?.trim() || input?.value || "";
}

function getCheckedRadioLabel(root, name) {
  const input = root.querySelector(`input[name="${name}"]:checked`);
  return getChipLabel(input);
}

function getCheckedLabelsInGroup(group) {
  if (!group) {
    return [];
  }

  return Array.from(group.querySelectorAll('input[type="checkbox"]:checked'))
    .map((input) => getChipLabel(input))
    .filter(Boolean);
}

function collectJoinTheRoomPayload() {
  const formRoot = document.getElementById("page-form");

  if (!formRoot) {
    return null;
  }

  const identityInputs = formRoot.querySelectorAll(".form-row .field-input");
  const fullName = identityInputs[0]?.value.trim() || "";
  const email = identityInputs[1]?.value.trim() || "";
  const mobile = identityInputs[2]?.value.trim() || "";
  const city = identityInputs[3]?.value.trim() || "";
  const consent = Boolean(formRoot.querySelector("#consent")?.checked);

  const cardSections = formRoot.querySelectorAll(".card-section");
  const habitsSection = cardSections[0];
  const tastesSection = cardSections[1];

  const habitsGroups = habitsSection?.querySelectorAll(".chip-group") || [];
  const tastesGroups = tastesSection?.querySelectorAll(".chip-group") || [];
  const tastesTextareas = tastesSection?.querySelectorAll("textarea.field-input") || [];

  const panelProfile = {
    ageBand: getCheckedRadioLabel(formRoot, "age"),
    viewingFrequency: getCheckedRadioLabel(formRoot, "freq"),
    platforms: [
      ...getCheckedLabelsInGroup(habitsGroups[2]),
      ...getCheckedLabelsInGroup(habitsGroups[4]),
      ...getCheckedLabelsInGroup(habitsGroups[6]),
    ].filter(Boolean),
    likedGenres: getCheckedLabelsInGroup(tastesGroups[0]),
    mainGenre: getCheckedRadioLabel(formRoot, "genre_favori"),
    frenchSeriesPerception: getCheckedRadioLabel(formRoot, "fr_quality"),
    frenchSeriesReason: getCheckedRadioLabel(formRoot, "fr_raison"),
    recommendationFrequency: getCheckedRadioLabel(formRoot, "prescripteur"),
  };

  const answers = {
    age_band: panelProfile.ageBand,
    viewing_frequency: panelProfile.viewingFrequency,
    streaming_subscription: getCheckedRadioLabel(formRoot, "platforms_yn"),
    streaming_platforms: getCheckedLabelsInGroup(habitsGroups[2]),
    tv_series_watching: getCheckedRadioLabel(formRoot, "tv_yn"),
    tv_channels: getCheckedLabelsInGroup(habitsGroups[4]),
    replay_series_watching: getCheckedRadioLabel(formRoot, "replay_yn"),
    replay_platforms: getCheckedLabelsInGroup(habitsGroups[6]),
    liked_genres: panelProfile.likedGenres,
    main_genre: panelProfile.mainGenre,
    origin_preference: getCheckedRadioLabel(formRoot, "origin"),
    origin_preference_reason: tastesTextareas[0]?.value.trim() || "",
    french_series_perception: panelProfile.frenchSeriesPerception,
    french_series_reason_primary: panelProfile.frenchSeriesReason,
    french_series_reason_detail: tastesTextareas[1]?.value.trim() || "",
    recommendation_frequency: panelProfile.recommendationFrequency,
  };

  return {
    fullName,
    email,
    mobile,
    city,
    consent,
    answers,
    panelProfile,
  };
}

export default function TheRoomPageClient({ styles, navHtml, landingHtml, aboutHtml, formHtml }) {
  const [view, setView] = useState("landing");
  const [requestState, setRequestState] = useState(null);
  const submitRef = useRef(async () => {});

  useDesktopCursor({
    hoverSelector: "button, a, label, select, input, textarea",
    spotlightSelector: ".btn-pill",
  });

  submitRef.current = async () => {
    const payload = collectJoinTheRoomPayload();

    if (!payload || !payload.fullName || !payload.email || !payload.mobile || !payload.city || !payload.consent) {
      setRequestState({
        type: "error",
        title: "Formulaire incomplet",
        body: "Merci de renseigner nom, email, mobile, ville et d'accepter le consentement.",
      });
      return;
    }

    const submitButton = document.querySelector("#page-form .form-submit-wrap .btn-pill");
    if (submitButton) {
      submitButton.textContent = "ENVOI...";
    }

    setRequestState({
      type: "preview",
      title: "Envoi en cours",
      body: "Preparation de votre access key...",
    });

    try {
      const response = await fetch("/api/access/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "request_failed");
      }

      if (submitButton) {
        submitButton.textContent = "VOTRE CLE D'ACCES EST ENVOYEE SUR VOTRE MAIL";
        submitButton.style.background = "var(--black)";
        submitButton.style.color = "var(--mint)";
        submitButton.style.border = "1px solid var(--mint)";
        submitButton.style.padding = "18px 40px";
        submitButton.style.fontFamily = "'Poppins', sans-serif";
        submitButton.style.fontWeight = "100";
        submitButton.style.fontSize = "13px";
        submitButton.style.letterSpacing = "0.08em";
        submitButton.style.transform = "none";
        submitButton.disabled = true;
      }

      setRequestState({
        type: "success",
        title: "Candidature envoyee",
        body: "Votre cle d'acces est envoyee sur votre mail.",
      });
    } catch (error) {
      if (submitButton) {
        submitButton.textContent = "JOIN THE ROOM";
        submitButton.disabled = false;
      }

      setRequestState({
        type: "error",
        title: "Envoi impossible",
        body: "Le formulaire n'a pas pu etre enregistre. Verifie les cles Supabase puis reessaie.",
      });
    }
  };

  useEffect(() => {
    window.showAbout = () => {
      setView("about");
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    window.showForm = () => {
      setView("form");
      setRequestState(null);
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    window.submitForm = () => submitRef.current();

    return () => {
      delete window.showAbout;
      delete window.showForm;
      delete window.submitForm;
    };
  }, []);

  useEffect(() => {
    const enterButton = document.querySelector("#page-landing .btn-enter");
    const aboutJoinButton = document.querySelector("#page-about .closing-cta .btn-pill");
    const formJoinButton = document.querySelector("#page-form .form-submit-wrap .btn-pill");

    const handleEnter = (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.showAbout?.();
    };

    const handleAboutJoin = (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.showForm?.();
    };

    const handleFormJoin = (event) => {
      event.preventDefault();
      event.stopPropagation();
      submitRef.current();
    };

    if (enterButton) {
      enterButton.onclick = handleEnter;
      enterButton.addEventListener("click", handleEnter);
    }

    if (aboutJoinButton) {
      aboutJoinButton.onclick = handleAboutJoin;
      aboutJoinButton.addEventListener("click", handleAboutJoin);
    }

    if (formJoinButton) {
      formJoinButton.onclick = handleFormJoin;
      formJoinButton.type = "button";
      formJoinButton.addEventListener("click", handleFormJoin);
    }

    return () => {
      if (enterButton) {
        enterButton.removeEventListener("click", handleEnter);
      }
      if (aboutJoinButton) {
        aboutJoinButton.removeEventListener("click", handleAboutJoin);
      }
      if (formJoinButton) {
        formJoinButton.removeEventListener("click", handleFormJoin);
      }
    };
  }, [view]);

  const currentHtml = useMemo(() => {
    if (view === "about") {
      return aboutHtml;
    }
    if (view === "form") {
      return formHtml;
    }
    return landingHtml;
  }, [aboutHtml, formHtml, landingHtml, view]);

  return (
    <>
      {styles.map((style, index) => (
        <style
          key={`theroom-style-${index}`}
          dangerouslySetInnerHTML={{ __html: style }}
        />
      ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .request-feedback {
          max-width: 720px;
          margin: 28px auto 0;
          padding: 22px 24px;
          border: 1px solid rgba(200,245,232,0.35);
          border-radius: 24px;
          background: rgba(200,245,232,0.06);
          color: #fff;
        }
        .request-feedback.is-error {
          border-color: rgba(245,198,216,0.55);
          background: rgba(245,198,216,0.08);
        }
        .request-feedback-title {
          color: var(--mint);
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .request-feedback.is-error .request-feedback-title {
          color: var(--pink);
        }
        .request-feedback-body {
          font-family: 'Poppins', sans-serif;
          font-weight: 100;
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 14px;
        }
      `,
        }}
      />

      <div className="cursor" id="cursor" />
      <div dangerouslySetInnerHTML={{ __html: navHtml }} />
      <HtmlSection html={currentHtml} />

      {view === "form" && requestState ? (
        <div className={`request-feedback${requestState.type === "error" ? " is-error" : ""}`}>
          <div className="request-feedback-title">{requestState.title}</div>
          <div className="request-feedback-body">{requestState.body}</div>
        </div>
      ) : null}
    </>
  );
}
