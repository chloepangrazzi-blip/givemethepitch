import { NextResponse } from "next/server";
import {
  ensureTestAccessRequest,
  getAccessRequestByCode,
  markAccessVerified,
} from "../../../../lib/access-repository";
import { isSessionClosedErrorCode, SIGNAL_SESSION_CLOSED_MESSAGE } from "../../../../lib/campaign-access";
import { PANEL_PUBLIC_CATALOGUE_PATH } from "../../../../lib/public-paths";
import { getTestAccessCode } from "../../../../lib/runtime-config";

export async function POST(request) {
  try {
    const isSecure =
      (request.headers.get("x-forwarded-proto") ||
        new URL(request.url).protocol.replace(":", "")) === "https";
    const { accessCode } = await request.json();
    const normalizedCode = String(accessCode || "").trim().toUpperCase();
    const testAccessCode = getTestAccessCode();

    if (testAccessCode && normalizedCode === testAccessCode) {
      const record = await ensureTestAccessRequest(testAccessCode);
      const response = NextResponse.json({
        ok: true,
        sessionSlug: record.sessionSlug || "mareenoire",
        nextPath: record.ndaSignedAt ? PANEL_PUBLIC_CATALOGUE_PATH : "/nda",
      });

      response.cookies.set("gmtp_access_code", testAccessCode, {
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    const record = await getAccessRequestByCode(normalizedCode);

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "invalid_code" },
        { status: 401 }
      );
    }

    const verified = await markAccessVerified(normalizedCode);
    const response = NextResponse.json({
      ok: true,
      sessionSlug: verified.sessionSlug,
      nextPath: record.ndaSignedAt ? PANEL_PUBLIC_CATALOGUE_PATH : "/nda",
    });

    response.cookies.set("gmtp_access_code", verified.accessCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "verify_failed";

    if (isSessionClosedErrorCode(message)) {
      return NextResponse.json(
        { ok: false, error: message, detail: SIGNAL_SESSION_CLOSED_MESSAGE },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "verify_failed", detail: message },
      { status: 500 }
    );
  }
}
