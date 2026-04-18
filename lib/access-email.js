const PAGE_BG = "#080808";
const MINT = "#c8f5e8";
const ROSE = "#f5c6d8";
const WHITE = "#ffffff";
const TEXT_SOFT = "#d9d9d9";
const MUTED = "#9aa0a6";
const FONT_STACK = "Arial, 'Helvetica Neue', 'Segoe UI', sans-serif";
const CARD_MAX_WIDTH = 640;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function encodeEmailText(value) {
  return Array.from(escapeHtml(value))
    .map((character) => {
      const codePoint = character.codePointAt(0) || 0;
      return codePoint > 127 ? `&#${codePoint};` : character;
    })
    .join("");
}

function formatFromAddress(from) {
  const trimmed = String(from || "").trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.includes("<")) {
    return trimmed;
  }

  return `GIVE ME THE PITCH <${trimmed}>`;
}

function extractEmailAddress(from) {
  const trimmed = String(from || "").trim();
  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/<([^>]+)>/);
  if (match?.[1]) {
    return match[1].trim();
  }

  return trimmed;
}

function normalizePlainText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getFirstName(fullName) {
  return String(fullName || "").trim().split(/\s+/)[0] || "";
}

function renderCopyParagraph(text, options = {}) {
  const {
    align = "left",
    color = WHITE,
    size = 16,
    lineHeight = 26,
    marginBottom = 18,
    uppercase = false,
    letterSpacing = 0,
    fontWeight = 400,
  } = options;

  return `<p style="margin:0 0 ${marginBottom}px;color:${color};font-family:${FONT_STACK};font-size:${size}px;line-height:${lineHeight}px;font-weight:${fontWeight};text-align:${align};${uppercase ? "text-transform:uppercase;" : ""}${letterSpacing ? `letter-spacing:${letterSpacing}em;` : ""}">${text}</p>`;
}

function renderDivider() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="${MINT}" style="height:1px;line-height:1px;font-size:1px;background:${MINT};">&nbsp;</td></tr></table>`;
}

function renderHeroTitle(text, options = {}) {
  const {
    size = 56,
    lineHeight = 0.9,
    align = "center",
    marginBottom = 18,
    color = WHITE,
  } = options;

  return `<p style="margin:0 0 ${marginBottom}px;color:${color};font-family:${FONT_STACK};font-size:${size}px;line-height:${Math.round(
    size * lineHeight
  )}px;font-weight:700;text-align:${align};letter-spacing:-0.04em;text-transform:uppercase;">${text}</p>`;
}

function renderButton({ href, label, background = ROSE, color = PAGE_BG }) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
      <tr>
        <td align="center" bgcolor="${background}" style="border-radius:999px;background:${background};">
          <a href="${escapeHtml(href)}" style="display:inline-block;min-width:188px;padding:16px 28px;border-radius:999px;background:${background};color:${color};font-family:${FONT_STACK};font-size:15px;line-height:15px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;text-align:center;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
  `;
}

function renderOutlinePill(text, options = {}) {
  const {
    borderColor = MINT,
    color = MINT,
    align = "center",
    fontSize = 11,
    letterSpacing = 0.14,
  } = options;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="${align === "center" ? "margin:0 auto;" : ""}">
      <tr>
        <td style="border:1px solid ${borderColor};border-radius:999px;padding:10px 14px;text-align:center;">
          <span style="display:inline-block;color:${color};font-family:${FONT_STACK};font-size:${fontSize}px;line-height:${Math.round(fontSize * 1.45)}px;font-weight:300;letter-spacing:${letterSpacing}em;text-transform:uppercase;">${text}</span>
        </td>
      </tr>
    </table>
  `;
}

function renderCodePill(code, options = {}) {
  const { align = "left" } = options;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="${align === "center" ? "margin:0 auto;" : "margin:0;"}">
      <tr>
        <td bgcolor="${MINT}" style="border-radius:999px;background:${MINT};padding:16px 24px;text-align:center;">
          <span style="display:inline-block;min-width:176px;color:${PAGE_BG};font-family:${FONT_STACK};font-size:15px;line-height:15px;font-weight:400;letter-spacing:0.26em;text-transform:uppercase;">${escapeHtml(code)}</span>
        </td>
      </tr>
    </table>
  `;
}

function renderPitchCard(paragraphs) {
  const safeParagraphs = paragraphs
    .filter(Boolean)
    .map((text, index, array) =>
      renderCopyParagraph(text, {
        size: 14,
        lineHeight: 22,
        marginBottom: index === array.length - 1 ? 0 : 12,
      })
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border:1px solid ${MINT};border-radius:20px;">
      <tr>
        <td style="padding:18px 18px 16px;border-radius:20px;background:${PAGE_BG};">
          ${safeParagraphs}
        </td>
      </tr>
    </table>
  `;
}

function renderVoteProjectCard(project) {
  const meta = [project.genre, project.format].filter(Boolean).join(" · ");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;border:1px solid ${MINT};border-radius:20px;">
      <tr>
        <td style="padding:18px 18px 16px;border-radius:20px;background:${PAGE_BG};">
          <p style="margin:0 0 6px;color:${WHITE};font-family:${FONT_STACK};font-size:20px;line-height:26px;font-weight:400;">${escapeHtml(
            project.title || ""
          )}</p>
          <p style="margin:0 0 12px;color:${MINT};font-family:${FONT_STACK};font-size:11px;line-height:18px;font-weight:300;letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(
            meta
          )}</p>
          <p style="margin:0 0 16px;color:${TEXT_SOFT};font-family:${FONT_STACK};font-size:14px;line-height:22px;font-weight:400;">${escapeHtml(
            project.shortPitch || ""
          )}</p>
          ${renderButton({ href: project.voteUrl, label: "JE VOTE", background: MINT, color: PAGE_BG })}
        </td>
      </tr>
    </table>
  `;
}

function renderEmailShell({ preheader, bodyContent }) {
  return `<!DOCTYPE html>
  <html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light only" />
      <title>GIVE ME THE PITCH</title>
      <style>
        body, table, td, a {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }

        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }

        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          display: block;
        }

        p {
          margin: 0;
        }
      </style>
    </head>
    <body style="margin:0;padding:0;width:100%;background:${PAGE_BG};background-color:${PAGE_BG};">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(
        preheader
      )}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE_BG}" style="width:100%;background:${PAGE_BG};background-color:${PAGE_BG};">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${MINT}" style="width:100%;max-width:${CARD_MAX_WIDTH}px;background:${MINT};background-color:${MINT};border-radius:28px;">
              <tr>
                <td style="padding:18px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE_BG}" style="width:100%;background:${PAGE_BG};background-color:${PAGE_BG};border:1px solid ${MINT};border-radius:18px;">
                    <tr>
                      <td style="padding:42px 28px 34px;font-family:${FONT_STACK};color:${WHITE};line-height:1.6;">
                        ${bodyContent}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function renderEmailFooter(label = "GIVE ME THE PITCH X THE ROOM") {
  return `
    ${renderDivider()}
    <div style="height:18px;line-height:18px;font-size:18px;">&nbsp;</div>
    <p style="margin:0;color:${MINT};font-family:${FONT_STACK};font-size:12px;line-height:18px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;text-align:center;">${escapeHtml(
      label
    )}</p>
  `;
}

function buildLaunchPitchCopy() {
  return [
    "Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.",
    "Où était-il pendant tout ce temps et pourquoi revient-il maintenant ? À mesure que l'enquête reprend, la ville se fracture : une partie cherche à comprendre, tandis qu'une autre veut reprendre le contrôle.",
    "Alors que tous cherchent à transformer l'inexplicable en récit, autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.",
  ];
}

export function buildAccessEmailHtml({ fullName, accessCode, keyaccessUrl }) {
  const firstName = encodeEmailText(getFirstName(fullName));

  const bodyContent = `
    ${renderOutlinePill("Votre accès personnel", {
      borderColor: MINT,
      color: MINT,
      align: "center",
      fontSize: 10,
      letterSpacing: 0.18,
    })}
    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderCopyParagraph("Voici votre clé d'accès personnelle.", {
      marginBottom: 22,
      align: "center",
    })}
    ${renderCodePill(accessCode, { align: "center" })}
    <div style="height:24px;line-height:24px;font-size:24px;">&nbsp;</div>
    ${renderCopyParagraph("Pour entrer dans THE ROOM, utilisez le bouton ci-dessous.", {
      size: 15,
      lineHeight: 24,
      marginBottom: 26,
      align: "center",
    })}
    ${renderButton({ href: keyaccessUrl, label: "ACCEDER" })}
    <div style="height:34px;line-height:34px;font-size:34px;">&nbsp;</div>
    ${renderEmailFooter()}
  `;

  return renderEmailShell({
    preheader: "Votre accès THE ROOM",
    bodyContent,
  });
}

export function buildAccessEmailText({ fullName, accessCode, keyaccessUrl }) {
  const firstName = getFirstName(fullName);

  return normalizePlainText(`
Bonjour ${firstName},

Voici votre clé d'accès personnelle.

${accessCode}

Pour entrer dans THE ROOM, utilisez le bouton ci-dessous.

ACCEDER : ${keyaccessUrl}

GIVE ME THE PITCH X THE ROOM
  `);
}

export function buildPanelLaunchStartReminderEmailHtml({ fullName, theRoomUrl }) {
  const firstName = encodeEmailText(getFirstName(fullName));

  const bodyContent = `
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderOutlinePill("Relance parcours", {
      borderColor: ROSE,
      color: ROSE,
      align: "left",
      fontSize: 10,
      letterSpacing: 0.18,
    })}
    <div style="height:18px;line-height:18px;font-size:18px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Vous n'avez pas encore commencé le parcours THE ROOM autour de MARÉE NOIRE. Tout est toujours prêt pour vous accueillir.",
      { marginBottom: 18 }
    )}
    ${renderPitchCard(buildLaunchPitchCopy())}
    <div style="height:18px;line-height:18px;font-size:18px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Le dossier complet est disponible en lecture et en audio. Le parcours se fait idéalement sur ordinateur et prend environ 30 minutes.",
      { marginBottom: 22 }
    )}
    ${renderButton({ href: theRoomUrl, label: "ENTRER DANS THE ROOM" })}
    <div style="height:34px;line-height:34px;font-size:34px;">&nbsp;</div>
    ${renderEmailFooter()}
  `;

  return renderEmailShell({
    preheader: "Relance THE ROOM - demarrer Marée Noire",
    bodyContent,
  });
}

export function buildPanelLaunchStartReminderEmailText({ fullName, theRoomUrl }) {
  const firstName = getFirstName(fullName);

  return normalizePlainText(`
Bonjour ${firstName},

Vous n'avez pas encore commencé le parcours THE ROOM autour de MARÉE NOIRE. Tout est toujours prêt pour vous accueillir.

Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.

Où était-il pendant tout ce temps et pourquoi revient-il maintenant ? À mesure que l'enquête reprend, la ville se fracture : une partie cherche à comprendre, tandis qu'une autre veut reprendre le contrôle.

Alors que tous cherchent à transformer l'inexplicable en récit, autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.

Le dossier complet est disponible en lecture et en audio. Le parcours se fait idéalement sur ordinateur et prend environ 30 minutes.

ENTRER DANS THE ROOM : ${theRoomUrl}
  `);
}

export function buildPanelLaunchAccessReminderEmailHtml({
  fullName,
  accessCode,
  keyaccessUrl,
  ndaAlreadySigned = false,
}) {
  const firstName = encodeEmailText(getFirstName(fullName));

  const bodyContent = `
    ${renderOutlinePill("Votre accès personnel", {
      borderColor: ROSE,
      color: ROSE,
      align: "center",
      fontSize: 10,
      letterSpacing: 0.18,
    })}
    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderCopyParagraph(
      "Vous pouvez reprendre votre parcours THE ROOM à tout moment avec votre clé personnelle ci-dessous.",
      { align: "center", marginBottom: 22 }
    )}
    ${renderCodePill(accessCode, { align: "center" })}
    <div style="height:18px;line-height:18px;font-size:18px;">&nbsp;</div>
    ${renderCopyParagraph(
      ndaAlreadySigned
        ? "Votre NDA est déjà validé. Une fois votre clé vérifiée, vous reprendrez directement le parcours."
        : "Une fois votre clé vérifiée, vous retrouverez votre parcours. Si le NDA n'a pas encore été signé, il s'affichera automatiquement.",
      { align: "center", size: 15, lineHeight: 24, marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Le dossier complet reste disponible en lecture et en audio.",
      { align: "center", size: 15, lineHeight: 24, marginBottom: 22 }
    )}
    ${renderButton({ href: keyaccessUrl, label: "REPRENDRE LE PARCOURS" })}
    <div style="height:34px;line-height:34px;font-size:34px;">&nbsp;</div>
    ${renderEmailFooter()}
  `;

  return renderEmailShell({
    preheader: "Relance THE ROOM - reprendre le parcours",
    bodyContent,
  });
}

export function buildPanelLaunchAccessReminderEmailText({
  fullName,
  accessCode,
  keyaccessUrl,
  ndaAlreadySigned = false,
}) {
  const firstName = getFirstName(fullName);

  return normalizePlainText(`
Bonjour ${firstName},

Vous pouvez reprendre votre parcours THE ROOM à tout moment avec votre clé personnelle :

${accessCode}

${
  ndaAlreadySigned
    ? "Votre NDA est déjà validé. Une fois votre clé vérifiée, vous reprendrez directement le parcours."
    : "Une fois votre clé vérifiée, vous retrouverez votre parcours. Si le NDA n'a pas encore été signé, il s'affichera automatiquement."
}

Le dossier complet reste disponible en lecture et en audio.

REPRENDRE LE PARCOURS : ${keyaccessUrl}
  `);
}

export function buildPanelLaunchEmailHtml({ fullName, theRoomUrl }) {
  const firstName = encodeEmailText(getFirstName(fullName));

  const bodyContent = `
    ${renderOutlinePill("Invitation de lancement", {
      borderColor: ROSE,
      color: ROSE,
      align: "center",
      fontSize: 10,
      letterSpacing: 0.18,
    })}
    <div style="height:22px;line-height:22px;font-size:22px;">&nbsp;</div>
    ${renderHeroTitle("Marée Noire", { size: 54, marginBottom: 12 })}
    ${renderCopyParagraph(
      `Bonjour ${firstName},`,
      { marginBottom: 14, align: "center", size: 18, lineHeight: 28 }
    )}
    ${renderCopyParagraph(
      "Votre lecture test est ouverte dans THE ROOM. Vous faites partie du tout premier cercle invité à découvrir le projet.",
      { marginBottom: 22, align: "center", size: 15, lineHeight: 24, color: TEXT_SOFT }
    )}
    ${renderPitchCard(buildLaunchPitchCopy())}
    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
    ${renderOutlinePill("Lecture + audio disponibles", {
      borderColor: MINT,
      color: MINT,
      align: "center",
      fontSize: 10,
      letterSpacing: 0.16,
    })}
    <div style="height:18px;line-height:18px;font-size:18px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Le dossier complet est disponible en lecture et en audio. Le parcours dure environ 30 minutes et se fait idéalement sur ordinateur.",
      { marginBottom: 16, align: "center", size: 15, lineHeight: 24 }
    )}
    ${renderCopyParagraph(
      "Il commence par un premier questionnaire sur vos habitudes de visionnage, se poursuit par la découverte de MARÉE NOIRE, puis s'achève par un second questionnaire consacré au projet.",
      { marginBottom: 18, align: "center", size: 15, lineHeight: 24, color: TEXT_SOFT }
    )}
    ${renderOutlinePill("Vous disposez de 7 jours pour tester Marée Noire.", {
      borderColor: MINT,
      color: MINT,
      align: "center",
    })}
    <div style="height:22px;line-height:22px;font-size:22px;">&nbsp;</div>
    ${renderButton({ href: theRoomUrl, label: "ENTRER DANS THE ROOM" })}
    <div style="height:34px;line-height:34px;font-size:34px;">&nbsp;</div>
    ${renderEmailFooter()}
  `;

  return renderEmailShell({
    preheader: "Invitation THE ROOM - Marée Noire",
    bodyContent,
  });
}

export function buildPanelLaunchEmailText({ fullName, theRoomUrl }) {
  const firstName = getFirstName(fullName);

  return normalizePlainText(`
Bonjour ${firstName},

Votre lecture test est ouverte dans THE ROOM. Vous faites partie du tout premier cercle invité à découvrir MARÉE NOIRE.

Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.

Où était-il pendant tout ce temps et pourquoi revient-il maintenant ? À mesure que l'enquête reprend, la ville se fracture : une partie cherche à comprendre, tandis qu'une autre veut reprendre le contrôle.

Alors que tous cherchent à transformer l'inexplicable en récit, autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.

Le dossier complet est disponible en lecture et en audio. Le parcours dure environ 30 minutes et se fait idéalement sur ordinateur.

Il commence par un premier questionnaire sur vos habitudes de visionnage, se poursuit par la découverte de MARÉE NOIRE, puis s'achève par un second questionnaire consacré au projet.

ENTRER DANS THE ROOM : ${theRoomUrl}
  `);
}

export function buildPanelCampaignClosingEmailHtml({ fullName, voteOptions = [] }) {
  const firstName = encodeEmailText(getFirstName(fullName));
  const projectCards = voteOptions.map((project) => renderVoteProjectCard(project)).join("");

  const bodyContent = `
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderCopyParagraph("La campagne autour de MARÉE NOIRE touche à sa fin.", {
      marginBottom: 18,
    })}
    ${renderCopyParagraph(
      "Merci d'avoir pris le temps de découvrir le dossier, de tester le parcours et de faire exister ce premier signal autour du projet.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Nous préparons déjà la suite. Si vous souhaitez nous aider à choisir le prochain pitch à mettre en lecture, vous pouvez voter ci-dessous.",
      { marginBottom: 22 }
    )}
    ${renderOutlinePill("Votre vote prend moins d'une minute.", {
      borderColor: ROSE,
      color: ROSE,
    })}
    <div style="height:22px;line-height:22px;font-size:22px;">&nbsp;</div>
    ${projectCards}
    <div style="height:28px;line-height:28px;font-size:28px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Nous reviendrons très vite vers vous avec la prochaine session THE ROOM.",
      { size: 15, lineHeight: 24, color: TEXT_SOFT, marginBottom: 30, align: "center" }
    )}
    ${renderEmailFooter("GIVE ME THE PITCH")}
  `;

  return renderEmailShell({
    preheader: "Cloture de campagne - vote pour le prochain pitch",
    bodyContent,
  });
}

export function buildPanelCampaignClosingEmailText({ fullName, voteOptions = [] }) {
  const firstName = getFirstName(fullName);
  const voteLines = voteOptions.length
    ? voteOptions
        .map((project) => `${project.title} : ${project.voteUrl}`)
        .join("\n\n")
    : "Le vote sera bientôt disponible.";

  return normalizePlainText(`
Bonjour ${firstName},

La campagne autour de MARÉE NOIRE touche à sa fin.

Merci d'avoir pris le temps de découvrir le dossier, de tester le parcours et de faire exister ce premier signal autour du projet.

Nous préparons déjà la suite. Si vous souhaitez nous aider à choisir le prochain pitch à mettre en lecture, vous pouvez voter ci-dessous.

${voteLines}

Nous reviendrons très vite vers vous avec la prochaine session THE ROOM.
  `);
}

async function sendResendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      sent: false,
      provider: "none",
      reason: "missing_resend_env",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "gmtp-site/1.0",
    },
    body: JSON.stringify({
      from: formatFromAddress(from),
      reply_to: extractEmailAddress(from) || undefined,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error ${response.status}: ${body}`);
  }

  return {
    sent: true,
    provider: "resend",
  };
}

export async function sendAccessEmail({ to, fullName, accessCode, keyaccessUrl }) {
  return sendResendEmail({
    to,
    subject: "Votre accès THE ROOM",
    html: buildAccessEmailHtml({ fullName, accessCode, keyaccessUrl }),
    text: buildAccessEmailText({ fullName, accessCode, keyaccessUrl }),
  });
}

export async function sendPanelLaunchInviteEmail({ to, fullName, theRoomUrl }) {
  return sendResendEmail({
    to,
    subject: "GIVE ME THE PITCH X THE ROOM - Marée Noire",
    html: buildPanelLaunchEmailHtml({ fullName, theRoomUrl }),
    text: buildPanelLaunchEmailText({ fullName, theRoomUrl }),
  });
}

export async function sendPanelLaunchStartReminderEmail({ to, fullName, theRoomUrl }) {
  return sendResendEmail({
    to,
    subject: "Rappel - GIVE ME THE PITCH X THE ROOM - Marée Noire",
    html: buildPanelLaunchStartReminderEmailHtml({ fullName, theRoomUrl }),
    text: buildPanelLaunchStartReminderEmailText({ fullName, theRoomUrl }),
  });
}

export async function sendPanelLaunchAccessReminderEmail({
  to,
  fullName,
  accessCode,
  keyaccessUrl,
  ndaAlreadySigned = false,
}) {
  return sendResendEmail({
    to,
    subject: "Relance - reprendre votre acces THE ROOM",
    html: buildPanelLaunchAccessReminderEmailHtml({
      fullName,
      accessCode,
      keyaccessUrl,
      ndaAlreadySigned,
    }),
    text: buildPanelLaunchAccessReminderEmailText({
      fullName,
      accessCode,
      keyaccessUrl,
      ndaAlreadySigned,
    }),
  });
}

export async function sendPanelCampaignClosingEmail({ to, fullName, voteOptions = [] }) {
  return sendResendEmail({
    to,
    subject: "Cloture de campagne - vote pour le prochain pitch",
    html: buildPanelCampaignClosingEmailHtml({ fullName, voteOptions }),
    text: buildPanelCampaignClosingEmailText({ fullName, voteOptions }),
  });
}
