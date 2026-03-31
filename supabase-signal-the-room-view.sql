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
  rr.free_comment as commentaire_room
from public.signal__tests st
join signal.test_responses tr on tr.reponse_test_code = st.code_test
left join ops.enrolments e on e.id = tr.enrolment_id
join signal.room_feedback rr on rr.enrolment_id = e.id;
