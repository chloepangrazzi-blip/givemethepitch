import { NextResponse } from "next/server";
import { sendAccessEmail } from "../../../../lib/access-email";
import { createAccessRequest } from "../../../../lib/access-repository";
import { generateAccessCode } from "../../../../lib/access-store";

export async function POST(request) {
  try {
    const payload = await request.json();
    const fullName = String(payload.fullName || "").trim();
    const email = String(payload.email || "").trim();
    const mobile = String(payload.mobile || "").trim();
    const city = String(payload.city || "").trim();
    const consent = Boolean(payload.consent);

    if (!fullName || !email || !mobile || !city || !consent) {
      return NextResponse.json(
        { ok: false, error: "missing_required_fields" },
        { status: 400 }
      );
    }

    const accessCode = generateAccessCode();
    const record = await createAccessRequest({
      accessCode,
      fullName,
      email,
      mobile,
      city,
      consent,
      answers: payload.answers || {},
      panelProfile: payload.panelProfile || {},
    });

    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const keyaccessUrl = `${origin}/keyaccess`;

    let emailResult = null;
    try {
      emailResult = await sendAccessEmail({
        to: record.email,
        fullName,
        accessCode: record.accessCode,
        keyaccessUrl,
      });
    } catch (error) {
      emailResult = {
        sent: false,
        provider: "resend",
        reason: error.message,
      };
    }

    return NextResponse.json({
      ok: true,
      emailSent: Boolean(emailResult?.sent),
      previewCode: record.accessCode,
      keyaccessUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "request_failed", detail: error.message },
      { status: 500 }
    );
  }
}
