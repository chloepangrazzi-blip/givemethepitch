-- ============================================================
-- PHASE 4 - ASSAINISSEMENT DES CAMPAGNES ET VUES DE PILOTAGE
-- Corrige l'erreur de modèle : une campagne de recrutement
-- n'a pas à porter un project_id.
-- ============================================================

alter table ops.campaigns
  alter column project_id drop not null;

alter table ops.access_cards
  add column if not exists campaign_id uuid references ops.campaigns(id) on delete set null;

create index if not exists access_cards_campaign_id_idx on ops.access_cards (campaign_id);

alter table ops.campaigns
  drop constraint if exists campaigns_project_scope_check;

alter table ops.campaigns
  add constraint campaigns_project_scope_check
  check (
    (
      campaign_type = 'recrutement'
      and project_id is null
    )
    or (
      campaign_type in ('panel_test', 'the_room_session_01', 'scoring', 'vente')
      and project_id is not null
    )
  );

drop view if exists public.vue_campagnes_recrutement;
drop view if exists public.vue_campagnes_scoring;
drop view if exists public.vue_campagnes_vente;
drop view if exists public.vue_campagnes;

create or replace view public.vue_campagnes as
select
  c.campagne_code as code_campagne,
  c.name as campagne,
  c.campaign_type as type_campagne,
  c.cible_campagne as cible,
  c.canal_principal,
  c.status as statut_campagne,
  c.objectif,
  to_char(c.date_mise_en_ligne at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_mise_en_ligne,
  to_char(c.start_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut,
  to_char(c.end_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin
from ops.campaigns c;

create or replace view public.vue_campagnes_recrutement as
select
  c.campagne_code as code_campagne,
  c.name as campagne,
  c.cible_campagne as cible,
  c.canal_principal,
  c.status as statut_campagne,
  c.objectif,
  to_char(c.start_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut,
  to_char(c.end_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin,
  count(distinct e.id) as participants,
  count(distinct ac.id) as cartes_acces,
  count(distinct case when e.access_granted then e.id end) as cles_envoyees,
  count(distinct case when e.reponse_invitation = 'oui' then e.id end) as reponses_oui,
  count(distinct case when e.reponse_invitation = 'non_cette_fois' then e.id end) as reponses_non_cette_fois,
  count(distinct case when e.reponse_invitation = 'non_definitif' then e.id end) as reponses_non_definitif,
  count(distinct case when e.started_at is not null then e.id end) as parcours_demarres,
  count(distinct case when e.parcours_complet then e.id end) as parcours_completes
from ops.campaigns c
left join ops.enrolments e on e.campaign_id = c.id
left join ops.access_cards ac on ac.campaign_id = c.id
where c.campaign_type = 'recrutement'
group by c.id;

create or replace view public.vue_campagnes_scoring as
select
  c.campagne_code as code_campagne,
  c.name as campagne,
  p.projet_code as code_projet,
  p.name as projet,
  c.canal_principal,
  c.status as statut_campagne,
  c.objectif,
  c.nda_version as version_nda,
  to_char(c.date_mise_en_ligne at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_mise_en_ligne,
  to_char(c.start_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut,
  to_char(c.end_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin,
  count(distinct e.id) as panel_invite,
  count(distinct case when e.nda_accepted then e.id end) as nda_signes,
  count(distinct case when e.completed_at is not null then e.id end) as tests_completes,
  scores.desirability_score as score_signal_moyen
from ops.campaigns c
join catalog.projects p on p.id = c.project_id
left join ops.enrolments e on e.campaign_id = c.id
left join analytics.v_campaign_signal_scores scores on scores.campaign_id = c.id
where c.campaign_type in ('panel_test', 'the_room_session_01', 'scoring')
group by c.id, p.id, scores.desirability_score;

create or replace view public.vue_campagnes_vente as
select
  c.campagne_code as code_campagne,
  c.name as campagne,
  p.projet_code as code_projet,
  p.name as projet,
  c.canal_principal,
  c.status as statut_campagne,
  c.objectif,
  to_char(c.date_mise_en_ligne at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_mise_en_ligne,
  to_char(c.start_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut,
  to_char(c.end_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin,
  count(distinct case when pi.type_interet = 'consultation' then pi.id end) as consultations,
  count(distinct case when pi.type_interet = 'interet' then pi.id end) as interets,
  count(distinct ss.id) as ventes,
  coalesce(sum(ss.prix), 0)::numeric(12,2) as chiffre_affaires
from ops.campaigns c
join catalog.projects p on p.id = c.project_id
left join ops.project_interests pi on pi.projet_id = p.id
left join reporting.story_sales ss on ss.campagne_id = c.id
where c.campaign_type = 'vente'
group by c.id, p.id;
