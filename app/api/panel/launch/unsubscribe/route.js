import { NextResponse } from "next/server";
import { unsubscribePanelLaunchByCode } from "../../../../../lib/panel-launch";

function getOperationCode(request) {
  return String(request.nextUrl.searchParams.get("invite") || "")
    .trim()
    .toUpperCase();
}

function renderUnsubscribePage() {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Désinscription enregistrée</title>
    <style>
      body {
        margin: 0;
        background: #080808;
        color: #ffffff;
        font-family: Arial, 'Helvetica Neue', 'Segoe UI', sans-serif;
        display: flex;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .shell {
        width: min(100%, 560px);
        border: 1px solid #c8f5e8;
        border-radius: 28px;
        background: #111111;
        padding: 28px 24px;
        text-align: center;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
        line-height: 1.05;
        letter-spacing: -0.04em;
        text-transform: uppercase;
      }
      p {
        margin: 0;
        color: #d9d9d9;
        font-size: 16px;
        line-height: 1.7;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <h1>Préférence enregistrée</h1>
      <p>Vous ne recevrez plus les mails de relance liés à cette campagne.</p>
    </div>
  </body>
</html>`;
}

export async function GET(request) {
  const operationCode = getOperationCode(request);

  if (operationCode) {
    await unsubscribePanelLaunchByCode(operationCode);
  }

  return new NextResponse(renderUnsubscribePage(), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request) {
  const operationCode = getOperationCode(request);

  if (operationCode) {
    await unsubscribePanelLaunchByCode(operationCode);
  }

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
