import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminPassword,
  isAdminConfigured,
} from "../../../../lib/admin-auth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24,
};

export async function POST(request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json({ error: "admin_password_not_configured" }, { status: 503 });
    }

    const body = await request.json();
    const password = String(body?.password || "");

    if (password !== getAdminPassword()) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), COOKIE_OPTIONS);
    return response;
  } catch {
    return NextResponse.json({ error: "admin_login_failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}
