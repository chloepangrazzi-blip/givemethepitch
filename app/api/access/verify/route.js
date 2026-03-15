import { NextResponse } from "next/server";
import { getAccessRequestByCode, markAccessVerified } from "../../../../lib/access-repository";

export async function POST(request) {
  try {
    const { accessCode } = await request.json();
    const record = await getAccessRequestByCode(accessCode);

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "invalid_code" },
        { status: 401 }
      );
    }

    const verified = await markAccessVerified(accessCode);
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
