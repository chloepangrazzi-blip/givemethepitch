import { NextResponse } from "next/server";
import { submitSignalTest } from "../../../../lib/signal-test-repository";

const TEST_ACCESS_CODE = "THEROOM01";

export async function POST(request) {
  try {
    const accessCode = request.cookies.get("gmtp_access_code")?.value || TEST_ACCESS_CODE;
    const { answers } = await request.json();

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { ok: false, error: "missing_answers" },
        { status: 400 }
      );
    }

    const result = await submitSignalTest({ accessCode, answers });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "test_submit_failed", detail: error.message },
      { status: 500 }
    );
  }
}
