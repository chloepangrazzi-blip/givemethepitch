create extension if not exists pgcrypto;

-- ============================================================
-- PHASE 3 - CORRECTIONS DE SCHEMA / NOUVELLES TABLES / MIGRATIONS
-- ============================================================

create sequence if not exists public.role_contact_code_seq;
create sequence if not exists public.project_file_code_seq;
create sequence if not exists public.access_card_code_seq;
create sequence if not exists public.cta_tracking_code_seq;
create sequence if not exists public.performance_sociale_code_seq;

-- ------------------------------------------------------------
-- BUG 2 - corriger le trigger des roles contacts
-- ------------------------------------------------------------
create or replace function public.assign_role_contact_code()
returns trigger
language plpgsql
as $$
begin
  if new.role_contact_code is null then
    new.role_contact_code := public.code_lisible('RC', nextval('public.role_contact_code_seq'));
  end if;
  return new;
end;
$$;

update core.contact_roles
set role_contact_code = public.code_lisible('RC', nextval('public.role_contact_code_seq'))
where role_contact_code is null;

-- ------------------------------------------------------------
-- BUG 4 / BUG 7 - checks et backfills
-- ------------------------------------------------------------
alter table ops.campaigns
  alter column project_id drop not null;

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

alter table ops.enrolments drop constraint if exists enrolments_status_check;
alter table ops.enrolments
  add constraint enrolments_status_check
  check (status in ('invited', 'access_granted', 'started', 'nda_signed', 'completed', 'declined', 'expired'));

update ops.enrolments
set status = 'nda_signed'
where nda_accepted = true
  and completed_at is null
  and status in ('invited', 'access_granted', 'started');

alter table ops.campaigns drop constraint if exists campaigns_campaign_type_check;
alter table ops.campaigns
  add constraint campaigns_campaign_type_check
  check (campaign_type in ('panel_test', 'the_room_session_01', 'recrutement', 'scoring', 'vente'));

update ops.campaigns
set campaign_type = 'scoring'
where campaign_type = 'the_room_session_01';

-- ------------------------------------------------------------
-- Champs supplementaires phase 3
-- ------------------------------------------------------------
alter table ops.enrolments
  add column if not exists reponse_invitation text
    check (reponse_invitation in ('oui', 'non_cette_fois', 'non_definitif'));

alter table ops.contact_engagement_status
  add column if not exists nombre_absences integer not null default 0,
  add column if not exists absences_consecutives integer not null default 0;

-- ------------------------------------------------------------
-- Nouvelles tables phase 3
-- ------------------------------------------------------------
create table if not exists catalog.project_files (
  id uuid primary key default gen_random_uuid(),
  fichier_code text unique,
  projet_id uuid not null references catalog.projects(id) on delete cascade,
  type_fichier text not null check (type_fichier in ('texte_pdf', 'visuel_jpeg', 'visuel_png', 'moodboard', 'autre')),
  url text not null,
  nom_fichier text not null,
  taille integer,
  uploaded_by uuid references core.contacts(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists ops.access_cards (
  id uuid primary key default gen_random_uuid(),
  carte_code text unique,
  numero text not null unique,
  contact_id uuid references core.contacts(id) on delete set null,
  campaign_id uuid references ops.campaigns(id) on delete set null,
  profile_type text not null check (profile_type in ('agent', 'producteur')),
  cle_acces text not null unique,
  envoyee_le date,
  activee_le timestamptz,
  expire_le timestamptz,
  statut text not null default 'envoyee' check (statut in ('envoyee', 'activee', 'expiree')),
  notes text,
  created_at timestamptz not null default now()
);

create schema if not exists analytics;

create table if not exists analytics.cta_tracking (
  id uuid primary key default gen_random_uuid(),
  tracking_code text unique,
  projet_id uuid references catalog.projects(id) on delete cascade,
  campagne_id uuid references ops.campaigns(id) on delete cascade,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  clics_entrants integer not null default 0,
  parcours_completes integer not null default 0,
  parcours_abandonnes integer not null default 0,
  taux_conversion numeric(5,2) generated always as (
    case
      when clics_entrants = 0 then 0
      else round((parcours_completes::numeric / clics_entrants::numeric) * 100, 2)
    end
  ) stored,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analytics.social_performances (
  like ops.social_performances including all
);

-- ------------------------------------------------------------
-- Codes lisibles et backfills
-- ------------------------------------------------------------
update catalog.project_files
set fichier_code = public.code_lisible('PF', nextval('public.project_file_code_seq'))
where fichier_code is null;

update ops.access_cards
set carte_code = public.code_lisible('CA', nextval('public.access_card_code_seq'))
where carte_code is null;

update analytics.cta_tracking
set tracking_code = public.code_lisible('UT', nextval('public.cta_tracking_code_seq'))
where tracking_code is null;

insert into analytics.social_performances
select *
from ops.social_performances
on conflict do nothing;

update analytics.social_performances
set performance_sociale_code = public.code_lisible('SM', nextval('public.performance_sociale_code_seq'))
where performance_sociale_code is null;

alter table catalog.project_files alter column fichier_code set not null;
alter table ops.access_cards alter column carte_code set not null;
alter table analytics.cta_tracking alter column tracking_code set not null;

create unique index if not exists project_files_fichier_code_idx on catalog.project_files (fichier_code);
create unique index if not exists access_cards_carte_code_idx on ops.access_cards (carte_code);
create unique index if not exists cta_tracking_tracking_code_idx on analytics.cta_tracking (tracking_code);
create unique index if not exists analytics_social_performances_code_idx on analytics.social_performances (performance_sociale_code);

create or replace function public.assign_project_file_code()
returns trigger
language plpgsql
as $$
begin
  if new.fichier_code is null then
    new.fichier_code := public.code_lisible('PF', nextval('public.project_file_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_access_card_code()
returns trigger
language plpgsql
as $$
begin
  if new.carte_code is null then
    new.carte_code := public.code_lisible('CA', nextval('public.access_card_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_cta_tracking_code()
returns trigger
language plpgsql
as $$
begin
  if new.tracking_code is null then
    new.tracking_code := public.code_lisible('UT', nextval('public.cta_tracking_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_performance_sociale_code()
returns trigger
language plpgsql
as $$
begin
  if new.performance_sociale_code is null then
    new.performance_sociale_code := public.code_lisible('SM', nextval('public.performance_sociale_code_seq'));
  end if;
  return new;
end;
$$;

drop trigger if exists set_project_file_code on catalog.project_files;
create trigger set_project_file_code
before insert on catalog.project_files
for each row execute function public.assign_project_file_code();

drop trigger if exists set_access_card_code on ops.access_cards;
create trigger set_access_card_code
before insert on ops.access_cards
for each row execute function public.assign_access_card_code();

drop trigger if exists set_cta_tracking_code on analytics.cta_tracking;
create trigger set_cta_tracking_code
before insert on analytics.cta_tracking
for each row execute function public.assign_cta_tracking_code();

drop trigger if exists set_updated_at_cta_tracking on analytics.cta_tracking;
create trigger set_updated_at_cta_tracking
before update on analytics.cta_tracking
for each row execute function public.set_updated_at();

drop trigger if exists set_performance_sociale_code on analytics.social_performances;
create trigger set_performance_sociale_code
before insert on analytics.social_performances
for each row execute function public.assign_performance_sociale_code();

drop trigger if exists set_updated_at_social_performances on analytics.social_performances;
create trigger set_updated_at_social_performances
before update on analytics.social_performances
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Vues corrigees apres normalisation des types de campagne
-- ------------------------------------------------------------
create or replace view public.vue_performance_sociale as
select
  sp.performance_sociale_code as code_social,
  p.name as projet,
  c.name as campagne,
  sp.plateforme,
  sp.type_contenu,
  sp.source_sociale,
  to_char(sp.date_publication at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_publication,
  sp.vues,
  sp.portee,
  sp.watch_time_moyen,
  sp.completion_rate,
  sp.clics,
  sp.likes,
  sp.commentaires,
  sp.partages,
  sp.sauvegardes,
  sp.cout_media
from analytics.social_performances sp
left join catalog.projects p on p.id = sp.projet_id
left join ops.campaigns c on c.id = sp.campagne_id;

create or replace view public.vue_campagnes_recrutement as
select *
from public.vue_campagnes
where type_campagne = 'recrutement';

create or replace view public.vue_campagnes_scoring as
select *
from public.vue_campagnes
where type_campagne = 'scoring';

create or replace view public.vue_campagnes_vente as
select *
from public.vue_campagnes
where type_campagne = 'vente';

-- ------------------------------------------------------------
-- Notes de migration manuelle ulterieure
-- ------------------------------------------------------------
-- core.contacts.contact_kind a supprimer apres branchement complet de core.contact_roles
-- catalog.projects.status a supprimer apres bascule complete vers statut_projet
