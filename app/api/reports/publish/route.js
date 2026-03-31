import { NextResponse } from "next/server";
import {
  getSupabaseServiceKey,
  getSupabaseUrl,
  hasSupabase,
  selectOne,
} from "../../../../lib/supabase-client";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatScore(value) {
  if (value == null || value === "") {
    return "-";
  }
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(2)}/100` : String(value);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}

function renderJsonSection(title, payload) {
  if (!payload || (typeof payload === "object" && !Object.keys(payload).length)) {
    return "";
  }

  return `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      <pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
    </section>
  `;
}

function renderReportHtml({ project, campaign, report }) {
  const generatedAt = report.generated_at || report.created_at;

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Restitution SIGNAL - ${escapeHtml(project.name)}</title>
    <style>
      body {
        font-family: Georgia, "Times New Roman", serif;
        margin: 0;
        background: #f4f0e8;
        color: #181614;
      }
      main {
        max-width: 900px;
        margin: 0 auto;
        padding: 48px 32px 64px;
      }
      .hero {
        border: 1px solid #181614;
        background: #fffdf9;
        padding: 28px 32px;
        margin-bottom: 28px;
      }
      h1, h2, h3 {
        margin: 0 0 12px;
      }
      h1 {
        font-size: 34px;
        line-height: 1.05;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px 20px;
        margin-top: 20px;
        font-size: 14px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 24px;
      }
      .score-card {
        background: #fffdf9;
        border: 1px solid #181614;
        padding: 18px;
      }
      .score-card strong {
        display: block;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      .score-card span {
        font-size: 28px;
      }
      .section {
        background: #fffdf9;
        border: 1px solid #181614;
        padding: 22px 24px;
        margin-bottom: 18px;
      }
      p {
        margin: 0;
        line-height: 1.6;
        white-space: pre-wrap;
      }
      pre {
        white-space: pre-wrap;
        word-break: break-word;
        margin: 0;
        font-family: "SFMono-Regular", ui-monospace, Menlo, monospace;
        font-size: 12px;
        line-height: 1.5;
      }
      @media print {
        body {
          background: #ffffff;
        }
        main {
          padding: 24px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>Restitution SIGNAL</h1>
        <h2>${escapeHtml(project.name)}</h2>
        <div class="meta">
          <div><strong>Code projet</strong><br />${escapeHtml(project.projet_code || "-")}</div>
          <div><strong>Code campagne</strong><br />${escapeHtml(campaign.campagne_code || "-")}</div>
          <div><strong>Campagne</strong><br />${escapeHtml(campaign.name || "-")}</div>
          <div><strong>Généré le</strong><br />${escapeHtml(formatDate(generatedAt))}</div>
          <div><strong>Taille d'échantillon</strong><br />${escapeHtml(String(report.sample_size ?? "-"))}</div>
          <div><strong>Statut</strong><br />${escapeHtml(report.status || "-")}</div>
        </div>
      </section>

      <section class="grid">
        <div class="score-card"><strong>Score global</strong><span>${escapeHtml(formatScore(report.desirability_score))}</span></div>
        <div class="score-card"><strong>Hook</strong><span>${escapeHtml(formatScore(report.hook_score))}</span></div>
        <div class="score-card"><strong>Feel</strong><span>${escapeHtml(formatScore(report.feel_score))}</span></div>
        <div class="score-card"><strong>Care</strong><span>${escapeHtml(formatScore(report.care_score))}</span></div>
        <div class="score-card"><strong>Continue</strong><span>${escapeHtml(formatScore(report.continue_score))}</span></div>
        <div class="score-card"><strong>Share</strong><span>${escapeHtml(formatScore(report.share_score))}</span></div>
      </section>

      <section class="section">
        <h2>Synthèse exécutive</h2>
        <p>${escapeHtml(report.executive_summary || "A compléter.")}</p>
      </section>

      <section class="section">
        <h2>Points forts</h2>
        <p>${escapeHtml(report.strengths_summary || "A compléter.")}</p>
      </section>

      <section class="section">
        <h2>Points de friction</h2>
        <p>${escapeHtml(report.weaknesses_summary || "A compléter.")}</p>
      </section>

      <section class="section">
        <h2>Synthèse qualitative</h2>
        <p>${escapeHtml(report.qualitative_summary || "A compléter.")}</p>
      </section>

      ${
        report.social_summary
          ? `<section class="section"><h2>Synthèse sociale</h2><p>${escapeHtml(report.social_summary)}</p></section>`
          : ""
      }

      ${renderJsonSection("Segments", report.segment_insights)}
      ${renderJsonSection("Social", report.social_insights)}
      ${renderJsonSection("The Room", report.room_insights)}
    </main>
  </body>
</html>`;
}

async function rpcRequest(schema, fn, body) {
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: getSupabaseServiceKey(),
      Authorization: `Bearer ${getSupabaseServiceKey()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Profile": schema,
      "Content-Profile": schema,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase RPC ${schema}.${fn} failed (${response.status}): ${detail}`);
  }

  return response.status === 204 ? null : response.json();
}

async function uploadHtmlToStorage({ bucket, path, html }) {
  const response = await fetch(`${getSupabaseUrl()}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: getSupabaseServiceKey(),
      Authorization: `Bearer ${getSupabaseServiceKey()}`,
      "Content-Type": "text/html; charset=utf-8",
      "x-upsert": "true",
    },
    body: html,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase storage upload failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function getReportContext(reportId) {
  const report = await selectOne("reporting", "signal_reports", `?id=eq.${reportId}&limit=1`);
  if (!report) {
    throw new Error("report_not_found");
  }

  const campaign = await selectOne("ops", "campaigns", `?id=eq.${report.campaign_id}&limit=1`);
  if (!campaign) {
    throw new Error("campaign_not_found");
  }

  const project = await selectOne("catalog", "projects", `?id=eq.${campaign.project_id}&limit=1`);
  if (!project) {
    throw new Error("project_not_found");
  }

  return { report, campaign, project };
}

export async function POST(request) {
  try {
    if (!hasSupabase()) {
      return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
    }

    const body = await request.json();
    const reportId = String(body?.reportId || "").trim();
    const publish = body?.publish !== false;

    if (!reportId) {
      return NextResponse.json({ error: "missing_report_id" }, { status: 400 });
    }

    const { report, campaign, project } = await getReportContext(reportId);
    const version = Number(report.report_version || 1);
    const fileName = `rapport-signal-v${version}.html`;
    const storagePath = `${project.projet_code}/${campaign.campagne_code}/${fileName}`;
    const html = renderReportHtml({ report, campaign, project });

    await uploadHtmlToStorage({
      bucket: "restitutions",
      path: storagePath,
      html,
    });

    await rpcRequest("ops", "attach_signal_report_file", {
      p_report_id: reportId,
      p_storage_path: storagePath,
      p_file_name: fileName,
    });

    if (publish) {
      await rpcRequest("ops", "publish_signal_report", {
        p_report_id: reportId,
      });
    }

    return NextResponse.json({
      ok: true,
      mode: "html_printable",
      reportId,
      storageBucket: "restitutions",
      storagePath,
      published: publish,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "report_publish_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
