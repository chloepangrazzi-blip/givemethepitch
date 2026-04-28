-- ============================================================
-- PHASE 14 - GEL V1 MAREE NOIRE / PREPARATION V2
-- ============================================================

begin;

alter table ops.campaigns
  add column if not exists frozen_at date,
  add column if not exists project_version text,
  add column if not exists form_version text,
  add column if not exists analyse_status text;

alter table ops.campaigns
  drop constraint if exists campaigns_status_check;

alter table ops.campaigns
  add constraint campaigns_status_check
  check (status in ('draft', 'scheduled', 'active', 'closed', 'archived', 'frozen'));

alter table ops.contact_engagement_status
  add column if not exists eligible_next_campaign boolean not null default false,
  add column if not exists access_level text;

alter table ops.contact_engagement_status
  drop constraint if exists contact_engagement_status_statut_engagement_check;

alter table ops.contact_engagement_status
  add constraint contact_engagement_status_statut_engagement_check
  check (
    statut_engagement in (
      'actif',
      'a_relancer',
      'passif',
      'inactif',
      'blackliste',
      'eligible_v2',
      'archived_v1_no_access'
    )
  );

create index if not exists contact_engagement_status_eligible_next_campaign_idx
  on ops.contact_engagement_status (eligible_next_campaign);

with v1_campaign as (
  select *
  from ops.campaigns
  where campagne_code = 'CP-00001'
  limit 1
)
update ops.campaigns c
set
  status = 'frozen',
  frozen_at = '2026-04-28'::date,
  end_at = '2026-04-28T00:00:00+02:00'::timestamptz,
  project_version = 'maree_noire_v1',
  form_version = 'signal_v1',
  analyse_status = 'locked'
from v1_campaign v1
where c.id = v1.id;

with v1_campaign as (
  select *
  from ops.campaigns
  where campagne_code = 'CP-00001'
  limit 1
)
insert into ops.campaigns (
  project_id,
  name,
  status,
  campaign_type,
  start_at,
  end_at,
  nda_version,
  notes,
  campagne_code,
  cible_campagne,
  canal_principal,
  project_version,
  form_version,
  analyse_status,
  frozen_at
)
select
  v1.project_id,
  'Room 01 — Marée Noire — V2',
  'draft',
  'scoring',
  '2026-05-04T00:00:00+02:00'::timestamptz,
  null,
  v1.nda_version,
  'Draft V2 prepared after V1 freeze.',
  'CP-00002',
  v1.cible_campagne,
  v1.canal_principal,
  'maree_noire_v2',
  'signal_v2',
  null,
  null
from v1_campaign v1
on conflict (campagne_code) do update
set
  project_id = excluded.project_id,
  name = excluded.name,
  status = excluded.status,
  campaign_type = excluded.campaign_type,
  start_at = excluded.start_at,
  end_at = excluded.end_at,
  nda_version = excluded.nda_version,
  notes = excluded.notes,
  cible_campagne = excluded.cible_campagne,
  canal_principal = excluded.canal_principal,
  project_version = excluded.project_version,
  form_version = excluded.form_version,
  analyse_status = excluded.analyse_status,
  frozen_at = excluded.frozen_at;

with v1_completed as (
  select
    e.id,
    e.contact_id,
    e.completed_at
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  join signal.test_responses tr on tr.enrolment_id = e.id
  where c.campagne_code = 'CP-00001'
    and e.completed_at is not null
)
update ops.enrolments e
set
  status = 'completed',
  parcours_complet = true,
  date_derniere_activite = coalesce(e.date_derniere_activite, e.completed_at)
from v1_completed vc
where e.id = vc.id;

with v1_completed as (
  select
    e.contact_id,
    max(e.completed_at) as completed_at
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  join signal.test_responses tr on tr.enrolment_id = e.id
  where c.campagne_code = 'CP-00001'
    and e.completed_at is not null
  group by e.contact_id
)
insert into ops.contact_engagement_status (
  contact_id,
  statut_engagement,
  derniere_action,
  date_derniere_action,
  parcours_complet,
  nombre_tests,
  a_relancer,
  eligible_next_campaign
)
select
  vc.contact_id,
  'actif',
  'test_complete',
  vc.completed_at,
  true,
  1,
  false,
  false
from v1_completed vc
on conflict (contact_id) do update
set
  statut_engagement = 'actif',
  derniere_action = 'test_complete',
  date_derniere_action = excluded.date_derniere_action,
  parcours_complet = true,
  nombre_tests = greatest(coalesce(ops.contact_engagement_status.nombre_tests, 0), 1),
  a_relancer = false,
  eligible_next_campaign = false;

with v1_completed as (
  select distinct e.contact_id
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  join signal.test_responses tr on tr.enrolment_id = e.id
  where c.campagne_code = 'CP-00001'
    and e.completed_at is not null
)
update core.contacts c
set status = 'active'
from v1_completed vc
where c.id = vc.contact_id;

with v1_nda_only as (
  select
    e.contact_id,
    max(e.nda_accepted_at) as nda_accepted_at
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  where c.campagne_code = 'CP-00001'
    and e.nda_accepted_at is not null
    and e.completed_at is null
  group by e.contact_id
)
update core.contacts c
set status = 'active'
from v1_nda_only v2
where c.id = v2.contact_id;

with v1_nda_only as (
  select
    e.contact_id,
    max(e.nda_accepted_at) as nda_accepted_at
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  where c.campagne_code = 'CP-00001'
    and e.nda_accepted_at is not null
    and e.completed_at is null
  group by e.contact_id
)
insert into ops.contact_engagement_status (
  contact_id,
  statut_engagement,
  derniere_action,
  date_derniere_action,
  parcours_complet,
  a_relancer,
  eligible_next_campaign,
  access_level
)
select
  v2.contact_id,
  'eligible_v2',
  'nda_signee',
  v2.nda_accepted_at,
  false,
  false,
  true,
  'access_granted'
from v1_nda_only v2
on conflict (contact_id) do update
set
  statut_engagement = 'eligible_v2',
  a_relancer = false,
  eligible_next_campaign = true,
  access_level = 'access_granted',
  parcours_complet = false;

with v1_archived as (
  select e.contact_id
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  where c.campagne_code = 'CP-00001'
    and e.completed_at is null
    and e.nda_accepted_at is null
)
update core.contacts c
set status = 'inactive'
from v1_archived v1a
where c.id = v1a.contact_id;

with v1_archived as (
  select e.contact_id
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  where c.campagne_code = 'CP-00001'
    and e.completed_at is null
    and e.nda_accepted_at is null
)
insert into ops.contact_engagement_status (
  contact_id,
  statut_engagement,
  a_relancer,
  eligible_next_campaign,
  access_level
)
select
  v1a.contact_id,
  'archived_v1_no_access',
  false,
  false,
  null
from v1_archived v1a
on conflict (contact_id) do update
set
  statut_engagement = 'archived_v1_no_access',
  a_relancer = false,
  eligible_next_campaign = false,
  access_level = null;

create or replace view public.v_current_campaign_dashboard as
with campaign_rollup as (
  select
    c.id,
    c.campagne_code as code_campagne,
    c.name as campagne,
    p.projet_code as code_projet,
    p.name as projet,
    c.status as statut_campagne,
    c.project_version,
    c.form_version,
    c.analyse_status,
    c.start_at,
    c.end_at,
    count(distinct e.contact_id) as panel_invite,
    count(distinct case when e.nda_accepted_at is not null then e.contact_id end) as nda_signes,
    count(distinct case when e.completed_at is not null then e.contact_id end) as tests_completes,
    count(distinct case when ces.eligible_next_campaign then e.contact_id end) as eligible_v2_contacts
  from ops.campaigns c
  left join catalog.projects p on p.id = c.project_id
  left join ops.enrolments e on e.campaign_id = c.id
  left join ops.contact_engagement_status ces on ces.contact_id = e.contact_id
  where c.status in ('draft', 'active')
  group by c.id, p.id
)
select
  code_campagne,
  campagne,
  code_projet,
  projet,
  statut_campagne,
  project_version,
  form_version,
  analyse_status,
  to_char(start_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut,
  to_char(end_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin,
  panel_invite,
  nda_signes,
  tests_completes,
  eligible_v2_contacts
from campaign_rollup
order by code_campagne;

create or replace view public.v_v1_archive_dashboard as
with archive_rollup as (
  select
    c.campagne_code as code_campagne,
    c.name as campagne,
    p.projet_code as code_projet,
    p.name as projet,
    c.status as statut_campagne,
    c.project_version,
    c.form_version,
    c.analyse_status,
    c.frozen_at,
    c.start_at,
    c.end_at,
    count(distinct e.contact_id) as panel_invite,
    count(distinct case when e.nda_accepted_at is not null then e.contact_id end) as nda_signes,
    count(distinct case when e.completed_at is not null then e.contact_id end) as tests_completes,
    count(distinct case when ces.eligible_next_campaign then e.contact_id end) as eligible_v2_contacts,
    count(distinct case when ces.statut_engagement = 'archived_v1_no_access' then e.contact_id end) as archived_v1_no_access
  from ops.campaigns c
  join catalog.projects p on p.id = c.project_id
  left join ops.enrolments e on e.campaign_id = c.id
  left join ops.contact_engagement_status ces on ces.contact_id = e.contact_id
  where c.campagne_code = 'CP-00001'
  group by c.id, p.id
)
select
  code_campagne,
  campagne,
  code_projet,
  projet,
  statut_campagne,
  project_version,
  form_version,
  analyse_status,
  frozen_at,
  to_char(start_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut,
  to_char(end_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin,
  panel_invite,
  nda_signes,
  tests_completes,
  eligible_v2_contacts,
  archived_v1_no_access
from archive_rollup;

create or replace view public.v_eligible_v2_contacts as
select
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.email,
  camp.campagne_code as code_campagne,
  camp.name as campagne,
  p.projet_code as code_projet,
  p.name as projet,
  camp.project_version,
  camp.form_version,
  e.participation_code as code_participation,
  e.access_code as cle_acces,
  e.status as statut_participation,
  to_char(e.nda_accepted_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as nda_signe_le,
  ces.statut_engagement,
  ces.derniere_action,
  ces.eligible_next_campaign,
  ces.access_level
from ops.enrolments e
join ops.campaigns camp on camp.id = e.campaign_id
join catalog.projects p on p.id = camp.project_id
join core.contacts c on c.id = e.contact_id
left join ops.contact_engagement_status ces on ces.contact_id = c.id
where camp.campagne_code = 'CP-00001'
  and e.completed_at is null
  and e.nda_accepted_at is not null
  and coalesce(ces.eligible_next_campaign, false) = true
order by c.contact_code;

create or replace view public.v_late_v1_responses as
select
  tr.reponse_test_code as code_test,
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.email,
  camp.campagne_code as code_campagne,
  camp.name as campagne,
  camp.frozen_at,
  tr.submitted_at as date_soumission_utc,
  to_char(tr.submitted_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_soumission,
  true as late_response_v1
from signal.test_responses tr
join ops.enrolments e on e.id = tr.enrolment_id
join ops.campaigns camp on camp.id = e.campaign_id
join core.contacts c on c.id = e.contact_id
where camp.campagne_code = 'CP-00001'
  and camp.frozen_at is not null
  and (tr.submitted_at at time zone 'Europe/Paris')::date >= camp.frozen_at
order by tr.submitted_at desc;

create or replace view "03_pilot_signal"."11_campagnes_scoring_phase11" as
select *
from pilot_signal.campagnes_scoring_phase11
where statut_campagne in ('draft', 'active');

create or replace view "01_pilot_contacts"."11_suivi_panelistes_phase11" as
select *
from pilot_contacts.suivi_panelistes_phase11
where coalesce(statut_engagement, '') <> 'archived_v1_no_access';

commit;
