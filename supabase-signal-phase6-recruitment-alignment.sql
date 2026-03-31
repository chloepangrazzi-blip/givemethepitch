create extension if not exists pgcrypto;
create schema if not exists analytics;

-- ============================================================
-- PHASE 6 - ALIGNEMENT RECRUTEMENT / PROFILS / RESTITUTION
-- Sépare les opérations de lancement direct, le recrutement
-- entrant, les profils et la couche de pilotage quotidienne.
-- ============================================================

create sequence if not exists public.profil_producteur_code_seq;
create sequence if not exists public.operation_lancement_code_seq;
create sequence if not exists public.recrutement_entrant_code_seq;

-- ------------------------------------------------------------
-- PROFILS PRODUCTEURS
-- ------------------------------------------------------------
create table if not exists core.producer_profiles (
  id uuid primary key default gen_random_uuid(),
  profil_producteur_code text unique,
  contact_id uuid not null unique references core.contacts(id) on delete cascade,
  genres_recherches text[] not null default '{}',
  formats_recherches text[] not null default '{}',
  preferences_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

update core.producer_profiles
set profil_producteur_code = public.code_lisible('PD', nextval('public.profil_producteur_code_seq'))
where profil_producteur_code is null;

alter table core.producer_profiles
  alter column profil_producteur_code set not null;

create unique index if not exists producer_profiles_code_idx
  on core.producer_profiles (profil_producteur_code);

create or replace function public.assign_profil_producteur_code()
returns trigger
language plpgsql
as $$
begin
  if new.profil_producteur_code is null then
    new.profil_producteur_code := public.code_lisible('PD', nextval('public.profil_producteur_code_seq'));
  end if;
  return new;
end;
$$;

drop trigger if exists set_profil_producteur_code on core.producer_profiles;
create trigger set_profil_producteur_code
before insert on core.producer_profiles
for each row execute function public.assign_profil_producteur_code();

drop trigger if exists set_updated_at_producer_profiles on core.producer_profiles;
create trigger set_updated_at_producer_profiles
before update on core.producer_profiles
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- OPERATIONS DE LANCEMENT DIRECT
-- ------------------------------------------------------------
create table if not exists ops.launch_operations (
  id uuid primary key default gen_random_uuid(),
  operation_lancement_code text unique,
  contact_id uuid references core.contacts(id) on delete set null,
  cible_role text not null check (cible_role in ('paneliste', 'producteur', 'agent')),
  canal text not null default 'contact_direct' check (canal = 'contact_direct'),
  support_lancement text not null check (support_lancement in ('email', 'carte')),
  nom_snapshot text,
  societe_snapshot text,
  email_snapshot text,
  pays_snapshot text default 'France',
  adresse_ligne_1 text,
  adresse_ligne_2 text,
  code_postal text,
  ville_envoi text,
  pays_envoi text default 'France',
  access_card_id uuid references ops.access_cards(id) on delete set null,
  envoye_le timestamptz,
  ouvert_le timestamptz,
  clique_le timestamptz,
  cle_activee_le timestamptz,
  formulaire_commence_le timestamptz,
  formulaire_termine_le timestamptz,
  statut_operation text not null default 'a_envoyer'
    check (statut_operation in (
      'a_envoyer',
      'envoyee',
      'ouverte',
      'cliquee',
      'cle_activee',
      'formulaire_commence',
      'inscription_terminee',
      'abandonnee',
      'expiree'
    )),
  relance_a_faire boolean not null default false,
  nombre_relances integer not null default 0,
  derniere_relance_le timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

update ops.launch_operations
set operation_lancement_code = public.code_lisible('OL', nextval('public.operation_lancement_code_seq'))
where operation_lancement_code is null;

alter table ops.launch_operations
  alter column operation_lancement_code set not null;

create unique index if not exists launch_operations_code_idx
  on ops.launch_operations (operation_lancement_code);
create index if not exists launch_operations_contact_id_idx
  on ops.launch_operations (contact_id);
create index if not exists launch_operations_role_idx
  on ops.launch_operations (cible_role);
create index if not exists launch_operations_status_idx
  on ops.launch_operations (statut_operation);

create or replace function public.assign_operation_lancement_code()
returns trigger
language plpgsql
as $$
begin
  if new.operation_lancement_code is null then
    new.operation_lancement_code := public.code_lisible('OL', nextval('public.operation_lancement_code_seq'));
  end if;
  return new;
end;
$$;

drop trigger if exists set_operation_lancement_code on ops.launch_operations;
create trigger set_operation_lancement_code
before insert on ops.launch_operations
for each row execute function public.assign_operation_lancement_code();

drop trigger if exists set_updated_at_launch_operations on ops.launch_operations;
create trigger set_updated_at_launch_operations
before update on ops.launch_operations
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RECRUTEMENT ENTRANT (RS / AUTRES ENTREES)
-- ------------------------------------------------------------
create table if not exists ops.recruitment_entries (
  id uuid primary key default gen_random_uuid(),
  recrutement_entrant_code text unique,
  contact_id uuid references core.contacts(id) on delete set null,
  role_vise text not null check (role_vise in ('paneliste', 'producteur', 'agent', 'scenariste')),
  canal_entree text not null
    check (canal_entree in ('reseaux_sociaux_organiques', 'reseaux_sociaux_paid')),
  source_detail text,
  page_entree text,
  cta_origine text,
  cta_tracking_id uuid references analytics.cta_tracking(id) on delete set null,
  email_capture text,
  parcours_commence_le timestamptz,
  inscription_terminee_le timestamptz,
  statut_entree text not null default 'arrivee_detectee'
    check (statut_entree in (
      'arrivee_detectee',
      'email_capture',
      'parcours_commence',
      'inscription_terminee',
      'abandonnee'
    )),
  relance_a_faire boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

update ops.recruitment_entries
set recrutement_entrant_code = public.code_lisible('RE', nextval('public.recrutement_entrant_code_seq'))
where recrutement_entrant_code is null;

alter table ops.recruitment_entries
  alter column recrutement_entrant_code set not null;

create unique index if not exists recruitment_entries_code_idx
  on ops.recruitment_entries (recrutement_entrant_code);
create index if not exists recruitment_entries_contact_id_idx
  on ops.recruitment_entries (contact_id);
create index if not exists recruitment_entries_role_idx
  on ops.recruitment_entries (role_vise);
create index if not exists recruitment_entries_canal_idx
  on ops.recruitment_entries (canal_entree);

create or replace function public.assign_recrutement_entrant_code()
returns trigger
language plpgsql
as $$
begin
  if new.recrutement_entrant_code is null then
    new.recrutement_entrant_code := public.code_lisible('RE', nextval('public.recrutement_entrant_code_seq'));
  end if;
  return new;
end;
$$;

drop trigger if exists set_recrutement_entrant_code on ops.recruitment_entries;
create trigger set_recrutement_entrant_code
before insert on ops.recruitment_entries
for each row execute function public.assign_recrutement_entrant_code();

drop trigger if exists set_updated_at_recruitment_entries on ops.recruitment_entries;
create trigger set_updated_at_recruitment_entries
before update on ops.recruitment_entries
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RESTITUTION : CAPA A RECEVOIR PANEL + SOCIAL + THE ROOM
-- ------------------------------------------------------------
alter table reporting.signal_reports
  add column if not exists social_insights jsonb not null default '{}'::jsonb,
  add column if not exists room_insights jsonb not null default '{}'::jsonb,
  add column if not exists social_summary text;

-- ------------------------------------------------------------
-- COUCHE PUBLIC : NETTOYAGE ET VUES DE PILOTAGE
-- ------------------------------------------------------------
drop view if exists public.campagnes__recrutement;
drop view if exists public.recrutement__cartes_acces;
drop view if exists public.contacts__panelistes;
drop view if exists public.contacts__producteurs;
drop view if exists public.contacts__agents;
drop view if exists public.contacts__scenaristes;
drop view if exists public.contacts__etat;
drop view if exists public.contacts__suivi;
drop view if exists public.profils__panelistes;
drop view if exists public.profils__producteurs;
drop view if exists public.lancement__panel;
drop view if exists public.lancement__producteurs;
drop view if exists public.lancement__agents;
drop view if exists public.recrutement__entrant;
drop view if exists public.signal__restitutions;

create or replace view public.contacts__panelistes as
select
  ct.code_contact,
  ct.nom_complet,
  ct.email,
  ct.pays,
  ct.canal_entree_initial,
  ct.statut_contact,
  ct.date_creation
from public.contacts__tous ct
join core.contacts c on c.contact_code = ct.code_contact
left join core.panel_profiles pp on pp.contact_id = c.id
left join core.contact_roles cr on cr.contact_id = c.id and cr.actif = true and cr.role = 'paneliste'
where pp.id is not null or cr.id is not null;

create or replace view public.contacts__producteurs as
select
  ct.code_contact,
  ct.nom_complet,
  ct.societe,
  ct.email,
  ct.pays,
  ct.canal_entree_initial,
  ct.statut_contact,
  ct.date_creation
from public.contacts__tous ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'producteur';

create or replace view public.contacts__agents as
select
  ct.code_contact,
  ct.nom_complet,
  ct.societe,
  ct.email,
  ct.pays,
  ct.canal_entree_initial,
  ct.statut_contact,
  ct.date_creation
from public.contacts__tous ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'agent';

create or replace view public.contacts__scenaristes as
select
  ct.code_contact,
  ct.nom_complet,
  ct.societe,
  ct.email,
  ct.pays,
  ct.canal_entree_initial,
  ct.statut_contact,
  ct.date_creation
from public.contacts__tous ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'scenariste';

create or replace view public.contacts__suivi as
select
  ces.engagement_code as code_engagement,
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.company_name as societe,
  c.origin_initiale as canal_entree_initial,
  trim(both ', ' from concat_ws(
    ', ',
    case
      when (
        (pp.id is not null or c.contact_kind = 'panelist')
        and not exists (
          select 1
          from core.contact_roles crp
          where crp.contact_id = c.id
            and crp.actif = true
            and crp.role = 'paneliste'
        )
      ) then 'paneliste'
      else null
    end,
    (
      select string_agg(cr.role, ', ' order by cr.role)
      from core.contact_roles cr
      where cr.contact_id = c.id
        and cr.actif = true
    )
  )) as roles_actifs,
  ces.statut_engagement,
  ces.derniere_action,
  to_char(ces.date_derniere_action at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_derniere_action,
  ces.parcours_complet,
  ces.est_revenu,
  ces.nombre_campagnes,
  ces.nombre_tests,
  ces.nombre_abandons,
  ces.nombre_absences,
  ces.absences_consecutives,
  ces.a_relancer,
  ces.blackliste,
  ces.notes
from ops.contact_engagement_status ces
join core.contacts c on c.id = ces.contact_id
left join core.panel_profiles pp on pp.contact_id = c.id;

create or replace view public.profils__panelistes as
select
  pp.profil_paneliste_code as code_profil,
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.email,
  pp.age_band as tranche_age,
  pp.gender as genre,
  pp.viewing_frequency as frequence_visionnage,
  array_to_string(pp.platforms, ', ') as plateformes,
  array_to_string(pp.liked_genres, ', ') as genres_aimes,
  pp.main_genre as genre_principal,
  pp.french_series_perception as perception_series_francaises,
  pp.french_series_reason as raison_perception_series_francaises,
  pp.recommendation_frequency as frequence_recommandation,
  to_char(pp.updated_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_mise_a_jour
from core.panel_profiles pp
join core.contacts c on c.id = pp.contact_id;

create or replace view public.profils__producteurs as
select
  pp.profil_producteur_code as code_profil,
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.company_name as societe,
  c.email,
  array_to_string(pp.genres_recherches, ', ') as genres_recherches,
  array_to_string(pp.formats_recherches, ', ') as formats_recherches,
  pp.preferences_payload as preferences_complementaires,
  to_char(pp.updated_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_mise_a_jour
from core.producer_profiles pp
join core.contacts c on c.id = pp.contact_id;

create or replace view public.lancement__panel as
select
  lo.operation_lancement_code as code_operation,
  coalesce(c.contact_code, null) as code_contact,
  coalesce(concat_ws(' ', c.first_name, c.last_name), lo.nom_snapshot) as nom_complet,
  coalesce(c.email, lo.email_snapshot) as email,
  lo.canal,
  lo.support_lancement as support,
  to_char(lo.envoye_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_envoi,
  to_char(lo.ouvert_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_ouverture,
  to_char(lo.clique_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_clic,
  to_char(lo.formulaire_commence_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_questionnaire_commence,
  to_char(lo.formulaire_termine_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_questionnaire_termine,
  lo.statut_operation,
  lo.nombre_relances,
  lo.relance_a_faire
from ops.launch_operations lo
left join core.contacts c on c.id = lo.contact_id
where lo.cible_role = 'paneliste';

create or replace view public.lancement__producteurs as
select
  lo.operation_lancement_code as code_operation,
  coalesce(c.contact_code, null) as code_contact,
  coalesce(concat_ws(' ', c.first_name, c.last_name), lo.nom_snapshot) as nom_complet,
  coalesce(c.company_name, lo.societe_snapshot) as societe,
  coalesce(c.email, lo.email_snapshot) as email,
  ac.carte_code as code_carte,
  ac.numero as numero_carte,
  ac.cle_acces,
  to_char(lo.envoye_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_envoi,
  to_char(ac.activee_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_activation_cle,
  to_char(lo.formulaire_termine_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_inscription,
  lo.statut_operation,
  lo.nombre_relances,
  lo.relance_a_faire
from ops.launch_operations lo
left join core.contacts c on c.id = lo.contact_id
left join ops.access_cards ac on ac.id = lo.access_card_id
where lo.cible_role = 'producteur';

create or replace view public.lancement__agents as
select
  lo.operation_lancement_code as code_operation,
  coalesce(c.contact_code, null) as code_contact,
  coalesce(concat_ws(' ', c.first_name, c.last_name), lo.nom_snapshot) as nom_complet,
  coalesce(c.company_name, lo.societe_snapshot) as societe,
  coalesce(c.email, lo.email_snapshot) as email,
  ac.carte_code as code_carte,
  ac.numero as numero_carte,
  ac.cle_acces,
  to_char(lo.envoye_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_envoi,
  to_char(ac.activee_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_activation_cle,
  to_char(lo.formulaire_termine_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_inscription,
  lo.statut_operation,
  lo.nombre_relances,
  lo.relance_a_faire
from ops.launch_operations lo
left join core.contacts c on c.id = lo.contact_id
left join ops.access_cards ac on ac.id = lo.access_card_id
where lo.cible_role = 'agent';

create or replace view public.recrutement__entrant as
select
  re.recrutement_entrant_code as code_entree,
  re.role_vise,
  re.canal_entree,
  re.source_detail,
  re.page_entree,
  re.cta_origine,
  re.email_capture,
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  to_char(re.parcours_commence_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_parcours_commence,
  to_char(re.inscription_terminee_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_inscription_terminee,
  re.statut_entree,
  re.relance_a_faire
from ops.recruitment_entries re
left join core.contacts c on c.id = re.contact_id;

create or replace view public.signal__restitutions as
select
  sr.restitution_code as code_restitution,
  camp.campagne_code as code_campagne,
  camp.name as campagne,
  p.projet_code as code_projet,
  p.name as projet,
  sr.status as statut_restitution,
  sr.sample_size as taille_echantillon,
  sr.desirability_score as score_global,
  sr.hook_score as hook,
  sr.feel_score as feel,
  sr.care_score as care,
  sr.continue_score as continue,
  sr.share_score as share,
  sr.segment_insights as insights_segments,
  sr.social_insights as insights_sociaux,
  sr.room_insights as insights_the_room,
  sr.strengths_summary as points_forts,
  sr.weaknesses_summary as points_de_friction,
  sr.qualitative_summary as synthese_qualitative,
  sr.social_summary as synthese_sociale,
  sr.executive_summary as synthese,
  sr.aggregates_payload as donnees_agregees,
  to_char(coalesce(sr.generated_at, sr.created_at) at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_generation
from reporting.signal_reports sr
join ops.campaigns camp on camp.id = sr.campaign_id
join catalog.projects p on p.id = camp.project_id;
