import { NextResponse } from "next/server";
import { submitSignalTest } from "../../../../lib/signal-test-repository";

const TEST_ACCESS_CODE = "THEROOM01";

export async function POST(request) {
  try {
    const payload = await request.json();
    const cookieAccessCode = request.cookies.get("gmtp_access_code")?.value || "";
    const accessCode = String(payload.accessCode || cookieAccessCode || TEST_ACCESS_CODE).trim().toUpperCase();
    const { answers } = payload;

    console.info("[tests/submit] incoming", {
      hasPayloadAccessCode: Boolean(payload.accessCode),
      payloadAccessCode: payload.accessCode || null,
      cookieAccessCode: cookieAccessCode || null,
      resolvedAccessCode: accessCode || null,
      answersKeys: answers && typeof answers === "object" ? Object.keys(answers) : [],
    });

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { ok: false, error: "missing_answers" },
        { status: 400 }
      );
    }

    const result = await submitSignalTest({ accessCode, answers });
    console.info("[tests/submit] success", {
      resolvedAccessCode: accessCode || null,
      enrolmentId: result.enrolmentId || null,
      testResponseId: result.testResponseId || null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[tests/submit] failure", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
    });
    return NextResponse.json(
      { ok: false, error: "test_submit_failed", detail: error.message },
      { status: 500 }
    );
  }
}
