import { NextResponse } from "next/server";
import { sendAccessEmail } from "../../../../lib/access-email";
import { createAccessRequest, getAccessRequestByCode } from "../../../../lib/access-repository";
import { generateAccessCode } from "../../../../lib/access-store";
import { getAppOrigin } from "../../../../lib/app-origin";
import {
  getPanelLaunchByCode,
  getPanelLaunchMailPayload,
  markPanelLaunchCompleted,
} from "../../../../lib/panel-launch";
import { PANEL_PUBLIC_KEYACCESS_PATH } from "../../../../lib/public-paths";

export async function POST(request) {
  try {
    const payload = await request.json();
    const fullName = String(payload.fullName || "").trim();
    const email = String(payload.email || "").trim();
    const mobile = String(payload.mobile || "").trim();
    const city = String(payload.city || "").trim();
    const consent = Boolean(payload.consent);

    if (!fullName || !email || !mobile || !city || !consent) {
      return NextResponse.json(
        { ok: false, error: "missing_required_fields" },
        { status: 400 }
      );
    }

    const launchCode = String(payload.launchCode || "").trim().toUpperCase();
    const providedAccessCode = String(payload.accessCode || "").trim().toUpperCase();
    const launchRecord = launchCode ? await getPanelLaunchByCode(launchCode) : null;
    const launchMailPayload = launchCode ? await getPanelLaunchMailPayload(launchCode) : null;
    const invitedFlow = Boolean(launchCode && launchRecord);

    if (launchCode && !launchRecord) {
      return NextResponse.json(
        { ok: false, error: "invalid_launch_invite" },
        { status: 400 }
      );
    }

    if (launchRecord?.email && launchRecord.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { ok: false, error: "invited_email_mismatch" },
        { status: 400 }
      );
    }

    if (launchCode && !launchMailPayload?.accessCode) {
      return NextResponse.json(
        { ok: false, error: "missing_invite_access_code" },
        { status: 400 }
      );
    }

    if (invitedFlow) {
      const accessCodeToValidate = providedAccessCode || launchMailPayload.accessCode;
      const existingAccess = await getAccessRequestByCode(accessCodeToValidate);

      if (!existingAccess || existingAccess.contactId !== launchRecord.contactId) {
        return NextResponse.json(
          { ok: false, error: "invalid_invite_access_pair" },
          { status: 400 }
        );
      }
    }

    const accessCode = launchMailPayload?.accessCode || providedAccessCode || generateAccessCode();
    const record = await createAccessRequest({
      accessCode,
      fullName,
      email,
      mobile,
      city,
      consent,
      answers: payload.answers || {},
      panelProfile: payload.panelProfile || {},
    });

    const origin = getAppOrigin(request);
    const keyaccessUrl = `${origin}${PANEL_PUBLIC_KEYACCESS_PATH}`;

    let emailResult = null;
    try {
      emailResult = await sendAccessEmail({
        to: record.email,
        fullName,
        accessCode: record.accessCode,
        keyaccessUrl,
      });
    } catch (error) {
      emailResult = {
        sent: false,
        provider: "resend",
        reason: error.message,
      };
    }

    if (launchRecord) {
      await markPanelLaunchCompleted(launchCode);

      return NextResponse.json({
        ok: true,
        invitedFlow: true,
        emailSent: Boolean(emailResult?.sent),
        previewCode: record.accessCode,
        keyaccessUrl,
      });
    }

    return NextResponse.json({
      ok: true,
      emailSent: Boolean(emailResult?.sent),
      previewCode: record.accessCode,
      keyaccessUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "request_failed", detail: error.message },
      { status: 500 }
    );
  }
}
