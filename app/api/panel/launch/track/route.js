import { NextResponse } from "next/server";
import {
  markPanelLaunchClicked,
  markPanelLaunchFormStarted,
} from "../../../../../lib/panel-launch";

export async function POST(request) {
  try {
    const payload = await request.json();
    const launchCode = String(payload.launchCode || "").trim().toUpperCase();
    const stage = String(payload.stage || "").trim().toLowerCase();

    if (!launchCode || !stage) {
      return NextResponse.json(
        { ok: false, error: "missing_launch_tracking_fields" },
        { status: 400 }
      );
    }

    if (stage === "clicked") {
      await markPanelLaunchClicked(launchCode);
    } else if (stage === "form_started") {
      await markPanelLaunchFormStarted(launchCode);
    } else {
      return NextResponse.json(
        { ok: false, error: "unsupported_launch_stage" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "launch_tracking_failed", detail: error.message },
      { status: 500 }
    );
  }
}
