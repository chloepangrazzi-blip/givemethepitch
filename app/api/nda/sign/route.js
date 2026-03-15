import { NextResponse } from "next/server";
import { markNdaSigned } from "../../../../lib/access-repository";

export async function POST(request) {
  try {
    const accessCode = request.cookies.get("gmtp_access_code")?.value;
    const { prenom, nom, consent } = await request.json();

    if (!accessCode || !prenom || !nom || !consent) {
      return NextResponse.json(
        { ok: false, error: "missing_signature_data" },
        { status: 400 }
      );
    }

    const record = await markNdaSigned(accessCode, { prenom, nom });

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "unknown_access" },
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
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "nda_sign_failed", detail: error.message },
      { status: 500 }
    );
  }
}
