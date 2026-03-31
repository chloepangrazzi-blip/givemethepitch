create schema if not exists "01_pilot_contacts";
create schema if not exists "02_pilot_recrutement";
create schema if not exists "03_pilot_signal";
create schema if not exists "04_pilot_projets";
create schema if not exists "05_pilot_vente";

-- ------------------------------------------------------------
-- 01 PILOT CONTACTS
-- ------------------------------------------------------------
create or replace view "01_pilot_contacts"."01_contacts" as
select * from pilot_contacts.contacts;

create or replace view "01_pilot_contacts"."02_panelistes" as
select * from pilot_contacts.panelistes;

create or replace view "01_pilot_contacts"."03_producteurs" as
select * from pilot_contacts.producteurs;

create or replace view "01_pilot_contacts"."04_agents" as
select * from pilot_contacts.agents;

create or replace view "01_pilot_contacts"."05_scenaristes" as
select * from pilot_contacts.scenaristes;

create or replace view "01_pilot_contacts"."06_suivi" as
select * from pilot_contacts.suivi;

create or replace view "01_pilot_contacts"."07_suivi_panelistes" as
select
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.email,
  c.origin_initiale as canal_entree_initial,
  c.status as statut_contact,
  ces.statut_engagement,
  ces.derniere_action,
  to_char(ces.date_derniere_action at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_derniere_action,
  ces.nombre_tests,
  ces.nombre_abandons,
  ces.nombre_absences,
  ces.absences_consecutives,
  ces.a_relancer,
  ces.blackliste,
  to_char(c.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_creation
from core.contacts c
join core.panel_profiles pp on pp.contact_id = c.id
left join ops.contact_engagement_status ces on ces.contact_id = c.id;

create or replace view "01_pilot_contacts"."08_suivi_producteurs" as
select
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.company_name as societe,
  c.email,
  c.origin_initiale as canal_entree_initial,
  c.status as statut_contact,
  ces.statut_engagement,
  to_char(ces.date_derniere_action at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_derniere_action,
  case when pp.id is not null then 'oui' else 'non' end as formulaire_gouts_rempli,
  count(distinct case when pi.type_interet = 'consultation' then pi.id end) as nombre_consultations,
  count(distinct case when pi.type_interet = 'interet' then pi.id end) as nombre_interets,
  count(distinct ss.id) as nombre_achats,
  to_char(max(pi.date_interet) at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as dernier_interet_le,
  to_char(max(ss.date_achat) at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as dernier_achat_le,
  ces.a_relancer,
  ces.blackliste,
  to_char(c.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_creation
from core.contacts c
join core.contact_roles cr on cr.contact_id = c.id and cr.actif = true and cr.role = 'producteur'
left join core.producer_profiles pp on pp.contact_id = c.id
left join ops.contact_engagement_status ces on ces.contact_id = c.id
left join ops.project_interests pi on pi.contact_id = c.id
left join reporting.story_sales ss on ss.acheteur_contact_id = c.id
group by c.id, pp.id, ces.id;

create or replace view "01_pilot_contacts"."09_suivi_agents" as
select
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.company_name as societe,
  c.email,
  c.origin_initiale as canal_entree_initial,
  c.status as statut_contact,
  ces.statut_engagement,
  to_char(ces.date_derniere_action at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_derniere_action,
  case when max(ac.activee_le) is not null then 'oui' else 'non' end as cle_activee,
  case when max(lo.formulaire_termine_le) is not null then 'oui' else 'non' end as inscription_terminee,
  0::bigint as nombre_projets_soumis,
  null::text as dernier_projet_soumis_le,
  ces.a_relancer,
  ces.blackliste,
  to_char(c.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_creation
from core.contacts c
join core.contact_roles cr on cr.contact_id = c.id and cr.actif = true and cr.role = 'agent'
left join ops.contact_engagement_status ces on ces.contact_id = c.id
left join ops.access_cards ac on ac.contact_id = c.id and ac.profile_type = 'agent'
left join ops.launch_operations lo on lo.contact_id = c.id and lo.cible_role = 'agent'
group by c.id, ces.id;

create or replace view "01_pilot_contacts"."10_suivi_scenaristes" as
select
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.company_name as societe,
  c.email,
  c.origin_initiale as canal_entree_initial,
  c.status as statut_contact,
  ces.statut_engagement,
  to_char(ces.date_derniere_action at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_derniere_action,
  ces.a_relancer,
  ces.blackliste,
  to_char(c.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_creation
from core.contacts c
join core.contact_roles cr on cr.contact_id = c.id and cr.actif = true and cr.role = 'scenariste'
left join ops.contact_engagement_status ces on ces.contact_id = c.id;

create or replace view "01_pilot_contacts"."11_profils_panelistes" as
select * from pilot_contacts.profils_panelistes;

create or replace view "01_pilot_contacts"."12_profils_producteurs" as
select * from pilot_contacts.profils_producteurs;

-- ------------------------------------------------------------
-- 02 PILOT RECRUTEMENT
-- ------------------------------------------------------------
create or replace view "02_pilot_recrutement"."01_lancement_panel" as
select * from pilot_recrutement.lancement_panel;

create or replace view "02_pilot_recrutement"."02_lancement_producteurs" as
select * from pilot_recrutement.lancement_producteurs;

create or replace view "02_pilot_recrutement"."03_lancement_agents" as
select * from pilot_recrutement.lancement_agents;

create or replace view "02_pilot_recrutement"."04_recrutement_entrant" as
select * from pilot_recrutement.recrutement_entrant;

create or replace view "02_pilot_recrutement"."05_tracking_cta_recrutement" as
select
  ct.tracking_code as code_tracking,
  ct.utm_source,
  ct.utm_medium,
  ct.utm_campaign,
  ct.utm_content,
  ct.clics_entrants,
  ct.parcours_completes,
  ct.parcours_abandonnes,
  ct.taux_conversion,
  to_char(ct.date::timestamp at time zone 'Europe/Paris', 'DD/MM/YYYY') as date_tracking
from analytics.cta_tracking ct
where ct.projet_id is null;

-- ------------------------------------------------------------
-- 03 PILOT SIGNAL
-- ------------------------------------------------------------
create or replace view "03_pilot_signal"."01_campagnes_scoring" as
select * from pilot_signal.campagnes_scoring;

create or replace view "03_pilot_signal"."02_tests" as
select * from pilot_signal.tests;

create or replace view "03_pilot_signal"."03_retours" as
select * from pilot_signal.retours;

create or replace view "03_pilot_signal"."04_lecture_complete" as
select * from pilot_signal.lecture_complete;

create or replace view "03_pilot_signal"."05_experience_the_room" as
select * from pilot_signal.experience_the_room;

create or replace view "03_pilot_signal"."06_performances_sociales" as
select * from pilot_signal.performances_sociales;

create or replace view "03_pilot_signal"."07_tracking_cta_projets" as
select
  ct.tracking_code as code_tracking,
  p.projet_code as code_projet,
  p.name as projet,
  c.campagne_code as code_campagne,
  c.name as campagne,
  ct.utm_source,
  ct.utm_medium,
  ct.utm_campaign,
  ct.utm_content,
  ct.clics_entrants,
  ct.parcours_completes,
  ct.parcours_abandonnes,
  ct.taux_conversion,
  to_char(ct.date::timestamp at time zone 'Europe/Paris', 'DD/MM/YYYY') as date_tracking
from analytics.cta_tracking ct
left join catalog.projects p on p.id = ct.projet_id
left join ops.campaigns c on c.id = ct.campagne_id
where ct.projet_id is not null;

create or replace view "03_pilot_signal"."08_restitutions" as
select * from pilot_signal.restitutions;

-- ------------------------------------------------------------
-- 04 PILOT PROJETS
-- ------------------------------------------------------------
create or replace view "04_pilot_projets"."01_stories" as
select * from pilot_projets.stories;

create or replace view "04_pilot_projets"."02_externes" as
select * from pilot_projets.externes;

create or replace view "04_pilot_projets"."03_fichiers" as
select * from pilot_projets.fichiers;

-- ------------------------------------------------------------
-- 05 PILOT VENTE
-- ------------------------------------------------------------
create or replace view "05_pilot_vente"."01_campagnes_vente" as
select * from pilot_vente.campagnes_vente;

create or replace view "05_pilot_vente"."02_interets" as
select * from pilot_vente.interets;

create or replace view "05_pilot_vente"."03_ventes_stories" as
select * from pilot_vente.ventes_stories;
