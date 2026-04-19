const PAGE_BG = "#080808";
const MINT = "#c8f5e8";
const ROSE = "#f5c6d8";
const WHITE = "#ffffff";
const TEXT_SOFT = "#d9d9d9";
const MUTED = "#9aa0a6";
const FONT_STACK = "Arial, 'Helvetica Neue', 'Segoe UI', sans-serif";
const CARD_MAX_WIDTH = 640;

function solidBackgroundStyles(color) {
  return `background:${color};background-color:${color};background-image:linear-gradient(${color},${color});`;
}

function solidTextStyles(color) {
  return `color:${color};-webkit-text-fill-color:${color};`;
}

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

function replaceEmailLocalPart(from, nextLocalPart) {
  const email = extractEmailAddress(from);
  if (!email || !nextLocalPart || !email.includes("@")) {
    return from;
  }

  const [, domain] = email.split("@");
  if (!domain) {
    return from;
  }

  return `${nextLocalPart}@${domain}`;
}

function buildCampaignHeaders({ unsubscribeUrl, entityRefId }) {
  const headers = {};

  if (unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  if (entityRefId) {
    headers["X-Entity-Ref-ID"] = entityRefId;
  }

  return headers;
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

  return `<p style="margin:0 0 ${marginBottom}px;${solidTextStyles(
    color
  )};font-family:${FONT_STACK};font-size:${size}px;line-height:${lineHeight}px;font-weight:${fontWeight};text-align:${align};${uppercase ? "text-transform:uppercase;" : ""}${letterSpacing ? `letter-spacing:${letterSpacing}em;` : ""}">${text}</p>`;
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

  return `<p style="margin:0 0 ${marginBottom}px;${solidTextStyles(
    color
  )};font-family:${FONT_STACK};font-size:${size}px;line-height:${Math.round(
    size * lineHeight
  )}px;font-weight:700;text-align:${align};letter-spacing:-0.04em;text-transform:uppercase;">${text}</p>`;
}

function renderButton({ href, label, background = ROSE, color = PAGE_BG }) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:separate;border-spacing:0;">
      <tr>
        <td align="center" bgcolor="${background}" style="${solidBackgroundStyles(
          background
        )}border-radius:999px;overflow:hidden;">
          <a href="${escapeHtml(href)}" style="display:inline-block;min-width:188px;padding:16px 28px;border-radius:999px;${solidBackgroundStyles(
            background
          )}${solidTextStyles(
            color
          )};font-family:${FONT_STACK};font-size:15px;line-height:15px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;text-align:center;">${escapeHtml(
    label
  )}</a>
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
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="${align === "center" ? "margin:0 auto;" : ""}border-collapse:separate;border-spacing:0;">
      <tr>
        <td bgcolor="${PAGE_BG}" style="${solidBackgroundStyles(
          PAGE_BG
        )}border:1px solid ${borderColor};border-radius:999px;padding:12px 18px;text-align:center;overflow:hidden;">
          <span style="display:inline-block;${solidTextStyles(
            color
          )};font-family:${FONT_STACK};font-size:${fontSize}px;line-height:${Math.round(fontSize * 1.45)}px;font-weight:300;letter-spacing:${letterSpacing}em;text-transform:uppercase;">${text}</span>
        </td>
      </tr>
    </table>
  `;
}

function renderCodePill(code, options = {}) {
  const { align = "left" } = options;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="${align === "center" ? "margin:0 auto;" : "margin:0;"}border-collapse:separate;border-spacing:0;">
      <tr>
        <td bgcolor="${MINT}" style="${solidBackgroundStyles(
          MINT
        )}border-radius:999px;padding:16px 24px;text-align:center;overflow:hidden;">
          <span style="display:inline-block;min-width:176px;${solidTextStyles(
            PAGE_BG
          )};font-family:${FONT_STACK};font-size:15px;line-height:15px;font-weight:400;letter-spacing:0.26em;text-transform:uppercase;">${escapeHtml(
    code
  )}</span>
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
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;border-spacing:0;">
      <tr>
        <td bgcolor="${PAGE_BG}" style="${solidBackgroundStyles(
          PAGE_BG
        )}border:1px solid ${MINT};border-radius:24px;padding:18px 18px 16px;overflow:hidden;">
          ${safeParagraphs}
        </td>
      </tr>
    </table>
  `;
}

function renderVoteProjectCard(project) {
  const meta = [project.genre, project.format].filter(Boolean).join(" · ");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;border-collapse:separate;border-spacing:0;">
      <tr>
        <td bgcolor="${PAGE_BG}" style="${solidBackgroundStyles(
          PAGE_BG
        )}border:1px solid ${ROSE};border-radius:24px;padding:18px 18px 16px;overflow:hidden;">
          <p style="margin:0 0 6px;${solidTextStyles(
            WHITE
          )};font-family:${FONT_STACK};font-size:20px;line-height:26px;font-weight:400;">${escapeHtml(
            project.title || ""
          )}</p>
          <p style="margin:0 0 12px;${solidTextStyles(
            MINT
          )};font-family:${FONT_STACK};font-size:11px;line-height:18px;font-weight:300;letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(
            meta
          )}</p>
          <p style="margin:0 0 16px;${solidTextStyles(
            TEXT_SOFT
          )};font-family:${FONT_STACK};font-size:14px;line-height:22px;font-weight:400;">${escapeHtml(
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
          border-collapse: separate;
          border-spacing: 0;
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
    <body style="margin:0;padding:0;width:100%;${solidBackgroundStyles(PAGE_BG)}">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(
        preheader
      )}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE_BG}" style="width:100%;${solidBackgroundStyles(
        PAGE_BG
      )}">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${CARD_MAX_WIDTH}px;border-collapse:separate;border-spacing:0;">
              <tr>
                <td bgcolor="${MINT}" style="${solidBackgroundStyles(
                  MINT
                )}border-radius:28px;padding:18px;overflow:hidden;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;">
                    <tr>
                      <td bgcolor="${PAGE_BG}" style="${solidBackgroundStyles(
                        PAGE_BG
                      )}border:1px solid ${MINT};border-radius:18px;padding:42px 28px 34px;font-family:${FONT_STACK};${solidTextStyles(
    WHITE
  )};line-height:1.6;overflow:hidden;">
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
    <p style="margin:0;${solidTextStyles(
      MINT
    )};font-family:${FONT_STACK};font-size:12px;line-height:18px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;text-align:center;">${escapeHtml(
      label
    )}</p>
  `;
}

function buildLaunchPitchCopy() {
  return [
    "Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.",
    "Où était-il pendant tout ce temps ? Pourquoi revient-il maintenant ? Tandis que l'enquête reprend, la ville se fissure : certain·es cherchent à comprendre, d'autres à reprendre le contrôle, d'autres encore à donner une forme à l'inexplicable.",
    "Autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.",
  ];
}

export function buildAccessEmailHtml({ fullName, accessCode, keyaccessUrl }) {
  const firstName = encodeEmailText(getFirstName(fullName));

  const bodyContent = `
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
    ${renderCopyParagraph(
      "Vous n'avez pas encore commencé le parcours THE ROOM autour de la série MARÉE NOIRE. Tout est toujours prêt pour vous accueillir.",
      { marginBottom: 18 }
    )}
    ${renderPitchCard(buildLaunchPitchCopy())}
    <div style="height:18px;line-height:18px;font-size:18px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Le dossier complet est disponible en lecture et en audio. Le parcours se fait idéalement sur ordinateur et prend environ 30 minutes.",
      { marginBottom: 22 }
    )}
    ${renderOutlinePill("Il vous reste 48h pour tester Marée Noire", {
      borderColor: ROSE,
      color: ROSE,
      align: "center",
    })}
    <div style="height:22px;line-height:22px;font-size:22px;">&nbsp;</div>
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

Vous n'avez pas encore commencé le parcours THE ROOM autour de la série MARÉE NOIRE. Tout est toujours prêt pour vous accueillir.

Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.

Où était-il pendant tout ce temps et pourquoi revient-il maintenant ? À mesure que l'enquête reprend, la ville se fracture : une partie cherche à comprendre, tandis qu'une autre veut reprendre le contrôle.

Alors que tous cherchent à transformer l'inexplicable en récit, autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.

Le dossier complet est disponible en lecture et en audio. Le parcours se fait idéalement sur ordinateur et prend environ 30 minutes.

Il vous reste 48h pour tester Marée Noire.

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
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderCopyParagraph(
      "La campagne autour du projet MARÉE NOIRE touche à sa fin. Vous pouvez reprendre votre parcours THE ROOM à tout moment avec votre clé personnelle ci-dessous.",
      { marginBottom: 22 }
    )}
    ${renderCodePill(accessCode, { align: "center" })}
    <div style="height:22px;line-height:22px;font-size:22px;">&nbsp;</div>
    ${renderOutlinePill("Il vous reste 48h pour tester Marée Noire", {
      borderColor: ROSE,
      color: ROSE,
      align: "center",
    })}
    <div style="height:22px;line-height:22px;font-size:22px;">&nbsp;</div>
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

La campagne autour du projet MARÉE NOIRE touche à sa fin. Vous pouvez reprendre votre parcours THE ROOM à tout moment avec votre clé personnelle ci-dessous.

${accessCode}

Il vous reste 48h pour tester Marée Noire.

REPRENDRE LE PARCOURS : ${keyaccessUrl}
  `);
}

export function buildPanelLaunchEmailHtml({ fullName, theRoomUrl }) {
  const firstName = encodeEmailText(getFirstName(fullName));

  const bodyContent = `
    ${renderCopyParagraph(`Bonjour ${firstName},`, { marginBottom: 18 })}
    ${renderCopyParagraph(
      "Vous faites partie des premières personnes inscrites à GIVE ME THE PITCH. Merci de faire partie de ce premier cercle : votre présence ici et votre soutien sont précieux.",
      { size: 15, lineHeight: 24, marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Vous êtes aujourd'hui invité·es à découvrir le premier projet original mis en ligne sur la plateforme. Il s'agit de MARÉE NOIRE, un thriller fantastique dont voici le pitch.",
      { marginBottom: 18 }
    )}
    ${renderPitchCard(buildLaunchPitchCopy())}
    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
    ${renderCopyParagraph(
      "Aujourd'hui, les plateformes savent presque tout de nos usages : à quel moment un épisode est lancé, interrompu ou repris, sur quel écran, à quelle heure, et parfois presque à la seconde près. Elles disent en revanche beaucoup moins bien ce qu'un projet provoque lorsqu'il est encore en développement.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Give Me The Pitch a été pensé pour ouvrir les portes de cette phase à celles et ceux qui regardent les séries.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "En découvrant MARÉE NOIRE, puis en partageant vos impressions, vous ne remplissez pas seulement un questionnaire : vous prenez place, dès l'amont, dans l'écosystème du développement télévisuel. Vos retours permettront de faire émerger un premier signal autour du projet, mais aussi d'éprouver la plateforme elle-même dans cette version encore en rodage.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Le parcours dure environ 30 minutes. Il débute par un premier questionnaire consacré à vos habitudes de visionnage et à vos goûts en matière de séries, avant de se poursuivre par la lecture ou l'écoute du dossier de MARÉE NOIRE. Il s'achève enfin par un second questionnaire destiné à recueillir vos impressions sur le projet.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Vos retours sur le fond comme sur la forme auront donc toute leur place, y compris si quelques petits frottements de navigation se glissent encore dans le parcours.",
      { marginBottom: 18 }
    )}
    ${renderCopyParagraph(
      "Pour un meilleur confort de lecture et de navigation, il est vivement recommandé d'effectuer ce parcours sur un ordinateur.",
      { marginBottom: 22 }
    )}
    ${renderOutlinePill("Vous disposez de 7 jours pour tester Marée Noire.", {
      borderColor: ROSE,
      color: ROSE,
      align: "center",
    })}
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

Vous êtes aujourd'hui invité·es à découvrir le premier projet original mis en ligne sur la plateforme. Il s'agit de MARÉE NOIRE, un thriller fantastique dont voici le pitch.

Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.

Où était-il pendant tout ce temps ? Pourquoi revient-il maintenant ? Tandis que l'enquête reprend, la ville se fissure : certain·es cherchent à comprendre, d'autres à reprendre le contrôle, d'autres encore à donner une forme à l'inexplicable.

Autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.

Aujourd'hui, les plateformes savent presque tout de nos usages : à quel moment un épisode est lancé, interrompu ou repris, sur quel écran, à quelle heure, et parfois presque à la seconde près. Elles disent en revanche beaucoup moins bien ce qu'un projet provoque lorsqu'il est encore en développement.

Give Me The Pitch a été pensé pour ouvrir les portes de cette phase à celles et ceux qui regardent les séries.

En découvrant MARÉE NOIRE, puis en partageant vos impressions, vous ne remplissez pas seulement un questionnaire : vous prenez place, dès l'amont, dans l'écosystème du développement télévisuel. Vos retours permettront de faire émerger un premier signal autour du projet, mais aussi d'éprouver la plateforme elle-même dans cette version encore en rodage.

Le parcours dure environ 30 minutes. Il débute par un premier questionnaire consacré à vos habitudes de visionnage et à vos goûts en matière de séries, avant de se poursuivre par la lecture ou l'écoute du dossier de MARÉE NOIRE. Il s'achève enfin par un second questionnaire destiné à recueillir vos impressions sur le projet.

Vos retours sur le fond comme sur la forme auront donc toute leur place, y compris si quelques petits frottements de navigation se glissent encore dans le parcours.

Pour un meilleur confort de lecture et de navigation, il est vivement recommandé d'effectuer ce parcours sur un ordinateur.

ACCEDER : ${theRoomUrl}
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

async function sendResendEmail({ to, subject, html, text, from, replyTo, headers }) {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.RESEND_FROM_EMAIL;
  const sender = String(from || defaultFrom || "").trim();
  const replyAddress = String(replyTo || extractEmailAddress(defaultFrom) || extractEmailAddress(sender) || "").trim();
  const customHeaders = headers && Object.keys(headers).length ? headers : undefined;

  if (!apiKey || !sender) {
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
      from: formatFromAddress(sender),
      reply_to: replyAddress || undefined,
      to: [to],
      subject,
      html,
      text,
      headers: customHeaders,
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

export async function sendPanelLaunchInviteEmail({
  to,
  fullName,
  theRoomUrl,
  unsubscribeUrl,
  operationCode,
}) {
  return sendResendEmail({
    to,
    from: replaceEmailLocalPart(process.env.RESEND_FROM_EMAIL, "room"),
    headers: buildCampaignHeaders({
      unsubscribeUrl,
      entityRefId: operationCode ? `launch-${operationCode}` : "launch",
    }),
    subject: "GIVE ME THE PITCH X THE ROOM - Marée Noire",
    html: buildPanelLaunchEmailHtml({ fullName, theRoomUrl }),
    text: buildPanelLaunchEmailText({ fullName, theRoomUrl }),
  });
}

export async function sendPanelLaunchStartReminderEmail({
  to,
  fullName,
  theRoomUrl,
  unsubscribeUrl,
  operationCode,
}) {
  return sendResendEmail({
    to,
    from: replaceEmailLocalPart(process.env.RESEND_FROM_EMAIL, "room"),
    headers: buildCampaignHeaders({
      unsubscribeUrl,
      entityRefId: operationCode ? `reminder-start-${operationCode}` : "reminder-start",
    }),
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
  unsubscribeUrl,
  operationCode,
}) {
  return sendResendEmail({
    to,
    from: replaceEmailLocalPart(process.env.RESEND_FROM_EMAIL, "room"),
    headers: buildCampaignHeaders({
      unsubscribeUrl,
      entityRefId: operationCode ? `reminder-access-${operationCode}` : "reminder-access",
    }),
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

export async function sendPanelCampaignClosingEmail({
  to,
  fullName,
  voteOptions = [],
  unsubscribeUrl,
  operationCode,
}) {
  return sendResendEmail({
    to,
    from: replaceEmailLocalPart(process.env.RESEND_FROM_EMAIL, "room"),
    headers: buildCampaignHeaders({
      unsubscribeUrl,
      entityRefId: operationCode ? `closing-${operationCode}` : "closing",
    }),
    subject: "Cloture de campagne - vote pour le prochain pitch",
    html: buildPanelCampaignClosingEmailHtml({ fullName, voteOptions }),
    text: buildPanelCampaignClosingEmailText({ fullName, voteOptions }),
  });
}
