import { NextResponse } from "next/server";
import { sendPanelCampaignClosingEmail } from "../../../../../lib/access-email";
import { getAppOrigin } from "../../../../../lib/app-origin";
import { getCataloguePageData } from "../../../../../lib/catalogue-data";
import { buildPanelVoteUrl, getPanelLaunchMailPayload } from "../../../../../lib/panel-launch";

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
        { ok: false, error: "unauthorized_launch_closing" },
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

    const sent = [];
    const failed = [];

    for (const operationCode of operationCodes) {
      try {
        const launch = await getPanelLaunchMailPayload(operationCode);

        if (!launch?.email) {
          failed.push({
            operationCode,
            error: "missing_launch_mail_payload",
          });
          continue;
        }

        const voteOptions = getCataloguePageData("signal").projects
          .filter((project) => project.id !== "maree-noire")
          .map((project) => ({
            id: project.id,
            title: project.title,
            genre: project.genre,
            format: project.format,
            shortPitch: project.shortPitch,
            voteUrl: buildPanelVoteUrl(origin, {
              operationCode: launch.operationCode,
              projectId: project.id,
            }),
          }));

        await sendPanelCampaignClosingEmail({
          to: launch.email,
          fullName: launch.fullName,
          voteOptions,
        });

        sent.push({
          operationCode,
          email: launch.email,
          voteCount: voteOptions.length,
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
      sent,
      failed,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "panel_launch_closing_failed", detail: error.message },
      { status: 500 }
    );
  }
}
