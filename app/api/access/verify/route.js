import { NextResponse } from "next/server";
import { ensureTestAccessRequest, getAccessRequestByCode, markAccessVerified } from "../../../../lib/access-repository";

const TEST_ACCESS_CODE = "THEROOM01";

export async function POST(request) {
  try {
    const { accessCode } = await request.json();
    const normalizedCode = String(accessCode || "").trim().toUpperCase();

    if (normalizedCode === TEST_ACCESS_CODE) {
      const record = await ensureTestAccessRequest(TEST_ACCESS_CODE);
      const response = NextResponse.json({
        ok: true,
        sessionSlug: record.sessionSlug || "mareenoire",
      });

      response.cookies.set("gmtp_access_code", TEST_ACCESS_CODE, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
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
    });

    response.cookies.set("gmtp_access_code", verified.accessCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "verify_failed", detail: error.message },
      { status: 500 }
    );
  }
}
