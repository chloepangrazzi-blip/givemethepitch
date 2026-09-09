-- ============================================================
-- SIGNAL V3 - QUESTIONNAIRE EDITORIAL / SCORING DESIRABILITY
-- ============================================================
-- Preparation locale uniquement.
-- Ne pas executer sans validation explicite.
-- Objectifs:
-- - versionner la refonte sous form_version = signal_v3
-- - conserver les colonnes legacy sans backfill ni recalcul historique
-- - isoler le desirability_score sur 10 questions scorees
-- - maintenir la soumission atomique access_code + service_role only
-- ============================================================

begin;

alter table signal.test_responses
  add column if not exists immediate_reaction_label text,
  add column if not exists hook_discovery_score smallint,
  add column if not exists felt_something_score smallint,
  add column if not exists atmosphere_stay_score smallint,
  add column if not exists character_intrigue_score smallint,
  add column if not exists character_fate_interest_score smallint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'test_responses_immediate_reaction_label_check'
      and conrelid = 'signal.test_responses'::regclass
  ) then
    alter table signal.test_responses
      add constraint test_responses_immediate_reaction_label_check
      check (
        immediate_reaction_label is null
        or immediate_reaction_label in (
          'J''ai envie de continuer',
          'Je suis curieux·se',
          'Je ne sais pas encore',
          'Pas pour moi'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'test_responses_hook_discovery_score_check'
      and conrelid = 'signal.test_responses'::regclass
  ) then
    alter table signal.test_responses
      add constraint test_responses_hook_discovery_score_check
      check (hook_discovery_score between 1 and 5);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'test_responses_felt_something_score_check'
      and conrelid = 'signal.test_responses'::regclass
  ) then
    alter table signal.test_responses
      add constraint test_responses_felt_something_score_check
      check (felt_something_score between 1 and 5);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'test_responses_atmosphere_stay_score_check'
      and conrelid = 'signal.test_responses'::regclass
  ) then
    alter table signal.test_responses
      add constraint test_responses_atmosphere_stay_score_check
      check (atmosphere_stay_score between 1 and 5);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'test_responses_character_intrigue_score_check'
      and conrelid = 'signal.test_responses'::regclass
  ) then
    alter table signal.test_responses
      add constraint test_responses_character_intrigue_score_check
      check (character_intrigue_score between 1 and 5);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'test_responses_character_fate_interest_score_check'
      and conrelid = 'signal.test_responses'::regclass
  ) then
    alter table signal.test_responses
      add constraint test_responses_character_fate_interest_score_check
      check (character_fate_interest_score between 1 and 5);
  end if;
end $$;

create or replace function signal.compute_test_scores_v3(p_test_response_id uuid)
returns signal.test_scores
language plpgsql
security invoker
set search_path = ''
as $$
declare
  response_row signal.test_responses%rowtype;
  v_hook numeric(5,2);
  v_feel numeric(5,2);
  v_care numeric(5,2);
  v_continue numeric(5,2);
  v_share numeric(5,2);
  v_desirability numeric(5,2);
  result_row signal.test_scores%rowtype;
begin
  select *
  into response_row
  from signal.test_responses
  where id = p_test_response_id;

  if not found then
    raise exception 'test_response % not found', p_test_response_id;
  end if;

  v_hook := round((
    signal.normalize_likert_5_to_100(response_row.hook_discovery_score) +
    signal.normalize_likert_5_to_100(response_row.curiosity_score)
  ) / 2, 2);

  v_feel := round((
    signal.normalize_likert_5_to_100(response_row.felt_something_score) +
    signal.normalize_likert_5_to_100(response_row.atmosphere_stay_score)
  ) / 2, 2);

  v_care := round((
    signal.normalize_likert_5_to_100(response_row.character_intrigue_score) +
    signal.normalize_likert_5_to_100(response_row.character_fate_interest_score)
  ) / 2, 2);

  v_continue := round((
    signal.normalize_likert_5_to_100(response_row.continue_intent_score) +
    signal.normalize_likert_5_to_100(response_row.watch_intent_score)
  ) / 2, 2);

  v_share := round((
    signal.normalize_likert_5_to_100(response_row.recommendation_score) +
    signal.normalize_likert_5_to_100(response_row.talkability_score)
  ) / 2, 2);

  v_desirability := round((v_hook + v_feel + v_care + v_continue + v_share) / 5, 2);

  if v_desirability is null then
    raise exception 'missing_signal_v3_scored_field';
  end if;

  insert into signal.test_scores (
    test_response_id,
    hook_score,
    feel_score,
    care_score,
    continue_score,
    share_score,
    desirability_score,
    scoring_model_version,
    calculated_at
  )
  values (
    p_test_response_id,
    v_hook,
    v_feel,
    v_care,
    v_continue,
    v_share,
    v_desirability,
    'signal_v3',
    now()
  )
  on conflict (test_response_id)
  do update set
    hook_score = excluded.hook_score,
    feel_score = excluded.feel_score,
    care_score = excluded.care_score,
    continue_score = excluded.continue_score,
    share_score = excluded.share_score,
    desirability_score = excluded.desirability_score,
    scoring_model_version = excluded.scoring_model_version,
    calculated_at = excluded.calculated_at
  returning * into result_row;

  return result_row;
end;
$$;

revoke all on function signal.compute_test_scores_v3(uuid) from PUBLIC;
revoke all on function signal.compute_test_scores_v3(uuid) from anon;
revoke all on function signal.compute_test_scores_v3(uuid) from authenticated;
grant execute on function signal.compute_test_scores_v3(uuid) to service_role;

create or replace function signal.handle_test_response_score()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_form_version text;
begin
  select c.form_version
  into v_form_version
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  where e.id = new.enrolment_id;

  if v_form_version = 'signal_v3' then
    perform signal.compute_test_scores_v3(new.id);
  else
    perform signal.compute_test_scores(new.id);
  end if;

  return new;
end;
$$;

revoke all on function signal.handle_test_response_score() from PUBLIC;
revoke all on function signal.handle_test_response_score() from anon;
revoke all on function signal.handle_test_response_score() from authenticated;
grant execute on function signal.handle_test_response_score() to service_role;

create or replace function signal.submit_signal_test_v3(
  p_access_code text,
  p_test_response jsonb,
  p_room_feedback jsonb,
  p_verbatims jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_access_code text := upper(trim(coalesce(p_access_code, '')));
  v_enrolment record;
  v_now timestamptz := now();
  v_test_response_id uuid;
  v_room_feedback_id uuid;
  v_metrics record;
begin
  if v_access_code = '' then
    raise exception 'missing_access_code';
  end if;

  if p_verbatims is null then
    p_verbatims := '[]'::jsonb;
  end if;

  if jsonb_typeof(p_verbatims) <> 'array' then
    raise exception 'invalid_verbatims_payload';
  end if;

  select
    e.id,
    e.contact_id,
    e.campaign_id,
    e.access_granted,
    e.nda_accepted,
    e.nda_accepted_at,
    e.status as enrolment_status,
    c.status as campaign_status,
    c.project_version,
    c.form_version
  into v_enrolment
  from ops.enrolments e
  join ops.campaigns c on c.id = e.campaign_id
  where e.access_code = v_access_code
  for update of e;

  if not found then
    raise exception 'unknown_access';
  end if;

  if v_enrolment.campaign_status <> 'active' then
    raise exception 'campaign_not_active';
  end if;

  if v_enrolment.enrolment_status in ('declined', 'expired') then
    raise exception 'access_not_active';
  end if;

  if coalesce(v_enrolment.access_granted, false) is not true then
    raise exception 'access_not_granted';
  end if;

  if coalesce(v_enrolment.nda_accepted, false) is not true
    or v_enrolment.nda_accepted_at is null
  then
    raise exception 'nda_not_signed';
  end if;

  if coalesce(v_enrolment.project_version, '') <> 'maree_noire_v2'
    or coalesce(v_enrolment.form_version, '') <> 'signal_v3'
  then
    raise exception 'not_signal_v3_campaign';
  end if;

  insert into signal.test_responses (
    enrolment_id,
    submitted_at,
    immediate_reaction_label,
    immediate_reaction_score,
    promise_clarity_score,
    curiosity_score,
    world_clarity_score,
    dramatic_clarity_score,
    emotional_clarity_score,
    hook_discovery_score,
    emotional_intensity_score,
    mood_clarity_score,
    felt_something_score,
    atmosphere_stay_score,
    character_interest_score,
    character_projection_score,
    character_intrigue_score,
    character_fate_interest_score,
    continue_intent_score,
    watch_intent_score,
    recommendation_score,
    talkability_score
  )
  values (
    v_enrolment.id,
    v_now,
    nullif(p_test_response ->> 'immediate_reaction_label', ''),
    null,
    (p_test_response ->> 'promise_clarity_score')::smallint,
    (p_test_response ->> 'curiosity_score')::smallint,
    (p_test_response ->> 'world_clarity_score')::smallint,
    (p_test_response ->> 'dramatic_clarity_score')::smallint,
    (p_test_response ->> 'emotional_clarity_score')::smallint,
    (p_test_response ->> 'hook_discovery_score')::smallint,
    null,
    null,
    (p_test_response ->> 'felt_something_score')::smallint,
    (p_test_response ->> 'atmosphere_stay_score')::smallint,
    null,
    null,
    (p_test_response ->> 'character_intrigue_score')::smallint,
    (p_test_response ->> 'character_fate_interest_score')::smallint,
    (p_test_response ->> 'continue_intent_score')::smallint,
    (p_test_response ->> 'watch_intent_score')::smallint,
    (p_test_response ->> 'recommendation_score')::smallint,
    (p_test_response ->> 'talkability_score')::smallint
  )
  on conflict (enrolment_id)
  do update set
    submitted_at = excluded.submitted_at,
    immediate_reaction_label = excluded.immediate_reaction_label,
    immediate_reaction_score = null,
    promise_clarity_score = excluded.promise_clarity_score,
    curiosity_score = excluded.curiosity_score,
    world_clarity_score = excluded.world_clarity_score,
    dramatic_clarity_score = excluded.dramatic_clarity_score,
    emotional_clarity_score = excluded.emotional_clarity_score,
    hook_discovery_score = excluded.hook_discovery_score,
    emotional_intensity_score = null,
    mood_clarity_score = null,
    felt_something_score = excluded.felt_something_score,
    atmosphere_stay_score = excluded.atmosphere_stay_score,
    character_interest_score = null,
    character_projection_score = null,
    character_intrigue_score = excluded.character_intrigue_score,
    character_fate_interest_score = excluded.character_fate_interest_score,
    continue_intent_score = excluded.continue_intent_score,
    watch_intent_score = excluded.watch_intent_score,
    recommendation_score = excluded.recommendation_score,
    talkability_score = excluded.talkability_score,
    updated_at = v_now
  returning id into v_test_response_id;

  delete from signal.test_verbatims
  where test_response_id = v_test_response_id;

  insert into signal.test_verbatims (
    test_response_id,
    question_code,
    verbatim_text
  )
  select
    v_test_response_id,
    nullif(trim(verbatim.question_code), ''),
    nullif(trim(verbatim.verbatim_text), '')
  from jsonb_to_recordset(p_verbatims) as verbatim(
    question_code text,
    verbatim_text text
  )
  where nullif(trim(verbatim.question_code), '') is not null
    and nullif(trim(verbatim.verbatim_text), '') is not null;

  insert into signal.room_feedback (
    enrolment_id,
    submitted_at,
    reading_fluidity_score,
    material_sufficiency_score,
    usefulness_score,
    experience_quality_score,
    duration_relevance_score,
    device_recommendation_score,
    free_comment
  )
  values (
    v_enrolment.id,
    v_now,
    (p_room_feedback ->> 'reading_fluidity_score')::smallint,
    (p_room_feedback ->> 'material_sufficiency_score')::smallint,
    null,
    null,
    (p_room_feedback ->> 'duration_relevance_score')::smallint,
    null,
    nullif(p_room_feedback ->> 'free_comment', '')
  )
  on conflict (enrolment_id)
  do update set
    submitted_at = excluded.submitted_at,
    reading_fluidity_score = excluded.reading_fluidity_score,
    material_sufficiency_score = excluded.material_sufficiency_score,
    usefulness_score = null,
    experience_quality_score = null,
    duration_relevance_score = excluded.duration_relevance_score,
    device_recommendation_score = null,
    free_comment = excluded.free_comment,
    updated_at = v_now
  returning id into v_room_feedback_id;

  update ops.enrolments
  set
    completed_at = v_now,
    status = 'completed',
    updated_at = v_now
  where id = v_enrolment.id;

  select
    count(*) as nombre_campagnes,
    count(*) filter (where completed_at is not null) as nombre_tests,
    (
      count(*) > 1
      or count(*) filter (where completed_at is not null) > 1
    ) as est_revenu
  into v_metrics
  from ops.enrolments
  where contact_id = v_enrolment.contact_id;

  insert into ops.contact_engagement_status (
    contact_id,
    statut_engagement,
    derniere_action,
    date_derniere_action,
    parcours_complet,
    est_revenu,
    nombre_campagnes,
    nombre_tests,
    nombre_abandons,
    a_relancer,
    blackliste
  )
  values (
    v_enrolment.contact_id,
    'actif',
    'test_complete',
    v_now,
    true,
    coalesce(v_metrics.est_revenu, false),
    coalesce(v_metrics.nombre_campagnes, 1),
    coalesce(v_metrics.nombre_tests, 1),
    0,
    false,
    false
  )
  on conflict (contact_id)
  do update set
    statut_engagement = 'actif',
    derniere_action = 'test_complete',
    date_derniere_action = excluded.date_derniere_action,
    parcours_complet = true,
    est_revenu = excluded.est_revenu,
    nombre_campagnes = excluded.nombre_campagnes,
    nombre_tests = excluded.nombre_tests,
    a_relancer = false,
    updated_at = v_now;

  return jsonb_build_object(
    'ok', true,
    'enrolment_id', v_enrolment.id,
    'contact_id', v_enrolment.contact_id,
    'campaign_id', v_enrolment.campaign_id,
    'test_response_id', v_test_response_id,
    'room_feedback_id', v_room_feedback_id
  );
end;
$$;

revoke all on function signal.submit_signal_test_v3(text, jsonb, jsonb, jsonb) from PUBLIC;
revoke all on function signal.submit_signal_test_v3(text, jsonb, jsonb, jsonb) from anon;
revoke all on function signal.submit_signal_test_v3(text, jsonb, jsonb, jsonb) from authenticated;
grant execute on function signal.submit_signal_test_v3(text, jsonb, jsonb, jsonb) to service_role;

do $$
declare
  v_function regprocedure := 'signal.submit_signal_test_v3(text, jsonb, jsonb, jsonb)'::regprocedure;
  v_compute_function regprocedure := 'signal.compute_test_scores_v3(uuid)'::regprocedure;
  v_trigger_function regprocedure := 'signal.handle_test_response_score()'::regprocedure;
begin
  if exists (
    select 1
    from pg_proc p
    cross join aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
    where p.oid = v_function
      and acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
  ) then
    raise exception 'submit_signal_test_v3_public_execute_not_revoked';
  end if;

  if has_function_privilege('anon', v_function, 'EXECUTE') then
    raise exception 'submit_signal_test_v3_anon_execute_not_revoked';
  end if;

  if has_function_privilege('authenticated', v_function, 'EXECUTE') then
    raise exception 'submit_signal_test_v3_authenticated_execute_not_revoked';
  end if;

  if not has_function_privilege('service_role', v_function, 'EXECUTE') then
    raise exception 'submit_signal_test_v3_service_role_execute_missing';
  end if;

  if has_function_privilege('anon', v_compute_function, 'EXECUTE')
    or has_function_privilege('authenticated', v_compute_function, 'EXECUTE')
    or has_function_privilege('anon', v_trigger_function, 'EXECUTE')
    or has_function_privilege('authenticated', v_trigger_function, 'EXECUTE')
    or exists (
      select 1
      from pg_proc p
      cross join aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
      where (p.oid = v_compute_function or p.oid = v_trigger_function)
        and acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
    )
  then
    raise exception 'signal_v3_internal_function_execute_not_revoked';
  end if;

  if not has_function_privilege('service_role', v_compute_function, 'EXECUTE')
    or not has_function_privilege('service_role', v_trigger_function, 'EXECUTE')
  then
    raise exception 'signal_v3_internal_function_service_role_execute_missing';
  end if;
end $$;

commit;
