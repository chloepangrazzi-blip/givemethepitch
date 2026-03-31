import { hasSupabase, restRequest } from "./supabase-client";

function buildInQuery(ids) {
  const cleanIds = [...new Set((ids || []).filter(Boolean))];
  if (!cleanIds.length) {
    return "";
  }
  return `in.(${cleanIds.join(",")})`;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function sortByDateDesc(items, key) {
  return [...items].sort((a, b) => {
    const first = new Date(a?.[key] || a?.created_at || 0).getTime();
    const second = new Date(b?.[key] || b?.created_at || 0).getTime();
    return second - first;
  });
}

export async function getAdminDashboardData() {
  if (!hasSupabase()) {
    return {
      restitutions: [],
      storiesProjects: [],
    };
  }

  const reports = toArray(
    await restRequest({
      schema: "reporting",
      table: "signal_reports",
      query: "?order=created_at.desc&limit=30",
      method: "GET",
    })
  );

  const campaignIds = reports.map((report) => report.campaign_id).filter(Boolean);
  const campaigns = campaignIds.length
    ? toArray(
        await restRequest({
          schema: "ops",
          table: "campaigns",
          query: `?id=${buildInQuery(campaignIds)}`,
          method: "GET",
        })
      )
    : [];

  const campaignsById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));

  const reportProjectIds = campaigns
    .map((campaign) => campaign.project_id)
    .filter(Boolean);

  const storiesProjects = toArray(
    await restRequest({
      schema: "catalog",
      table: "projects",
      query: "?origine_projet=eq.stories&order=created_at.desc&limit=20",
      method: "GET",
    })
  );

  const projectIds = [...new Set([...reportProjectIds, ...storiesProjects.map((project) => project.id)])];
  const relatedProjects = projectIds.length
    ? toArray(
        await restRequest({
          schema: "catalog",
          table: "projects",
          query: `?id=${buildInQuery(projectIds)}`,
          method: "GET",
        })
      )
    : [];

  const projectsById = new Map(relatedProjects.map((project) => [project.id, project]));

  const formattedReports = sortByDateDesc(reports, "generated_at").map((report) => {
    const campaign = campaignsById.get(report.campaign_id);
    const project = projectsById.get(campaign?.project_id);
    return {
      id: report.id,
      code: report.restitution_code,
      status: report.status,
      sampleSize: report.sample_size,
      score: report.desirability_score,
      generatedAt: report.generated_at || report.created_at,
      reportStoragePath: report.report_storage_path || null,
      fileName: report.report_file_name || null,
      campaign: campaign
        ? {
            id: campaign.id,
            code: campaign.campagne_code,
            name: campaign.name,
          }
        : null,
      project: project
        ? {
            id: project.id,
            code: project.projet_code,
            name: project.name,
            origin: project.origine_projet,
            status: project.statut_projet,
            slug: project.slug,
          }
        : null,
    };
  });

  const latestReportByProjectId = new Map();
  for (const report of formattedReports) {
    const projectId = report.project?.id;
    if (projectId && !latestReportByProjectId.has(projectId)) {
      latestReportByProjectId.set(projectId, report);
    }
  }

  const formattedStoriesProjects = sortByDateDesc(storiesProjects, "created_at").map((project) => {
    const latestReport = latestReportByProjectId.get(project.id);
    return {
      id: project.id,
      code: project.projet_code,
      name: project.name,
      slug: project.slug,
      genre: project.main_genre,
      format: project.format_editorial || project.format,
      pack: project.pack_vente,
      status: project.statut_projet,
      score: project.score_final_snapshot ?? latestReport?.score ?? null,
      dateFinScoring: project.date_fin_scoring,
      dateMiseEnVente: project.date_mise_en_vente,
      restitutionStoragePath: project.restitution_storage_path || latestReport?.reportStoragePath || null,
      latestReportCode: latestReport?.code || null,
    };
  });

  return {
    restitutions: formattedReports,
    storiesProjects: formattedStoriesProjects,
  };
}
