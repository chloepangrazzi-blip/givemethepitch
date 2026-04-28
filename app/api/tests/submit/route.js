import { NextResponse } from "next/server";
import { isSessionClosedErrorCode, SIGNAL_SESSION_CLOSED_MESSAGE } from "../../../../lib/campaign-access";
import { submitSignalTest } from "../../../../lib/signal-test-repository";
import { getTestAccessCode, isDebugLoggingEnabled } from "../../../../lib/runtime-config";

export async function POST(request) {
  try {
    const payload = await request.json();
    const cookieAccessCode = request.cookies.get("gmtp_access_code")?.value || "";
    const testAccessCode = getTestAccessCode();
    const accessCode = String(payload.accessCode || cookieAccessCode || testAccessCode || "")
      .trim()
      .toUpperCase();
    const { answers } = payload;

    if (isDebugLoggingEnabled()) {
      console.info("[tests/submit] incoming", {
        hasPayloadAccessCode: Boolean(payload.accessCode),
        payloadAccessCode: payload.accessCode || null,
        cookieAccessCode: cookieAccessCode || null,
        resolvedAccessCode: accessCode || null,
        answersKeys: answers && typeof answers === "object" ? Object.keys(answers) : [],
      });
    }

    if (!accessCode) {
      return NextResponse.json(
        { ok: false, error: "missing_access_code" },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { ok: false, error: "missing_answers" },
        { status: 400 }
      );
    }

    const result = await submitSignalTest({ accessCode, answers });

    if (isDebugLoggingEnabled()) {
      console.info("[tests/submit] success", {
        resolvedAccessCode: accessCode || null,
        enrolmentId: result.enrolmentId || null,
        testResponseId: result.testResponseId || null,
      });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "test_submit_failed";

    if (isDebugLoggingEnabled()) {
      console.error("[tests/submit] failure", {
        message,
        stack: error instanceof Error ? error.stack : null,
      });
    }

    if (isSessionClosedErrorCode(message)) {
      return NextResponse.json(
        { ok: false, error: message, detail: SIGNAL_SESSION_CLOSED_MESSAGE },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "test_submit_failed", detail: message },
      { status: 500 }
    );
  }
}
