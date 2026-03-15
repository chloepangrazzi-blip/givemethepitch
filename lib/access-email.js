export function buildAccessEmailHtml({ fullName, accessCode, keyaccessUrl }) {
  const firstName = String(fullName || "").trim().split(/\s+/)[0] || "";

  return `
    <div style="margin:0;padding:0;background:#080808;">
      <div style="max-width:640px;margin:0 auto;padding:40px 24px 56px;background:#080808;color:#ffffff;font-family:Arial,sans-serif;line-height:1.6;">
        <div style="height:18px;background:#c8f5e8;border-radius:999px 999px 0 0;"></div>
        <div style="border:1px solid #c8f5e8;border-top:none;padding:40px 28px 36px;background:#080808;">
          <div style="font-size:38px;line-height:0.95;letter-spacing:0.04em;color:#c8f5e8;margin:0 0 28px;text-transform:uppercase;">
            The Room
          </div>
          <p style="margin:0 0 18px;font-size:16px;color:#ffffff;">Bonjour ${firstName},</p>
          <p style="margin:0 0 18px;font-size:16px;color:#ffffff;">Voici votre cle d'acces :</p>
          <div style="margin:0 0 28px;display:inline-block;padding:14px 18px;border:1px solid #c8f5e8;border-radius:999px;color:#080808;background:#c8f5e8;font-size:22px;letter-spacing:0.22em;text-transform:uppercase;">
            ${accessCode}
          </div>
          <p style="margin:0 0 20px;font-size:16px;color:#ffffff;">Vous pouvez acceder a votre espace ici :</p>
          <p style="margin:0 0 32px;">
            <a href="${keyaccessUrl}" style="display:inline-block;padding:15px 22px;border-radius:999px;background:#f5c6d8;color:#080808;text-decoration:none;font-size:15px;letter-spacing:0.04em;">
              Acceder a key access
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:14px;color:#c8f5e8;word-break:break-all;">${keyaccessUrl}</p>
          <div style="margin-top:36px;padding-top:20px;border-top:1px solid rgba(200,245,232,0.35);font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#c8f5e8;">
            GIVE ME THE PITCH - THE ROOM
          </div>
        </div>
        <div style="height:18px;background:#c8f5e8;border-radius:0 0 999px 999px;"></div>
      </div>
    </div>
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
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Votre access key",
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
