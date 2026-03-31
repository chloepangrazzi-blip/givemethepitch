create or replace function public.code_lisible(prefixe text, numero bigint)
returns text
language sql
immutable
as $$
  select prefixe || '-' || lpad(numero::text, 5, '0');
$$;

create sequence if not exists public.contact_code_seq;
create sequence if not exists public.profil_paneliste_code_seq;
create sequence if not exists public.projet_code_seq;
create sequence if not exists public.campagne_code_seq;
create sequence if not exists public.participation_code_seq;
create sequence if not exists public.evenement_code_seq;
create sequence if not exists public.reponse_test_code_seq;
create sequence if not exists public.score_test_code_seq;
create sequence if not exists public.verbatim_code_seq;
create sequence if not exists public.retour_room_code_seq;
create sequence if not exists public.restitution_code_seq;

alter table core.contacts add column if not exists contact_code text;
alter table core.panel_profiles add column if not exists profil_paneliste_code text;
alter table catalog.projects add column if not exists projet_code text;
alter table ops.campaigns add column if not exists campagne_code text;
alter table ops.enrolments add column if not exists participation_code text;
alter table ops.events add column if not exists evenement_code text;
alter table signal.test_responses add column if not exists reponse_test_code text;
alter table signal.test_scores add column if not exists score_test_code text;
alter table signal.test_verbatims add column if not exists verbatim_code text;
alter table signal.room_feedback add column if not exists retour_room_code text;
alter table reporting.signal_reports add column if not exists restitution_code text;

update core.contacts
set contact_code = public.code_lisible('CT', nextval('public.contact_code_seq'))
where contact_code is null;

update core.panel_profiles
set profil_paneliste_code = public.code_lisible('PP', nextval('public.profil_paneliste_code_seq'))
where profil_paneliste_code is null;

update catalog.projects
set projet_code = public.code_lisible('PR', nextval('public.projet_code_seq'))
where projet_code is null;

update ops.campaigns
set campagne_code = public.code_lisible('CP', nextval('public.campagne_code_seq'))
where campagne_code is null;

update ops.enrolments
set participation_code = public.code_lisible('PA', nextval('public.participation_code_seq'))
where participation_code is null;

update ops.events
set evenement_code = public.code_lisible('EV', nextval('public.evenement_code_seq'))
where evenement_code is null;

update signal.test_responses
set reponse_test_code = public.code_lisible('RT', nextval('public.reponse_test_code_seq'))
where reponse_test_code is null;

update signal.test_scores
set score_test_code = public.code_lisible('SC', nextval('public.score_test_code_seq'))
where score_test_code is null;

update signal.test_verbatims
set verbatim_code = public.code_lisible('VB', nextval('public.verbatim_code_seq'))
where verbatim_code is null;

update signal.room_feedback
set retour_room_code = public.code_lisible('RR', nextval('public.retour_room_code_seq'))
where retour_room_code is null;

update reporting.signal_reports
set restitution_code = public.code_lisible('RS', nextval('public.restitution_code_seq'))
where restitution_code is null;

alter table core.contacts alter column contact_code set not null;
alter table core.panel_profiles alter column profil_paneliste_code set not null;
alter table catalog.projects alter column projet_code set not null;
alter table ops.campaigns alter column campagne_code set not null;
alter table ops.enrolments alter column participation_code set not null;
alter table ops.events alter column evenement_code set not null;
alter table signal.test_responses alter column reponse_test_code set not null;
alter table signal.test_scores alter column score_test_code set not null;
alter table signal.test_verbatims alter column verbatim_code set not null;
alter table signal.room_feedback alter column retour_room_code set not null;
alter table reporting.signal_reports alter column restitution_code set not null;

create unique index if not exists contacts_contact_code_idx on core.contacts (contact_code);
create unique index if not exists panel_profiles_code_idx on core.panel_profiles (profil_paneliste_code);
create unique index if not exists projects_projet_code_idx on catalog.projects (projet_code);
create unique index if not exists campaigns_campagne_code_idx on ops.campaigns (campagne_code);
create unique index if not exists enrolments_participation_code_idx on ops.enrolments (participation_code);
create unique index if not exists events_evenement_code_idx on ops.events (evenement_code);
create unique index if not exists test_responses_code_idx on signal.test_responses (reponse_test_code);
create unique index if not exists test_scores_code_idx on signal.test_scores (score_test_code);
create unique index if not exists test_verbatims_code_idx on signal.test_verbatims (verbatim_code);
create unique index if not exists room_feedback_code_idx on signal.room_feedback (retour_room_code);
create unique index if not exists signal_reports_code_idx on reporting.signal_reports (restitution_code);

create or replace function public.assign_contact_code()
returns trigger
language plpgsql
as $$
begin
  if new.contact_code is null then
    new.contact_code := public.code_lisible('CT', nextval('public.contact_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_profil_paneliste_code()
returns trigger
language plpgsql
as $$
begin
  if new.profil_paneliste_code is null then
    new.profil_paneliste_code := public.code_lisible('PP', nextval('public.profil_paneliste_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_projet_code()
returns trigger
language plpgsql
as $$
begin
  if new.projet_code is null then
    new.projet_code := public.code_lisible('PR', nextval('public.projet_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_campagne_code()
returns trigger
language plpgsql
as $$
begin
  if new.campagne_code is null then
    new.campagne_code := public.code_lisible('CP', nextval('public.campagne_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_participation_code()
returns trigger
language plpgsql
as $$
begin
  if new.participation_code is null then
    new.participation_code := public.code_lisible('PA', nextval('public.participation_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_evenement_code()
returns trigger
language plpgsql
as $$
begin
  if new.evenement_code is null then
    new.evenement_code := public.code_lisible('EV', nextval('public.evenement_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_reponse_test_code()
returns trigger
language plpgsql
as $$
begin
  if new.reponse_test_code is null then
    new.reponse_test_code := public.code_lisible('RT', nextval('public.reponse_test_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_score_test_code()
returns trigger
language plpgsql
as $$
begin
  if new.score_test_code is null then
    new.score_test_code := public.code_lisible('SC', nextval('public.score_test_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_verbatim_code()
returns trigger
language plpgsql
as $$
begin
  if new.verbatim_code is null then
    new.verbatim_code := public.code_lisible('VB', nextval('public.verbatim_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_retour_room_code()
returns trigger
language plpgsql
as $$
begin
  if new.retour_room_code is null then
    new.retour_room_code := public.code_lisible('RR', nextval('public.retour_room_code_seq'));
  end if;
  return new;
end;
$$;

create or replace function public.assign_restitution_code()
returns trigger
language plpgsql
as $$
begin
  if new.restitution_code is null then
    new.restitution_code := public.code_lisible('RS', nextval('public.restitution_code_seq'));
  end if;
  return new;
end;
$$;

drop trigger if exists set_contact_code on core.contacts;
create trigger set_contact_code before insert on core.contacts for each row execute function public.assign_contact_code();

drop trigger if exists set_profil_paneliste_code on core.panel_profiles;
create trigger set_profil_paneliste_code before insert on core.panel_profiles for each row execute function public.assign_profil_paneliste_code();

drop trigger if exists set_projet_code on catalog.projects;
create trigger set_projet_code before insert on catalog.projects for each row execute function public.assign_projet_code();

drop trigger if exists set_campagne_code on ops.campaigns;
create trigger set_campagne_code before insert on ops.campaigns for each row execute function public.assign_campagne_code();

drop trigger if exists set_participation_code on ops.enrolments;
create trigger set_participation_code before insert on ops.enrolments for each row execute function public.assign_participation_code();

drop trigger if exists set_evenement_code on ops.events;
create trigger set_evenement_code before insert on ops.events for each row execute function public.assign_evenement_code();

drop trigger if exists set_reponse_test_code on signal.test_responses;
create trigger set_reponse_test_code before insert on signal.test_responses for each row execute function public.assign_reponse_test_code();

drop trigger if exists set_score_test_code on signal.test_scores;
create trigger set_score_test_code before insert on signal.test_scores for each row execute function public.assign_score_test_code();

drop trigger if exists set_verbatim_code on signal.test_verbatims;
create trigger set_verbatim_code before insert on signal.test_verbatims for each row execute function public.assign_verbatim_code();

drop trigger if exists set_retour_room_code on signal.room_feedback;
create trigger set_retour_room_code before insert on signal.room_feedback for each row execute function public.assign_retour_room_code();

drop trigger if exists set_restitution_code on reporting.signal_reports;
create trigger set_restitution_code before insert on reporting.signal_reports for each row execute function public.assign_restitution_code();

create or replace view public.vue_panelistes as
select
  c.contact_code as code_paneliste,
  concat_ws(' ', c.first_name, c.last_name) as nom_complet,
  c.contact_kind as role,
  c.email,
  c.phone as telephone,
  c.city as ville,
  c.country as pays,
  c.status as statut,
  pp.main_genre as genre_principal,
  array_to_string(pp.liked_genres, ', ') as genres_aimes,
  array_to_string(pp.platforms, ', ') as plateformes,
  pp.viewing_frequency as frequence_visionnage,
  pp.french_series_perception as perception_series_francaises,
  pp.recommendation_frequency as frequence_recommandation,
  count(distinct e.id) as nombre_campagnes,
  count(distinct case when e.completed_at is not null then e.id end) as nombre_tests_completes,
  to_char(c.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_inscription
from core.contacts c
left join core.panel_profiles pp on pp.contact_id = c.id
left join ops.enrolments e on e.contact_id = c.id
group by c.id, pp.id;

create or replace view public.vue_projets as
select
  p.projet_code as code_projet,
  p.name as projet,
  p.slug,
  p.main_genre as genre_principal,
  p.secondary_genre as genre_secondaire,
  p.format,
  p.status as statut,
  p.short_description as description_courte,
  count(distinct c.id) as nombre_campagnes,
  latest_report.desirability_score as dernier_score_signal,
  latest_report.sample_size as dernier_echantillon,
  to_char(p.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_creation
from catalog.projects p
left join ops.campaigns c on c.project_id = p.id
left join lateral (
  select sr.desirability_score, sr.sample_size
  from reporting.signal_reports sr
  join ops.campaigns c2 on c2.id = sr.campaign_id
  where c2.project_id = p.id
  order by coalesce(sr.generated_at, sr.created_at) desc, sr.created_at desc
  limit 1
) latest_report on true
group by p.id, latest_report.desirability_score, latest_report.sample_size;

create or replace view public.vue_campagnes as
select
  c.campagne_code as code_campagne,
  c.name as campagne,
  p.name as projet,
  c.status as statut,
  c.campaign_type as type_campagne,
  c.nda_version as version_nda,
  to_char(c.start_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_debut,
  to_char(c.end_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_fin,
  count(distinct e.id) as participants,
  count(distinct case when e.access_granted then e.id end) as cles_envoyees,
  count(distinct case when e.nda_accepted then e.id end) as nda_signes,
  count(distinct case when e.completed_at is not null then e.id end) as tests_completes,
  scores.desirability_score as score_signal_moyen
from ops.campaigns c
join catalog.projects p on p.id = c.project_id
left join ops.enrolments e on e.campaign_id = c.id
left join analytics.v_campaign_signal_scores scores on scores.campaign_id = c.id
group by c.id, p.id, scores.desirability_score;

create or replace view public.vue_tests_panel as
select
  tr.reponse_test_code as code_test,
  c.contact_code as code_paneliste,
  concat_ws(' ', c.first_name, c.last_name) as paneliste,
  p.name as projet,
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

create or replace view public.vue_retours_projet as
select
  tr.reponse_test_code as code_test,
  c.contact_code as code_paneliste,
  concat_ws(' ', c.first_name, c.last_name) as paneliste,
  p.name as projet,
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

create or replace view public.vue_lecture_complete as
select
  tr.reponse_test_code as code_test,
  c.contact_code as code_paneliste,
  concat_ws(' ', c.first_name, c.last_name) as paneliste,
  p.name as projet,
  camp.name as campagne,
  to_char(tr.submitted_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_soumission,
  ts.hook_score as hook,
  ts.feel_score as feel,
  ts.care_score as care,
  ts.continue_score as continue,
  ts.share_score as share,
  ts.desirability_score as score_global,
  rp.accroche,
  rp.ressenti,
  rp.emotion,
  rp.personnages,
  rp.attachement,
  rp.pourquoi,
  rp.raisons_de_continuer,
  rp.freins,
  rp.envie_de_binge,
  rp.raison_arret,
  rp.cible_de_recommandation,
  rp.pitch_spontane,
  rr.reading_fluidity_score as fluidite_lecture,
  rr.material_sufficiency_score as materiel_suffisant,
  rr.usefulness_score as utilite_dispositif,
  rr.experience_quality_score as qualite_experience,
  rr.duration_relevance_score as pertinence_duree,
  rr.device_recommendation_score as recommandation_dispositif,
  rr.free_comment as commentaire_room
from signal.test_responses tr
join ops.enrolments e on e.id = tr.enrolment_id
join core.contacts c on c.id = e.contact_id
join ops.campaigns camp on camp.id = e.campaign_id
join catalog.projects p on p.id = camp.project_id
left join signal.test_scores ts on ts.test_response_id = tr.id
left join signal.room_feedback rr on rr.enrolment_id = e.id
left join public.vue_retours_projet rp on rp.reponse_test_code = tr.reponse_test_code;

create or replace view public.vue_restitutions_signal as
select
  sr.restitution_code as code_restitution,
  camp.campagne_code as code_campagne,
  camp.name as campagne,
  p.name as projet,
  sr.status as statut,
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
