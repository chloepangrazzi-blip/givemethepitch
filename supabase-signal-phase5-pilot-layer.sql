-- ============================================================
-- PHASE 5 - COUCHE DE PILOTAGE CLAIRE DANS public
-- Regroupe les vues par famille métier pour rendre l'ordre
-- alphabétique lisible dans Supabase.
-- ============================================================

drop view if exists public.vue_lecture_complete cascade;
drop view if exists public.vue_retours_projet cascade;
drop view if exists public.vue_tests_panel cascade;
drop view if exists public.vue_restitutions_signal cascade;
drop view if exists public.vue_panelistes cascade;
drop view if exists public.vue_producteurs cascade;
drop view if exists public.vue_agents cascade;
drop view if exists public.vue_scenaristes cascade;
drop view if exists public.vue_etat_contacts cascade;
drop view if exists public.vue_interets_projets cascade;
drop view if exists public.vue_performance_sociale cascade;
drop view if exists public.vue_ventes_stories cascade;
drop view if exists public.vue_campagnes_recrutement cascade;
drop view if exists public.vue_campagnes_scoring cascade;
drop view if exists public.vue_campagnes_vente cascade;
drop view if exists public.vue_campagnes cascade;
drop view if exists public.vue_projets_stories cascade;
drop view if exists public.vue_projets_externes cascade;
drop view if exists public.vue_projets cascade;
drop view if exists public.vue_fichiers_projets cascade;
drop view if exists public.vue_cartes_acces cascade;
drop view if exists public.vue_tracking_cta cascade;
drop view if exists public.vue_contacts cascade;

drop view if exists public.contacts__etat;
drop view if exists public.contacts__panelistes;
drop view if exists public.contacts__producteurs;
drop view if exists public.contacts__agents;
drop view if exists public.contacts__scenaristes;
drop view if exists public.contacts__tous;
drop view if exists public.campagnes__recrutement;
drop view if exists public.campagnes__scoring;
drop view if exists public.campagnes__vente;
drop view if exists public.projets__stories;
drop view if exists public.projets__externes;
drop view if exists public.projets__fichiers;
drop view if exists public.signal__lecture_complete;
drop view if exists public.signal__retours;
drop view if exists public.signal__tests;
drop view if exists public.signal__restitutions;
drop view if exists public.ventes__stories;
drop view if exists public.ventes__interets;
drop view if exists public.social__performances;
drop view if exists public.social__cta;
drop view if exists public.recrutement__cartes_acces;

create or replace view public.contacts__tous as
select
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.company_name as societe,
  c.email,
  c.country as pays,
  c.origin_initiale as canal_entree_initial,
  c.status as statut_contact,
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
  to_char(c.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_creation
from core.contacts c
left join core.panel_profiles pp on pp.contact_id = c.id;

create or replace view public.contacts__panelistes as
select
  c.contact_code as code_contact,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.email,
  c.country as pays,
  c.origin_initiale as canal_entree_initial,
  c.status as statut_contact,
  pp.main_genre as genre_principal,
  array_to_string(pp.liked_genres, ', ') as genres_aimes,
  array_to_string(pp.platforms, ', ') as plateformes,
  pp.viewing_frequency as frequence_visionnage,
  pp.french_series_perception as perception_series_francaises,
  pp.recommendation_frequency as frequence_recommandation,
  count(distinct e.id) as nombre_campagnes,
  count(distinct case when e.completed_at is not null then e.id end) as nombre_tests_completes,
  ces.statut_engagement,
  ces.nombre_absences,
  ces.absences_consecutives,
  ces.a_relancer,
  ces.blackliste,
  to_char(c.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_creation
from core.contacts c
join core.panel_profiles pp on pp.contact_id = c.id
left join ops.enrolments e on e.contact_id = c.id
left join ops.contact_engagement_status ces on ces.contact_id = c.id
group by c.id, pp.id, ces.id;

create or replace view public.contacts__producteurs as
select ct.*
from public.contacts__tous ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'producteur';

create or replace view public.contacts__agents as
select ct.*
from public.contacts__tous ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'agent';

create or replace view public.contacts__scenaristes as
select ct.*
from public.contacts__tous ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'scenariste';

create or replace view public.contacts__etat as
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

create or replace view public.campagnes__recrutement as
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

create or replace view public.campagnes__scoring as
select
  c.campagne_code as code_campagne,
  c.name as campagne,
  p.projet_code as code_projet,
  p.name as projet,
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

create or replace view public.campagnes__vente as
select
  c.campagne_code as code_campagne,
  c.name as campagne,
  p.projet_code as code_projet,
  p.name as projet,
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

create or replace view public.projets__stories as
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
  count(distinct pf.id) as nombre_fichiers,
  latest_report.desirability_score as score_signal
from catalog.projects p
left join core.contacts acheteur on acheteur.id = p.acheteur_contact_id
left join catalog.project_files pf on pf.projet_id = p.id
left join lateral (
  select sr.desirability_score
  from reporting.signal_reports sr
  join ops.campaigns c on c.id = sr.campaign_id
  where c.project_id = p.id
  order by coalesce(sr.generated_at, sr.created_at) desc, sr.created_at desc
  limit 1
) latest_report on true
where p.origine_projet = 'stories'
group by p.id, acheteur.id, latest_report.desirability_score;

create or replace view public.projets__externes as
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
  count(distinct pf.id) as nombre_fichiers,
  p.contrat_source_url,
  p.facture_url,
  to_char(p.date_debut_scoring at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut_scoring,
  to_char(p.date_fin_scoring at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin_scoring,
  p.score_final_snapshot as score_signal
from catalog.projects p
left join core.contacts d on d.id = p.demandeur_contact_id
left join catalog.project_files pf on pf.projet_id = p.id
where p.origine_projet = 'externe'
group by p.id, d.id;

create or replace view public.projets__fichiers as
select
  pf.fichier_code as code_fichier,
  p.projet_code as code_projet,
  p.name as projet,
  p.origine_projet,
  pf.type_fichier,
  pf.nom_fichier,
  pf.taille as taille_octets,
  pf.url,
  concat_ws(' ', c.first_name, c.last_name) as uploaded_par,
  to_char(pf.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_upload
from catalog.project_files pf
join catalog.projects p on p.id = pf.projet_id
left join core.contacts c on c.id = pf.uploaded_by;

create or replace view public.signal__tests as
select
  tr.reponse_test_code as code_test,
  c.contact_code as code_paneliste,
  concat_ws(' ', c.first_name, c.last_name) as paneliste,
  p.projet_code as code_projet,
  p.name as projet,
  camp.campagne_code as code_campagne,
  camp.name as campagne,
  to_char(tr.submitted_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_soumission,
  ts.hook_score as hook,
  ts.feel_score as feel,
  ts.care_score as care,
  ts.continue_score as continue,
  ts.share_score as share,
  ts.desirability_score as score_global,
  case when rr.id is not null then 'oui' else 'non' end as retour_room
from signal.test_responses tr
join ops.enrolments e on e.id = tr.enrolment_id
join core.contacts c on c.id = e.contact_id
join ops.campaigns camp on camp.id = e.campaign_id
join catalog.projects p on p.id = camp.project_id
left join signal.test_scores ts on ts.test_response_id = tr.id
left join signal.room_feedback rr on rr.enrolment_id = e.id;

create or replace view public.signal__retours as
select
  tr.reponse_test_code as code_test,
  c.contact_code as code_paneliste,
  concat_ws(' ', c.first_name, c.last_name) as paneliste,
  p.projet_code as code_projet,
  p.name as projet,
  camp.campagne_code as code_campagne,
  camp.name as campagne,
  max(case when tv.question_code = 'hook_accroche' then tv.verbatim_text end) as accroche,
  max(case when tv.question_code = 'feel_verbatim' then tv.verbatim_text end) as ressenti,
  max(case when tv.question_code = 'feel_emotion' then tv.verbatim_text end) as emotion,
  max(case when tv.question_code = 'care_personnages' then tv.verbatim_text end) as personnages,
  max(case when tv.question_code = 'care_attachement' then tv.verbatim_text end) as attachement,
  max(case when tv.question_code = 'care_pourquoi' then tv.verbatim_text end) as pourquoi,
  max(case when tv.question_code = 'continue_raisons' then tv.verbatim_text end) as raisons_de_continuer,
  max(case when tv.question_code = 'continue_decroche' then tv.verbatim_text end) as freins,
  max(case when tv.question_code = 'continue_binge' then tv.verbatim_text end) as envie_de_binge,
  max(case when tv.question_code = 'continue_drop' then tv.verbatim_text end) as raison_arret,
  max(case when tv.question_code = 'share_cible' then tv.verbatim_text end) as cible_de_recommandation,
  max(case when tv.question_code = 'share_pitch' then tv.verbatim_text end) as pitch_spontane
from signal.test_responses tr
join signal.test_verbatims tv on tv.test_response_id = tr.id
join ops.enrolments e on e.id = tr.enrolment_id
join core.contacts c on c.id = e.contact_id
join ops.campaigns camp on camp.id = e.campaign_id
join catalog.projects p on p.id = camp.project_id
group by tr.id, c.id, p.id, camp.id;

create or replace view public.signal__lecture_complete as
select
  st.code_test,
  st.code_paneliste,
  st.paneliste,
  st.code_projet,
  st.projet,
  st.code_campagne,
  st.campagne,
  st.date_soumission,
  st.hook,
  st.feel,
  st.care,
  st.continue,
  st.share,
  st.score_global,
  sr.accroche,
  sr.ressenti,
  sr.emotion,
  sr.personnages,
  sr.attachement,
  sr.pourquoi,
  sr.raisons_de_continuer,
  sr.freins,
  sr.envie_de_binge,
  sr.raison_arret,
  sr.cible_de_recommandation,
  sr.pitch_spontane,
  rr.reading_fluidity_score as fluidite_lecture,
  rr.material_sufficiency_score as materiel_suffisant,
  rr.usefulness_score as utilite_dispositif,
  rr.experience_quality_score as qualite_experience,
  rr.duration_relevance_score as pertinence_duree,
  rr.device_recommendation_score as recommandation_dispositif,
  rr.free_comment as commentaire_room
from public.signal__tests st
join signal.test_responses tr on tr.reponse_test_code = st.code_test
left join public.signal__retours sr on sr.code_test = st.code_test
left join ops.enrolments e on e.id = tr.enrolment_id
left join signal.room_feedback rr on rr.enrolment_id = e.id;

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
  sr.strengths_summary as points_forts,
  sr.weaknesses_summary as points_de_friction,
  sr.executive_summary as synthese,
  to_char(coalesce(sr.generated_at, sr.created_at) at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_generation
from reporting.signal_reports sr
join ops.campaigns camp on camp.id = sr.campaign_id
join catalog.projects p on p.id = camp.project_id;

create or replace view public.ventes__stories as
select
  ss.vente_code as code_vente,
  p.projet_code as code_projet,
  p.name as projet,
  c.campagne_code as code_campagne,
  coalesce(ss.acheteur_nom_snapshot, concat_ws(' ', contact.first_name, contact.last_name)) as acheteur,
  coalesce(ss.acheteur_societe_snapshot, contact.company_name) as societe,
  ss.pack_vente,
  ss.prix,
  to_char(ss.date_achat at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_achat,
  ss.statut_vente,
  ss.contrat_licence_url,
  ss.facture_url
from reporting.story_sales ss
join catalog.projects p on p.id = ss.projet_id
left join ops.campaigns c on c.id = ss.campagne_id
left join core.contacts contact on contact.id = ss.acheteur_contact_id;

create or replace view public.ventes__interets as
select
  pi.interet_code as code_interet,
  p.projet_code as code_projet,
  p.name as projet,
  concat_ws(' ', c.first_name, c.last_name) as contact,
  c.company_name as societe,
  pi.type_interet,
  pi.source,
  to_char(pi.date_interet at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_interet,
  pi.notes
from ops.project_interests pi
join catalog.projects p on p.id = pi.projet_id
left join core.contacts c on c.id = pi.contact_id;

create or replace view public.social__performances as
select
  sp.performance_sociale_code as code_social,
  p.projet_code as code_projet,
  p.name as projet,
  c.campagne_code as code_campagne,
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

create or replace view public.social__cta as
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
left join ops.campaigns c on c.id = ct.campagne_id;

create or replace view public.recrutement__cartes_acces as
select
  ac.carte_code as code_carte,
  ac.numero,
  c.campagne_code as code_campagne,
  c.name as campagne,
  concat_ws(' ', contact.first_name, contact.last_name) as destinataire,
  contact.company_name as societe,
  ac.profile_type,
  ac.cle_acces,
  to_char(ac.envoyee_le::timestamp at time zone 'Europe/Paris', 'DD/MM/YYYY') as envoyee_le,
  to_char(ac.activee_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as activee_le,
  to_char(ac.expire_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as expire_le,
  ac.statut,
  ac.notes
from ops.access_cards ac
left join core.contacts contact on contact.id = ac.contact_id
left join ops.campaigns c on c.id = ac.campaign_id;
