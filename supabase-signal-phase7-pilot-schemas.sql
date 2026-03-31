create schema if not exists pilot_contacts;
create schema if not exists pilot_recrutement;
create schema if not exists pilot_signal;
create schema if not exists pilot_projets;
create schema if not exists pilot_vente;

-- ------------------------------------------------------------
-- PILOT CONTACTS
-- ------------------------------------------------------------
create or replace view pilot_contacts.contacts as
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

create or replace view pilot_contacts.panelistes as
select
  ct.code_contact,
  ct.nom_complet,
  ct.email,
  ct.pays,
  ct.canal_entree_initial,
  ct.statut_contact,
  ct.date_creation
from pilot_contacts.contacts ct
join core.contacts c on c.contact_code = ct.code_contact
left join core.panel_profiles pp on pp.contact_id = c.id
left join core.contact_roles cr on cr.contact_id = c.id and cr.actif = true and cr.role = 'paneliste'
where pp.id is not null or cr.id is not null;

create or replace view pilot_contacts.producteurs as
select
  ct.code_contact,
  ct.nom_complet,
  ct.societe,
  ct.email,
  ct.pays,
  ct.canal_entree_initial,
  ct.statut_contact,
  ct.date_creation
from pilot_contacts.contacts ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'producteur';

create or replace view pilot_contacts.agents as
select
  ct.code_contact,
  ct.nom_complet,
  ct.societe,
  ct.email,
  ct.pays,
  ct.canal_entree_initial,
  ct.statut_contact,
  ct.date_creation
from pilot_contacts.contacts ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'agent';

create or replace view pilot_contacts.scenaristes as
select
  ct.code_contact,
  ct.nom_complet,
  ct.societe,
  ct.email,
  ct.pays,
  ct.canal_entree_initial,
  ct.statut_contact,
  ct.date_creation
from pilot_contacts.contacts ct
join core.contacts c on c.contact_code = ct.code_contact
join core.contact_roles cr on cr.contact_id = c.id
where cr.actif = true
  and cr.role = 'scenariste';

create or replace view pilot_contacts.suivi as
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

create or replace view pilot_contacts.profils_panelistes as
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

create or replace view pilot_contacts.profils_producteurs as
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

-- ------------------------------------------------------------
-- PILOT RECRUTEMENT
-- ------------------------------------------------------------
create or replace view pilot_recrutement.lancement_panel as
select
  lo.operation_lancement_code as code_operation,
  c.contact_code as code_contact,
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

create or replace view pilot_recrutement.lancement_producteurs as
select
  lo.operation_lancement_code as code_operation,
  c.contact_code as code_contact,
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

create or replace view pilot_recrutement.lancement_agents as
select
  lo.operation_lancement_code as code_operation,
  c.contact_code as code_contact,
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

create or replace view pilot_recrutement.recrutement_entrant as
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

-- ------------------------------------------------------------
-- PILOT PROJETS
-- ------------------------------------------------------------
create or replace view pilot_projets.stories as
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

create or replace view pilot_projets.externes as
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

create or replace view pilot_projets.fichiers as
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

-- ------------------------------------------------------------
-- PILOT SIGNAL
-- ------------------------------------------------------------
create or replace view pilot_signal.campagnes_scoring as
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

create or replace view pilot_signal.tests as
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

create or replace view pilot_signal.retours as
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

create or replace view pilot_signal.lecture_complete as
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
from pilot_signal.tests st
join signal.test_responses tr on tr.reponse_test_code = st.code_test
left join pilot_signal.retours sr on sr.code_test = st.code_test
left join ops.enrolments e on e.id = tr.enrolment_id
left join signal.room_feedback rr on rr.enrolment_id = e.id;

create or replace view pilot_signal.experience_the_room as
select
  st.code_test,
  st.code_paneliste,
  st.paneliste,
  st.code_projet,
  st.projet,
  st.code_campagne,
  st.campagne,
  st.date_soumission,
  rr.reading_fluidity_score as fluidite_lecture,
  rr.material_sufficiency_score as materiel_suffisant,
  rr.usefulness_score as utilite_dispositif,
  rr.experience_quality_score as qualite_experience,
  rr.duration_relevance_score as pertinence_duree,
  rr.device_recommendation_score as recommandation_dispositif,
  rr.free_comment as commentaire_room
from pilot_signal.tests st
join signal.test_responses tr on tr.reponse_test_code = st.code_test
left join ops.enrolments e on e.id = tr.enrolment_id
join signal.room_feedback rr on rr.enrolment_id = e.id;

create or replace view pilot_signal.restitutions as
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

create or replace view pilot_signal.performances_sociales as
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

create or replace view pilot_signal.tracking_cta as
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

-- ------------------------------------------------------------
-- PILOT VENTE
-- ------------------------------------------------------------
create or replace view pilot_vente.campagnes_vente as
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

create or replace view pilot_vente.ventes_stories as
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

create or replace view pilot_vente.interets as
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

-- ------------------------------------------------------------
-- MENAGE DE public
-- ------------------------------------------------------------
drop view if exists public.contacts__tous cascade;
drop view if exists public.contacts__panelistes cascade;
drop view if exists public.contacts__producteurs cascade;
drop view if exists public.contacts__agents cascade;
drop view if exists public.contacts__scenaristes cascade;
drop view if exists public.contacts__etat cascade;
drop view if exists public.contacts__suivi cascade;
drop view if exists public.profils__panelistes cascade;
drop view if exists public.profils__producteurs cascade;
drop view if exists public.lancement__panel cascade;
drop view if exists public.lancement__producteurs cascade;
drop view if exists public.lancement__agents cascade;
drop view if exists public.recrutement__entrant cascade;
drop view if exists public.recrutement__cartes_acces cascade;
drop view if exists public.campagnes__recrutement cascade;
drop view if exists public.campagnes__scoring cascade;
drop view if exists public.campagnes__vente cascade;
drop view if exists public.projets__stories cascade;
drop view if exists public.projets__externes cascade;
drop view if exists public.projets__fichiers cascade;
drop view if exists public.signal__tests cascade;
drop view if exists public.signal__retours cascade;
drop view if exists public.signal__lecture_complete cascade;
drop view if exists public.the_room__experience cascade;
drop view if exists public.signal__restitutions cascade;
drop view if exists public.social__performances cascade;
drop view if exists public.social__cta cascade;
drop view if exists public.ventes__stories cascade;
drop view if exists public.ventes__interets cascade;
