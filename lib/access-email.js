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
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderCopyParagraph("Voici votre clé d'accès personnelle.", { marginBottom: 26 })}
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

export function buildPanelLaunchEmailHtml({ fullName, theRoomUrl }) {
  const firstName = encodeEmailText(getFirstName(fullName));

  const bodyContent = `
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderOutlinePill("Invitation de lancement", {
      borderColor: ROSE,
      color: ROSE,
      align: "left",
      fontSize: 10,
      letterSpacing: 0.18,
    })}
    <div style="height:18px;line-height:18px;font-size:18px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Vous faites partie des premières personnes inscrites à GIVE ME THE PITCH. Merci de faire partie de ce premier cercle : votre présence ici et votre soutien sont précieux.",
      { size: 15, lineHeight: 24, marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Vous êtes aujourd'hui invité·e à découvrir le premier projet original mis en ligne sur la plateforme. Il s'agit de MARÉE NOIRE, un thriller fantastique dont voici le pitch.",
      { marginBottom: 18 }
    )}
    ${renderPitchCard(buildLaunchPitchCopy())}
    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Aujourd'hui, les plateformes savent presque tout de nos usages, mais beaucoup moins bien ce qu'un projet provoque lorsqu'il est encore en développement.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Give Me The Pitch a été pensé pour ouvrir les portes de cette phase à celles et ceux qui regardent les séries.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Le parcours dure environ 30 minutes. Il débute par un premier questionnaire consacré à vos habitudes de visionnage, se poursuit par la lecture de MARÉE NOIRE, puis s'achève par un second questionnaire sur le projet.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Pour un meilleur confort de lecture et de navigation, il est vivement recommandé d'effectuer ce parcours sur un ordinateur.",
      { marginBottom: 22 }
    )}
    ${renderOutlinePill("Vous disposez de 7 jours pour tester Marée Noire.")}
    <div style="height:22px;line-height:22px;font-size:22px;">&nbsp;</div>
    ${renderButton({ href: theRoomUrl, label: "ACCEDER" })}
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

Vous faites partie des premières personnes inscrites à GIVE ME THE PITCH. Merci de faire partie de ce premier cercle : votre présence ici et votre soutien sont précieux.

Vous êtes aujourd'hui invité·e à découvrir le premier projet original mis en ligne sur la plateforme. Il s'agit de MARÉE NOIRE, un thriller fantastique dont voici le pitch.

Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.

Où était-il pendant tout ce temps et pourquoi revient-il maintenant ? À mesure que l'enquête reprend, la ville se fracture : une partie cherche à comprendre, tandis qu'une autre veut reprendre le contrôle.

Alors que tous cherchent à transformer l'inexplicable en récit, autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.

Aujourd'hui, les plateformes savent presque tout de nos usages, mais beaucoup moins bien ce qu'un projet provoque lorsqu'il est encore en développement.

Give Me The Pitch a été pensé pour ouvrir les portes de cette phase à celles et ceux qui regardent les séries.

Le parcours dure environ 30 minutes. Il débute par un premier questionnaire consacré à vos habitudes de visionnage, se poursuit par la lecture de MARÉE NOIRE, puis s'achève par un second questionnaire sur le projet.

Pour un meilleur confort de lecture et de navigation, il est vivement recommandé d'effectuer ce parcours sur un ordinateur.

ACCEDER : ${theRoomUrl}
  `);
}

export function buildPanelLaunchReminderEmailHtml({ fullName, theRoomUrl }) {
  const firstName = encodeEmailText(getFirstName(fullName));

  const bodyContent = `
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderCopyParagraph("Petit rappel : votre accès à THE ROOM est toujours actif.", {
      marginBottom: 18,
    })}
    ${renderCopyParagraph(
      "Si vous n'avez pas encore terminé le parcours autour de MARÉE NOIRE, vous pouvez reprendre exactement là où vous en étiez.",
      { marginBottom: 18 }
    )}
    ${renderPitchCard(buildLaunchPitchCopy())}
    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Le dossier complet et les deux questionnaires prennent environ 30 minutes. Pour un meilleur confort, nous vous recommandons de poursuivre la lecture sur ordinateur.",
      { marginBottom: 22 }
    )}
    ${renderOutlinePill("Votre accès personnel reste inchangé.", {
      borderColor: ROSE,
      color: ROSE,
    })}
    <div style="height:22px;line-height:22px;font-size:22px;">&nbsp;</div>
    ${renderButton({ href: theRoomUrl, label: "REPRENDRE LE PARCOURS" })}
    <div style="height:34px;line-height:34px;font-size:34px;">&nbsp;</div>
    ${renderEmailFooter()}
  `;

  return renderEmailShell({
    preheader: "Rappel THE ROOM - Marée Noire",
    bodyContent,
  });
}

export function buildPanelLaunchReminderEmailText({ fullName, theRoomUrl }) {
  const firstName = getFirstName(fullName);

  return normalizePlainText(`
Bonjour ${firstName},

Petit rappel : votre accès à THE ROOM est toujours actif.

Si vous n'avez pas encore terminé le parcours autour de MARÉE NOIRE, vous pouvez reprendre exactement là où vous en étiez.

Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.

Où était-il pendant tout ce temps et pourquoi revient-il maintenant ? À mesure que l'enquête reprend, la ville se fracture : une partie cherche à comprendre, tandis qu'une autre veut reprendre le contrôle.

Alors que tous cherchent à transformer l'inexplicable en récit, autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.

Le dossier complet et les deux questionnaires prennent environ 30 minutes. Pour un meilleur confort, nous vous recommandons de poursuivre la lecture sur ordinateur.

REPRENDRE LE PARCOURS : ${theRoomUrl}
  `);
}

export function buildPanelCampaignClosingEmailHtml({ fullName, voteUrl }) {
  const firstName = encodeEmailText(getFirstName(fullName));

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
    ${renderButton({ href: voteUrl, label: "VOTER POUR LE PROCHAIN PITCH" })}
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

export function buildPanelCampaignClosingEmailText({ fullName, voteUrl }) {
  const firstName = getFirstName(fullName);

  return normalizePlainText(`
Bonjour ${firstName},

La campagne autour de MARÉE NOIRE touche à sa fin.

Merci d'avoir pris le temps de découvrir le dossier, de tester le parcours et de faire exister ce premier signal autour du projet.

Nous préparons déjà la suite. Si vous souhaitez nous aider à choisir le prochain pitch à mettre en lecture, vous pouvez voter ci-dessous.

VOTER POUR LE PROCHAIN PITCH : ${voteUrl}

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

export async function sendPanelLaunchReminderEmail({ to, fullName, theRoomUrl }) {
  return sendResendEmail({
    to,
    subject: "Rappel - GIVE ME THE PITCH X THE ROOM - Marée Noire",
    html: buildPanelLaunchReminderEmailHtml({ fullName, theRoomUrl }),
    text: buildPanelLaunchReminderEmailText({ fullName, theRoomUrl }),
  });
}

export async function sendPanelCampaignClosingEmail({ to, fullName, voteUrl }) {
  return sendResendEmail({
    to,
    subject: "Cloture de campagne - vote pour le prochain pitch",
    html: buildPanelCampaignClosingEmailHtml({ fullName, voteUrl }),
    text: buildPanelCampaignClosingEmailText({ fullName, voteUrl }),
  });
}
