import { NextResponse } from "next/server";
import { getPanelLaunchMailPayload } from "../../../../../lib/panel-launch";

export async function GET(request) {
  try {
    const launchCode = String(request.nextUrl.searchParams.get("invite") || "")
      .trim()
      .toUpperCase();

    if (!launchCode) {
      return NextResponse.json(
        { ok: false, error: "missing_launch_invite" },
        { status: 400 }
      );
    }

    const launch = await getPanelLaunchMailPayload(launchCode);

    if (!launch?.operationCode || !launch?.email) {
      return NextResponse.json(
        { ok: false, error: "invalid_launch_invite" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        invite: {
          operationCode: launch.operationCode,
          email: launch.email,
          fullName: launch.fullName || "",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "invite_lookup_failed", detail: error.message },
      { status: 500 }
    );
  }
}
