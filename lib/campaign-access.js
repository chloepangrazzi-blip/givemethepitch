export const SIGNAL_SESSION_CLOSED_TITLE = "Room 01 — session clôturée";
export const SIGNAL_SESSION_CLOSED_TEXT =
  "La première phase de test de Marée Noire est maintenant terminée. Une nouvelle session ouvrira prochainement.";
export const SIGNAL_SESSION_CLOSED_CTA_LABEL = "Retour à The Room";
export const SIGNAL_SESSION_CLOSED_CTA_HREF = "/theroom";
export const SIGNAL_SESSION_CLOSED_MESSAGE = "Cette session de test est clôturée.";

function resolveCampaignStatus(candidate) {
  if (candidate && typeof candidate === "object") {
    return String(candidate.campaignStatus || candidate.status || "")
      .trim()
      .toLowerCase();
  }

  return String(candidate || "").trim().toLowerCase();
}

export function isCampaignActiveStatus(candidate) {
  return resolveCampaignStatus(candidate) === "active";
}

export function getCampaignAccessError(candidate) {
  return resolveCampaignStatus(candidate) === "frozen"
    ? "campaign_frozen"
    : "campaign_not_active";
}

export function isSessionClosedErrorCode(code) {
  return code === "campaign_frozen" || code === "campaign_not_active";
}

export function assertCampaignIsActive(candidate) {
  if (isCampaignActiveStatus(candidate)) {
    return;
  }

  throw new Error(getCampaignAccessError(candidate));
}

export function getSignalSessionClosedState() {
  return {
    title: SIGNAL_SESSION_CLOSED_TITLE,
    text: SIGNAL_SESSION_CLOSED_TEXT,
    ctaLabel: SIGNAL_SESSION_CLOSED_CTA_LABEL,
    ctaHref: SIGNAL_SESSION_CLOSED_CTA_HREF,
  };
}

