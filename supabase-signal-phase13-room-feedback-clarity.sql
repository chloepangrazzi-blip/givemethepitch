-- ============================================================
-- PHASE 13 - ROOM FEEDBACK / LISIBILITE / MAPPING BINAIRE
-- - clarifie les vues ROOM avec libelles explicites
-- - garde les colonnes historiques pour ne rien casser
-- - ne backfill pas materiel_suffisant a l'aveugle :
--   la reponse Oui/Non n'est pas reconstructible de facon fiable
--   depuis les donnees historiques actuelles
-- ============================================================

create or replace view public.the_room__experience as
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
  rr.free_comment as commentaire_room,
  rr.reading_fluidity_score as ressenti_lecture_projet_score,
  case rr.reading_fluidity_score
    when 1 then 'Trop long'
    when 2 then 'Un peu long'
    when 4 then 'Bien comme il faut'
    when 5 then 'Rapide & fluide'
    else null
  end as libelle_lecture_projet,
  case rr.material_sufficiency_score
    when 1 then 'Non'
    when 5 then 'Oui'
    else null
  end as libelle_materiel_suffisant,
  rr.duration_relevance_score as ressenti_duree_formulaire_score,
  case rr.duration_relevance_score
    when 1 then 'Trop long'
    when 2 then 'Un peu long'
    when 4 then 'Bien comme il faut'
    when 5 then 'Rapide & fluide'
    else null
  end as libelle_duree_formulaire
from "03_pilot_signal"."02_tests" st
join signal.test_responses tr on tr.reponse_test_code = st.code_test
left join ops.enrolments e on e.id = tr.enrolment_id
join signal.room_feedback rr on rr.enrolment_id = e.id;

create or replace view "03_pilot_signal"."04_lecture_complete" as
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
  rr.free_comment as commentaire_room,
  rr.reading_fluidity_score as ressenti_lecture_projet_score,
  case rr.reading_fluidity_score
    when 1 then 'Trop long'
    when 2 then 'Un peu long'
    when 4 then 'Bien comme il faut'
    when 5 then 'Rapide & fluide'
    else null
  end as libelle_lecture_projet,
  case rr.material_sufficiency_score
    when 1 then 'Non'
    when 5 then 'Oui'
    else null
  end as libelle_materiel_suffisant,
  rr.duration_relevance_score as ressenti_duree_formulaire_score,
  case rr.duration_relevance_score
    when 1 then 'Trop long'
    when 2 then 'Un peu long'
    when 4 then 'Bien comme il faut'
    when 5 then 'Rapide & fluide'
    else null
  end as libelle_duree_formulaire
from "03_pilot_signal"."02_tests" st
join signal.test_responses tr on tr.reponse_test_code = st.code_test
left join "03_pilot_signal"."03_retours" sr on sr.code_test = st.code_test
left join ops.enrolments e on e.id = tr.enrolment_id
left join signal.room_feedback rr on rr.enrolment_id = e.id;

create or replace view "03_pilot_signal"."05_experience_the_room" as
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
  rr.free_comment as commentaire_room,
  rr.reading_fluidity_score as ressenti_lecture_projet_score,
  case rr.reading_fluidity_score
    when 1 then 'Trop long'
    when 2 then 'Un peu long'
    when 4 then 'Bien comme il faut'
    when 5 then 'Rapide & fluide'
    else null
  end as libelle_lecture_projet,
  case rr.material_sufficiency_score
    when 1 then 'Non'
    when 5 then 'Oui'
    else null
  end as libelle_materiel_suffisant,
  rr.duration_relevance_score as ressenti_duree_formulaire_score,
  case rr.duration_relevance_score
    when 1 then 'Trop long'
    when 2 then 'Un peu long'
    when 4 then 'Bien comme il faut'
    when 5 then 'Rapide & fluide'
    else null
  end as libelle_duree_formulaire
from "03_pilot_signal"."02_tests" st
join signal.test_responses tr on tr.reponse_test_code = st.code_test
left join ops.enrolments e on e.id = tr.enrolment_id
join signal.room_feedback rr on rr.enrolment_id = e.id;
