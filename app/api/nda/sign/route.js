import { NextResponse } from "next/server";
import {
  ensureTestAccessRequest,
  markNdaSigned,
} from "../../../../lib/access-repository";
import { isSessionClosedErrorCode, SIGNAL_SESSION_CLOSED_MESSAGE } from "../../../../lib/campaign-access";
import { getTestAccessCode } from "../../../../lib/runtime-config";

export async function POST(request) {
  try {
    const isSecure =
      (request.headers.get("x-forwarded-proto") ||
        new URL(request.url).protocol.replace(":", "")) === "https";
    const payload = await request.json();
    const testAccessCode = getTestAccessCode();
    const accessCode = String(
      payload.accessCode ||
        request.cookies.get("gmtp_access_code")?.value ||
        testAccessCode ||
        ""
    )
      .trim()
      .toUpperCase();
    const { prenom, nom, consent } = payload;

    if (!prenom || !nom || !consent) {
      return NextResponse.json(
        { ok: false, error: "missing_signature_data" },
        { status: 400 }
      );
    }

    if (!accessCode) {
      return NextResponse.json(
        { ok: false, error: "missing_access_code" },
        { status: 400 }
      );
    }

    if (testAccessCode && accessCode === testAccessCode) {
      await ensureTestAccessRequest(testAccessCode);
      return NextResponse.json({ ok: true, nextPath: "/mareenoire" });
    }

    let record = null;
    try {
      record = await markNdaSigned(accessCode, { prenom, nom });
    } catch (error) {
      const message = error instanceof Error ? error.message : "nda_sign_failed";

      if (isSessionClosedErrorCode(message)) {
        return NextResponse.json(
          { ok: false, error: message, detail: SIGNAL_SESSION_CLOSED_MESSAGE },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { ok: false, error: "nda_sign_failed", detail: message },
        { status: 500 }
      );
    }

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "invalid_code" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      nextPath: `/${record.sessionSlug}`,
    });

    response.cookies.set("gmtp_nda_signed", "yes", {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "nda_sign_failed";

    if (isSessionClosedErrorCode(message)) {
      return NextResponse.json(
        { ok: false, error: message, detail: SIGNAL_SESSION_CLOSED_MESSAGE },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "nda_sign_failed", detail: message },
      { status: 500 }
    );
  }
}
