import { NextResponse } from "next/server";
import { sendPanelLaunchInviteEmail } from "../../../../../lib/access-email";
import { getAppOrigin } from "../../../../../lib/app-origin";
import {
  buildPanelLaunchUrl,
  createPanelLaunchInvitation,
  getPublicPanelProcheInvitees,
  markPanelLaunchSent,
} from "../../../../../lib/panel-launch";

function isAuthorized(request) {
  const token = String(process.env.PANEL_LAUNCH_TOKEN || "").trim();

  if (!token) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("x-panel-launch-token") === token;
}

function normalizeInviteePayload(payload) {
  if (Array.isArray(payload?.invitees)) {
    return payload.invitees;
  }

  if (payload?.invitee && typeof payload.invitee === "object") {
    return [payload.invitee];
  }

  if (payload && typeof payload === "object" && payload.email) {
    return [payload];
  }

  return [];
}

async function resolveInvitees(payload) {
  if (payload?.source === "panel_proche" || payload?.fromPublicSignup === true) {
    return getPublicPanelProcheInvitees();
  }

  return normalizeInviteePayload(payload);
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { ok: false, error: "unauthorized_launch_send" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const invitees = await resolveInvitees(payload);

    if (!invitees.length) {
      return NextResponse.json(
        { ok: false, error: "missing_invitees" },
        { status: 400 }
      );
    }

    const origin = getAppOrigin(request);
    const sent = [];
    const failed = [];

    for (const invitee of invitees) {
      const fullName = String(invitee.fullName || "").trim();
      const email = String(invitee.email || "").trim().toLowerCase();
      const city = String(invitee.city || "").trim();
      const country = String(invitee.country || "").trim() || "France";
      const notes = String(invitee.notes || "").trim();

      if (!fullName || !email) {
        failed.push({
          fullName,
          email,
          error: "missing_invitee_fields",
        });
        continue;
      }

      try {
        const invitation = await createPanelLaunchInvitation({
          fullName,
          email,
          city,
          country,
          notes,
        });
        const theRoomUrl = buildPanelLaunchUrl(origin, {
          operationCode: invitation.operationCode,
        });

        await sendPanelLaunchInviteEmail({
          to: invitation.email,
          fullName: invitation.fullName,
          theRoomUrl,
        });

        await markPanelLaunchSent(invitation.operationCode);

        sent.push({
          fullName: invitation.fullName,
          email: invitation.email,
          operationCode: invitation.operationCode,
          accessCode: invitation.accessCode,
          theRoomUrl,
        });
      } catch (error) {
        failed.push({
          fullName,
          email,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      ok: failed.length === 0,
      sent,
      failed,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "panel_launch_send_failed", detail: error.message },
      { status: 500 }
    );
  }
}
