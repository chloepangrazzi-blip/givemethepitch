function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function encodeEmailText(value) {
  return Array.from(escapeHtml(value)).map((character) => {
    const codePoint = character.codePointAt(0) || 0;
    return codePoint > 127 ? `&#${codePoint};` : character;
  }).join("");
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

export function buildAccessEmailHtml({ fullName, accessCode, keyaccessUrl }) {
  const firstName = String(fullName || "").trim().split(/\s+/)[0] || "";
  const safeFirstName = encodeEmailText(firstName);
  const safeAccessCode = escapeHtml(accessCode);
  const safeKeyaccessUrl = escapeHtml(keyaccessUrl);
  const pillFont = "Arial,'Helvetica Neue','Segoe UI',sans-serif";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#080808" style="margin:0;padding:0;background:#080808;background-color:#080808;border-collapse:collapse;">
      <tr>
        <td align="center" bgcolor="#080808" style="padding:32px 16px;background:#080808;background-color:#080808;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#c8f5e8" style="width:100%;max-width:640px;background:#c8f5e8;background-color:#c8f5e8;border-radius:28px;border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;">
            <tr>
              <td bgcolor="#c8f5e8" style="padding:18px;background:#c8f5e8;background-color:#c8f5e8;border-radius:28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#080808" style="width:100%;background:#080808;background-color:#080808;border:1px solid #c8f5e8;border-radius:18px;border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                  <tr>
                    <td bgcolor="#080808" style="padding:42px 28px 34px;background:#080808;background-color:#080808;font-family:Arial,'Helvetica Neue','Segoe UI',sans-serif;color:#ffffff;line-height:1.65;border-radius:18px;">
                      <p style="margin:0 0 18px;font-size:16px;color:#ffffff;">Bonjour ${safeFirstName},</p>
                      <p style="margin:0 0 28px;font-size:16px;color:#ffffff;">Voici votre cl&#233; d&#39;acc&#232;s personnelle.</p>
                      <div style="margin:0 0 20px;">
                        <span style="display:inline-block;min-width:176px;padding:16px 24px;border-radius:999px;background:#c8f5e8;background-color:#c8f5e8;color:#080808;font-family:${pillFont};font-size:15px;font-weight:400;letter-spacing:0.26em;text-transform:uppercase;text-align:center;box-sizing:border-box;">
                          ${safeAccessCode}
                        </span>
                      </div>
                      <p style="margin:0 0 24px;font-size:15px;color:#ffffff;">Pour entrer dans THE ROOM, utilisez le bouton ci-dessous.</p>
                      <div style="margin:0 0 34px;">
                        <a href="${safeKeyaccessUrl}" style="display:inline-block;min-width:176px;padding:16px 24px;border-radius:999px;background:#f5c6d8;background-color:#f5c6d8;color:#080808;text-decoration:none;font-family:${pillFont};font-size:15px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;text-align:center;box-sizing:border-box;">
                          ACCEDER
                        </a>
                      </div>
                      <div style="height:1px;line-height:1px;font-size:1px;background:#c8f5e8;background-color:#c8f5e8;margin:0 0 18px;">&nbsp;</div>
                      <div style="font-family:Arial,'Helvetica Neue','Segoe UI',sans-serif;font-size:12px;font-weight:400;letter-spacing:0.22em;text-transform:uppercase;color:#c8f5e8;">
                        GIVE ME THE PITCH X THE ROOM
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function buildPanelLaunchEmailHtml({ fullName, theRoomUrl }) {
  const firstName = String(fullName || "").trim().split(/\s+/)[0] || "";
  const safeFirstName = encodeEmailText(firstName);
  const safeTheRoomUrl = escapeHtml(theRoomUrl);

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#080808" style="margin:0;padding:0;background:#080808;background-color:#080808;border-collapse:collapse;">
      <tr>
        <td align="center" bgcolor="#080808" style="padding:32px 16px;background:#080808;background-color:#080808;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#c8f5e8" style="width:100%;max-width:640px;background:#c8f5e8;background-color:#c8f5e8;border-radius:28px;border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;">
            <tr>
              <td bgcolor="#c8f5e8" style="padding:18px;background:#c8f5e8;background-color:#c8f5e8;border-radius:28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#080808" style="width:100%;background:#080808;background-color:#080808;border:1px solid #c8f5e8;border-radius:18px;border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                  <tr>
                    <td bgcolor="#080808" style="padding:42px 28px 34px;background:#080808;background-color:#080808;font-family:Arial,'Helvetica Neue','Segoe UI',sans-serif;color:#ffffff;line-height:1.65;border-radius:18px;">
                      <p style="margin:0 0 18px;font-size:16px;color:#ffffff;">Bonjour ${safeFirstName},</p>
                      <p style="margin:0 0 28px;font-size:16px;color:#ffffff;">Vous &#234;tes invit&#233;·e &#224; rejoindre THE ROOM.</p>
                      <div style="margin:0 0 34px;">
                        <a href="${safeTheRoomUrl}" style="display:inline-block;min-width:176px;padding:16px 24px;border-radius:999px;background:#f5c6d8;background-color:#f5c6d8;color:#080808;text-decoration:none;font-family:Arial,'Helvetica Neue','Segoe UI',sans-serif;font-size:15px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;text-align:center;box-sizing:border-box;">
                          ENTRER
                        </a>
                      </div>
                      <div style="height:1px;line-height:1px;font-size:1px;background:#c8f5e8;background-color:#c8f5e8;margin:0 0 18px;">&nbsp;</div>
                      <div style="font-family:Arial,'Helvetica Neue','Segoe UI',sans-serif;font-size:12px;font-weight:400;letter-spacing:0.22em;text-transform:uppercase;color:#c8f5e8;">
                        GIVE ME THE PITCH X THE ROOM
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export async function sendAccessEmail({ to, fullName, accessCode, keyaccessUrl }) {
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
      to: [to],
      subject: "Votre accès THE ROOM",
      html: buildAccessEmailHtml({ fullName, accessCode, keyaccessUrl }),
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

export async function sendPanelLaunchInviteEmail({ to, fullName, theRoomUrl }) {
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
      to: [to],
      subject: "Votre invitation THE ROOM",
      html: buildPanelLaunchEmailHtml({ fullName, theRoomUrl }),
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
