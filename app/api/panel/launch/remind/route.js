import { NextResponse } from "next/server";
import {
  sendPanelLaunchAccessReminderEmail,
  sendPanelLaunchStartReminderEmail,
} from "../../../../../lib/access-email";
import { getAppOrigin } from "../../../../../lib/app-origin";
import {
  buildPanelKeyAccessUrl,
  buildPanelLaunchUrl,
  getPanelLaunchMailPayload,
  markPanelLaunchReminderSent,
} from "../../../../../lib/panel-launch";

function isAuthorized(request) {
  const token = String(process.env.PANEL_LAUNCH_TOKEN || "").trim();

  if (!token) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("x-panel-launch-token") === token;
}

function normalizeOperationCodes(payload) {
  if (Array.isArray(payload?.operationCodes)) {
    return payload.operationCodes;
  }

  if (payload?.operationCode) {
    return [payload.operationCode];
  }

  return [];
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { ok: false, error: "unauthorized_launch_remind" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const operationCodes = normalizeOperationCodes(payload)
      .map((value) => String(value || "").trim().toUpperCase())
      .filter(Boolean);

    if (!operationCodes.length) {
      return NextResponse.json(
        { ok: false, error: "missing_operation_codes" },
        { status: 400 }
      );
    }

    const origin = getAppOrigin(request);
    const reminded = [];
    const failed = [];

    for (const operationCode of operationCodes) {
      try {
        const launch = await getPanelLaunchMailPayload(operationCode);

        if (!launch?.email || !launch?.accessCode) {
          failed.push({
            operationCode,
            error: "missing_launch_mail_payload",
          });
          continue;
        }

        const hasPersonalAccess =
          Boolean(launch.keyActivatedAt) ||
          Boolean(launch.verifiedAt) ||
          Boolean(launch.ndaSignedAt) ||
          Boolean(launch.formStartedAt) ||
          Boolean(launch.formCompletedAt);

        if (hasPersonalAccess) {
          await sendPanelLaunchAccessReminderEmail({
            to: launch.email,
            fullName: launch.fullName,
            accessCode: launch.accessCode,
            keyaccessUrl: buildPanelKeyAccessUrl(origin, {
              accessCode: launch.accessCode,
            }),
            ndaAlreadySigned: Boolean(launch.ndaSignedAt),
          });
        } else {
          await sendPanelLaunchStartReminderEmail({
            to: launch.email,
            fullName: launch.fullName,
            theRoomUrl: buildPanelLaunchUrl(origin, {
              operationCode: launch.operationCode,
            }),
          });
        }

        await markPanelLaunchReminderSent(operationCode);

        reminded.push({
          operationCode,
          email: launch.email,
          accessCode: launch.accessCode,
          variant: hasPersonalAccess ? "access" : "start",
        });
      } catch (error) {
        failed.push({
          operationCode,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      ok: failed.length === 0,
      reminded,
      failed,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "panel_launch_remind_failed", detail: error.message },
      { status: 500 }
    );
  }
}
