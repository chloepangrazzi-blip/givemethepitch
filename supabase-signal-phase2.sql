create extension if not exists pgcrypto;

-- ============================================================
-- PHASE 2 - ENRICHISSEMENT BUSINESS / STORIES / SIGNAL
-- Compatible avec la V1 existante
-- ============================================================

-- ------------------------------------------------------------
-- ENUMS / CHECKS SOUPLES VIA TEXT
-- ------------------------------------------------------------
-- On garde des colonnes text + check pour rester simples et souples.

-- ------------------------------------------------------------
-- CONTACTS
-- ------------------------------------------------------------
create sequence if not exists public.role_contact_code_seq;
create sequence if not exists public.performance_sociale_code_seq;
create sequence if not exists public.engagement_code_seq;
create sequence if not exists public.story_sale_code_seq;
create sequence if not exists public.project_interest_code_seq;

alter table core.contacts
  add column if not exists origin_initiale text
    check (origin_initiale in ('contact_direct', 'reseaux_sociaux_organiques', 'reseaux_sociaux_paid')),
  add column if not exists source_detail text,
  add column if not exists company_name text,
  add column if not exists website_url text,
  add column if not exists notes_contact text;

create table if not exists core.contact_roles (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references core.contacts(id) on delete cascade,
  role text not null check (role in ('paneliste', 'producteur', 'agent', 'scenariste')),
  actif boolean not null default true,
  date_debut timestamptz,
  date_fin timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contact_id, role)
);

alter table core.contact_roles add column if not exists role_contact_code text;
update core.contact_roles
set role_contact_code = public.code_lisible('RC', nextval('public.role_contact_code_seq'))
where role_contact_code is null;

create unique index if not exists contact_roles_role_contact_code_idx on core.contact_roles(role_contact_code);
create index if not exists contact_roles_contact_id_idx on core.contact_roles(contact_id);
create index if not exists contact_roles_role_idx on core.contact_roles(role);

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

drop trigger if exists set_role_contact_code on core.contact_roles;
create trigger set_role_contact_code
before insert on core.contact_roles
for each row execute function public.assign_role_contact_code();

create trigger set_updated_at_contact_roles
before update on core.contact_roles
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- PROJETS
-- ------------------------------------------------------------
alter table catalog.projects
  add column if not exists origine_projet text
    check (origine_projet in ('stories', 'externe')),
  add column if not exists statut_projet text
    check (statut_projet in ('brouillon', 'en_scoring', 'en_vente', 'vendu', 'archive')),
  add column if not exists teaser_url text,
  add column if not exists moodboard_url text,
  add column if not exists bible_url text,
  add column if not exists synopsis_pilote_url text,
  add column if not exists pack_vente text
    check (pack_vente in ('starter', 'pro', 'ultimate')),
  add column if not exists date_mise_en_ligne timestamptz,
  add column if not exists date_debut_scoring timestamptz,
  add column if not exists date_fin_scoring timestamptz,
  add column if not exists date_mise_en_vente timestamptz,
  add column if not exists date_achat timestamptz,
  add column if not exists acheteur_contact_id uuid references core.contacts(id) on delete set null,
  add column if not exists acheteur_nom_snapshot text,
  add column if not exists acheteur_societe_snapshot text,
  add column if not exists contrat_licence_url text,
  add column if not exists demandeur_contact_id uuid references core.contacts(id) on delete set null,
  add column if not exists date_demande timestamptz,
  add column if not exists elements_fournis jsonb not null default '[]'::jsonb,
  add column if not exists contrat_source_url text,
  add column if not exists facture_url text,
  add column if not exists score_final_snapshot numeric(5,2);

update catalog.projects
set origine_projet = coalesce(origine_projet, 'stories')
where origine_projet is null;

-- ------------------------------------------------------------
-- CAMPAGNES
-- ------------------------------------------------------------
alter table ops.campaigns
  add column if not exists cible_campagne text
    check (cible_campagne in ('paneliste', 'producteur', 'agent', 'scenariste')),
  add column if not exists canal_principal text
    check (canal_principal in ('contact_direct', 'reseaux_sociaux_organiques', 'reseaux_sociaux_paid')),
  add column if not exists date_mise_en_ligne timestamptz,
  add column if not exists objectif text,
  add column if not exists budget_media numeric(12,2);

update ops.campaigns
set cible_campagne = coalesce(cible_campagne, case when campaign_type = 'the_room_session_01' then 'paneliste' else null end)
where cible_campagne is null;

update ops.campaigns
set canal_principal = coalesce(canal_principal, 'contact_direct')
where canal_principal is null;

-- ------------------------------------------------------------
-- PARTICIPATIONS / ENROLMENTS
-- ------------------------------------------------------------
alter table ops.enrolments
  add column if not exists canal_entree text
    check (canal_entree in ('contact_direct', 'reseaux_sociaux_organiques', 'reseaux_sociaux_paid')),
  add column if not exists parcours_complet boolean not null default false,
  add column if not exists date_derniere_activite timestamptz,
  add column if not exists nombre_reprises integer not null default 0,
  add column if not exists statut_engagement text
    check (statut_engagement in ('actif', 'a_relancer', 'passif', 'inactif', 'blackliste'));

update ops.enrolments
set parcours_complet = true
where completed_at is not null and parcours_complet = false;

update ops.enrolments
set date_derniere_activite = coalesce(date_derniere_activite, completed_at, started_at, invited_at, created_at)
where date_derniere_activite is null;

-- ------------------------------------------------------------
-- JOURNAL EVENEMENTS : enrichissement source / acquisition
-- ------------------------------------------------------------
alter table ops.events
  add column if not exists canal_action text
    check (canal_action in ('contact_direct', 'reseaux_sociaux_organiques', 'reseaux_sociaux_paid')),
  add column if not exists support_source text,
  add column if not exists campagne_source_id uuid references ops.campaigns(id) on delete set null;

-- ------------------------------------------------------------
-- PERFORMANCES SOCIALES
-- ------------------------------------------------------------
create table if not exists ops.social_performances (
  id uuid primary key default gen_random_uuid(),
  projet_id uuid references catalog.projects(id) on delete cascade,
  campagne_id uuid references ops.campaigns(id) on delete cascade,
  plateforme text not null,
  type_contenu text,
  publication_external_id text,
  date_publication timestamptz,
  source_sociale text not null check (source_sociale in ('reseaux_sociaux_organiques', 'reseaux_sociaux_paid')),
  vues integer,
  portee integer,
  watch_time_moyen numeric(10,2),
  completion_rate numeric(5,2),
  clics integer,
  likes integer,
  commentaires integer,
  partages integer,
  sauvegardes integer,
  cout_media numeric(12,2),
  payload_brut jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ops.social_performances add column if not exists performance_sociale_code text;
update ops.social_performances
set performance_sociale_code = public.code_lisible('SM', nextval('public.performance_sociale_code_seq'))
where performance_sociale_code is null;

create unique index if not exists social_performances_code_idx on ops.social_performances(performance_sociale_code);
create index if not exists social_performances_projet_idx on ops.social_performances(projet_id);
create index if not exists social_performances_campagne_idx on ops.social_performances(campagne_id);
create index if not exists social_performances_plateforme_idx on ops.social_performances(plateforme);

create trigger set_updated_at_social_performances
before update on ops.social_performances
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- ETAT CONTACTS / LECTURE SYNTHETIQUE
-- ------------------------------------------------------------
create table if not exists ops.contact_engagement_status (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null unique references core.contacts(id) on delete cascade,
  statut_engagement text check (statut_engagement in ('actif', 'a_relancer', 'passif', 'inactif', 'blackliste')),
  derniere_action text,
  date_derniere_action timestamptz,
  parcours_complet boolean not null default false,
  est_revenu boolean not null default false,
  nombre_campagnes integer not null default 0,
  nombre_tests integer not null default 0,
  nombre_abandons integer not null default 0,
  a_relancer boolean not null default false,
  blackliste boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ops.contact_engagement_status add column if not exists engagement_code text;
update ops.contact_engagement_status
set engagement_code = public.code_lisible('EG', nextval('public.engagement_code_seq'))
where engagement_code is null;

create unique index if not exists contact_engagement_status_code_idx on ops.contact_engagement_status(engagement_code);
create trigger set_updated_at_contact_engagement_status
before update on ops.contact_engagement_status
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- VENTES STORIES
-- ------------------------------------------------------------
create table if not exists reporting.story_sales (
  id uuid primary key default gen_random_uuid(),
  projet_id uuid not null references catalog.projects(id) on delete cascade,
  campagne_id uuid references ops.campaigns(id) on delete set null,
  acheteur_contact_id uuid references core.contacts(id) on delete set null,
  acheteur_nom_snapshot text,
  acheteur_societe_snapshot text,
  pack_vente text check (pack_vente in ('starter', 'pro', 'ultimate')),
  prix numeric(12,2),
  date_achat timestamptz,
  contrat_licence_url text,
  facture_url text,
  statut_vente text check (statut_vente in ('en_attente', 'payee', 'finalisee', 'annulee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reporting.story_sales add column if not exists vente_code text;
update reporting.story_sales
set vente_code = public.code_lisible('VT', nextval('public.story_sale_code_seq'))
where vente_code is null;

create unique index if not exists story_sales_vente_code_idx on reporting.story_sales(vente_code);
create index if not exists story_sales_projet_idx on reporting.story_sales(projet_id);
create trigger set_updated_at_story_sales
before update on reporting.story_sales
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- INTERETS PROJETS
-- ------------------------------------------------------------
create table if not exists ops.project_interests (
  id uuid primary key default gen_random_uuid(),
  projet_id uuid not null references catalog.projects(id) on delete cascade,
  contact_id uuid references core.contacts(id) on delete set null,
  type_interet text not null check (type_interet in ('consultation', 'interet')),
  date_interet timestamptz not null default now(),
  source text check (source in ('contact_direct', 'reseaux_sociaux_organiques', 'reseaux_sociaux_paid')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ops.project_interests add column if not exists interet_code text;
update ops.project_interests
set interet_code = public.code_lisible('IN', nextval('public.project_interest_code_seq'))
where interet_code is null;

create unique index if not exists project_interests_interet_code_idx on ops.project_interests(interet_code);
create index if not exists project_interests_projet_idx on ops.project_interests(projet_id);
create index if not exists project_interests_contact_idx on ops.project_interests(contact_id);
create trigger set_updated_at_project_interests
before update on ops.project_interests
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- VUES LISIBLES PHASE 2
-- ------------------------------------------------------------
create or replace view public.vue_contacts as
select
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.email,
  c.phone as telephone,
  c.city as ville,
  c.country as pays,
  c.company_name as societe,
  c.origin_initiale as origine_initiale,
  c.status as statut,
  array_remove(array_agg(distinct cr.role), null) as roles,
  to_char(c.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_creation
from core.contacts c
left join core.contact_roles cr on cr.contact_id = c.id and cr.actif = true
group by c.id;

create or replace view public.vue_producteurs as
select *
from public.vue_contacts
where roles @> array['producteur']::text[];

create or replace view public.vue_agents as
select *
from public.vue_contacts
where roles @> array['agent']::text[];

create or replace view public.vue_scenaristes as
select *
from public.vue_contacts
where roles @> array['scenariste']::text[];

create or replace view public.vue_projets_stories as
select
  p.projet_code as code_projet,
  p.name as projet,
  p.main_genre as genre_principal,
  p.secondary_genre as genre_secondaire,
  p.format,
  p.pack_vente,
  p.statut_projet,
  to_char(p.date_mise_en_ligne at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_mise_en_ligne,
  to_char(p.date_debut_scoring at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut_scoring,
  to_char(p.date_fin_scoring at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin_scoring,
  to_char(p.date_mise_en_vente at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_mise_en_vente,
  to_char(p.date_achat at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_achat,
  coalesce(p.acheteur_nom_snapshot, concat_ws(' ', acheteur.first_name, acheteur.last_name)) as acheteur,
  coalesce(p.acheteur_societe_snapshot, acheteur.company_name) as societe_acheteur,
  p.contrat_licence_url,
  p.teaser_url,
  p.moodboard_url,
  p.bible_url,
  p.synopsis_pilote_url,
  latest_report.desirability_score as score_signal
from catalog.projects p
left join core.contacts acheteur on acheteur.id = p.acheteur_contact_id
left join lateral (
  select sr.desirability_score
  from reporting.signal_reports sr
  join ops.campaigns c on c.id = sr.campaign_id
  where c.project_id = p.id
  order by coalesce(sr.generated_at, sr.created_at) desc, sr.created_at desc
  limit 1
) latest_report on true
where p.origine_projet = 'stories';

create or replace view public.vue_projets_externes as
select
  p.projet_code as code_projet,
  p.name as projet,
  p.main_genre as genre_principal,
  p.secondary_genre as genre_secondaire,
  p.format,
  p.statut_projet,
  coalesce(concat_ws(' ', d.first_name, d.last_name), p.acheteur_nom_snapshot) as demandeur,
  d.company_name as societe_demandeur,
  to_char(p.date_demande at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_demande,
  p.elements_fournis,
  p.contrat_source_url,
  p.facture_url,
  to_char(p.date_debut_scoring at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut_scoring,
  to_char(p.date_fin_scoring at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin_scoring,
  p.score_final_snapshot as score_signal
from catalog.projects p
left join core.contacts d on d.id = p.demandeur_contact_id
where p.origine_projet = 'externe';

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
from ops.social_performances sp
left join catalog.projects p on p.id = sp.projet_id
left join ops.campaigns c on c.id = sp.campagne_id;

create or replace view public.vue_etat_contacts as
select
  ces.engagement_code,
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  ces.statut_engagement,
  ces.derniere_action,
  to_char(ces.date_derniere_action at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_derniere_action,
  ces.parcours_complet,
  ces.est_revenu,
  ces.nombre_campagnes,
  ces.nombre_tests,
  ces.nombre_abandons,
  ces.a_relancer,
  ces.blackliste,
  ces.notes
from ops.contact_engagement_status ces
join core.contacts c on c.id = ces.contact_id;

create or replace view public.vue_ventes_stories as
select
  ss.vente_code,
  p.name as projet,
  coalesce(ss.acheteur_nom_snapshot, concat_ws(' ', c.first_name, c.last_name)) as acheteur,
  coalesce(ss.acheteur_societe_snapshot, c.company_name) as societe,
  ss.pack_vente,
  ss.prix,
  to_char(ss.date_achat at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_achat,
  ss.statut_vente,
  ss.contrat_licence_url,
  ss.facture_url
from reporting.story_sales ss
join catalog.projects p on p.id = ss.projet_id
left join core.contacts c on c.id = ss.acheteur_contact_id;

create or replace view public.vue_interets_projets as
select
  pi.interet_code,
  p.name as projet,
  concat_ws(' ', c.first_name, c.last_name) as contact,
  pi.type_interet,
  pi.source,
  to_char(pi.date_interet at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_interet,
  pi.notes
from ops.project_interests pi
join catalog.projects p on p.id = pi.projet_id
left join core.contacts c on c.id = pi.contact_id;
