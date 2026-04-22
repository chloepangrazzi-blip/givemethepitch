drop view if exists public.the_room__experience;

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
from pilot_signal.tests st
join signal.test_responses tr on tr.reponse_test_code = st.code_test
left join ops.enrolments e on e.id = tr.enrolment_id
join signal.room_feedback rr on rr.enrolment_id = e.id;
