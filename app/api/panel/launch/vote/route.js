import { getCataloguePageData } from "../../../../../lib/catalogue-data";
import {
  getPanelCampaignVote,
  getPanelLaunchMailPayload,
  recordPanelCampaignVote,
} from "../../../../../lib/panel-launch";

const PAGE_BG = "#080808";
const MINT = "#c8f5e8";
const WHITE = "#ffffff";
const SOFT = "#d9d9d9";
const FONT = "Arial, 'Helvetica Neue', 'Segoe UI', sans-serif";

function renderVotePage({ title, body, accent = MINT }) {
  return `<!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:24px;background:${PAGE_BG};color:${WHITE};font-family:${FONT};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;border:1px solid ${accent};border-radius:24px;">
              <tr>
                <td style="padding:32px 28px;background:${PAGE_BG};border-radius:24px;">
                  <p style="margin:0 0 18px;color:${accent};font-size:12px;line-height:18px;letter-spacing:0.16em;text-transform:uppercase;font-weight:300;">GIVE ME THE PITCH</p>
                  <h1 style="margin:0 0 18px;color:${WHITE};font-size:28px;line-height:1.15;font-weight:400;">${title}</h1>
                  <p style="margin:0;color:${SOFT};font-size:16px;line-height:26px;">${body}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const operationCode = String(url.searchParams.get("invite") || "")
      .trim()
      .toUpperCase();
    const projectId = String(url.searchParams.get("project") || "").trim();

    const project = getCataloguePageData("signal").projects.find(
      (item) => item.id === projectId && item.id !== "maree-noire"
    );

    if (!operationCode || !project) {
      return new Response(
        renderVotePage({
          title: "Vote indisponible",
          body: "Le lien de vote n'est pas valide ou le pitch demandé n'existe pas.",
          accent: "#f5c6d8",
        }),
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const launch = await getPanelLaunchMailPayload(operationCode);

    if (!launch?.contactId || !launch?.campaignId) {
      return new Response(
        renderVotePage({
          title: "Vote indisponible",
          body: "Nous n'avons pas réussi à retrouver votre invitation.",
          accent: "#f5c6d8",
        }),
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const existingVote = await getPanelCampaignVote({
      contactId: launch.contactId,
      campaignId: launch.campaignId,
    });

    if (existingVote) {
      const existingProject = getCataloguePageData("signal").projects.find(
        (item) => item.id === existingVote?.payload?.project_id
      );

      return new Response(
        renderVotePage({
          title: "Vote déjà enregistré",
          body: existingProject
            ? `Votre vote a déjà été pris en compte pour ${existingProject.title}. Merci.`
            : "Votre vote a déjà été pris en compte. Merci.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const result = await recordPanelCampaignVote({
      launchCode: operationCode,
      projectId,
    });

    if (!result.ok) {
      return new Response(
        renderVotePage({
          title: "Vote impossible",
          body: "Nous n'avons pas réussi à enregistrer votre vote pour le moment.",
          accent: "#f5c6d8",
        }),
        {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    if (result.status === "already_voted") {
      const existingProject = getCataloguePageData("signal").projects.find(
        (item) => item.id === result.existingProjectId
      );

      return new Response(
        renderVotePage({
          title: "Vote déjà enregistré",
          body: existingProject
            ? `Votre vote a déjà été pris en compte pour ${existingProject.title}. Merci.`
            : "Votre vote a déjà été pris en compte. Merci.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    return new Response(
      renderVotePage({
        title: "Vote enregistré",
        body: `Merci. Votre vote pour ${project.title} a bien été pris en compte.`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    return new Response(
      renderVotePage({
        title: "Vote impossible",
        body: "Une erreur est survenue pendant l'enregistrement de votre vote.",
        accent: "#f5c6d8",
      }),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
