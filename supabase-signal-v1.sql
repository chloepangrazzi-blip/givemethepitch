create extension if not exists pgcrypto;

create schema if not exists core;
create schema if not exists catalog;
create schema if not exists ops;
create schema if not exists signal;
create schema if not exists reporting;
create schema if not exists analytics;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists core.contacts (
  id uuid primary key default gen_random_uuid(),
  contact_kind text not null default 'panelist'
    check (contact_kind in ('panelist', 'producer', 'admin', 'other')),
  first_name text,
  last_name text,
  email text unique,
  phone text,
  city text,
  country text,
  consent_email boolean not null default false,
  consent_sms boolean not null default false,
  consent_research boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'blocked', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.panel_profiles (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null unique references core.contacts(id) on delete cascade,
  age_band text,
  gender text,
  viewing_frequency text,
  platforms text[] not null default '{}',
  liked_genres text[] not null default '{}',
  main_genre text,
  french_series_perception text,
  french_series_reason text,
  recommendation_frequency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists catalog.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  main_genre text not null,
  secondary_genre text,
  format text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  short_description text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ops.campaigns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references catalog.projects(id) on delete restrict,
  name text not null,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'active', 'closed', 'archived')),
  campaign_type text not null default 'panel_test',
  start_at timestamptz,
  end_at timestamptz,
  nda_version text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ops.enrolments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references core.contacts(id) on delete cascade,
  campaign_id uuid not null references ops.campaigns(id) on delete cascade,
  invited_at timestamptz,
  nda_accepted boolean not null default false,
  nda_accepted_at timestamptz,
  nda_version text,
  access_granted boolean not null default false,
  access_code text,
  started_at timestamptz,
  completed_at timestamptz,
  status text not null default 'invited'
    check (status in ('invited', 'access_granted', 'started', 'completed', 'declined', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contact_id, campaign_id),
  unique (access_code)
);

create table if not exists ops.events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references core.contacts(id) on delete set null,
  campaign_id uuid references ops.campaigns(id) on delete set null,
  enrolment_id uuid references ops.enrolments(id) on delete set null,
  event_type text not null,
  event_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists signal.test_responses (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null unique references ops.enrolments(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  immediate_reaction_score smallint check (immediate_reaction_score between 1 and 5),
  promise_clarity_score smallint check (promise_clarity_score between 1 and 5),
  watch_intent_score smallint check (watch_intent_score between 1 and 5),
  emotional_intensity_score smallint check (emotional_intensity_score between 1 and 5),
  mood_clarity_score smallint check (mood_clarity_score between 1 and 5),
  character_interest_score smallint check (character_interest_score between 1 and 5),
  character_projection_score smallint check (character_projection_score between 1 and 5),
  continue_intent_score smallint check (continue_intent_score between 1 and 5),
  recommendation_score smallint check (recommendation_score between 1 and 5),
  talkability_score smallint check (talkability_score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signal.test_scores (
  id uuid primary key default gen_random_uuid(),
  test_response_id uuid not null unique references signal.test_responses(id) on delete cascade,
  hook_score numeric(5,2) not null,
  feel_score numeric(5,2) not null,
  care_score numeric(5,2) not null,
  continue_score numeric(5,2) not null,
  share_score numeric(5,2) not null,
  desirability_score numeric(5,2) not null,
  scoring_model_version text not null default 'signal_v1',
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signal.test_verbatims (
  id uuid primary key default gen_random_uuid(),
  test_response_id uuid not null references signal.test_responses(id) on delete cascade,
  question_code text not null,
  verbatim_text text not null,
  theme_primary text,
  theme_secondary text,
  sentiment text,
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signal.room_feedback (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null unique references ops.enrolments(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  reading_fluidity_score smallint check (reading_fluidity_score between 1 and 5),
  material_sufficiency_score smallint check (material_sufficiency_score between 1 and 5),
  usefulness_score smallint check (usefulness_score between 1 and 5),
  experience_quality_score smallint check (experience_quality_score between 1 and 5),
  duration_relevance_score smallint check (duration_relevance_score between 1 and 5),
  device_recommendation_score smallint check (device_recommendation_score between 1 and 5),
  free_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reporting.signal_reports (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references ops.campaigns(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'ready', 'published', 'archived')),
  sample_size integer not null default 0,
  desirability_score numeric(5,2),
  hook_score numeric(5,2),
  feel_score numeric(5,2),
  care_score numeric(5,2),
  continue_score numeric(5,2),
  share_score numeric(5,2),
  strengths_summary text,
  weaknesses_summary text,
  segment_insights jsonb not null default '{}'::jsonb,
  qualitative_summary text,
  executive_summary text,
  aggregates_payload jsonb not null default '{}'::jsonb,
  report_version integer not null default 1,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, report_version)
);

create index if not exists contacts_email_idx on core.contacts (email);
create index if not exists contacts_kind_idx on core.contacts (contact_kind);
create index if not exists panel_profiles_main_genre_idx on core.panel_profiles (main_genre);
create index if not exists projects_slug_idx on catalog.projects (slug);
create index if not exists projects_main_genre_idx on catalog.projects (main_genre);
create index if not exists campaigns_project_id_idx on ops.campaigns (project_id);
create index if not exists enrolments_campaign_id_idx on ops.enrolments (campaign_id);
create index if not exists enrolments_contact_id_idx on ops.enrolments (contact_id);
create index if not exists enrolments_status_idx on ops.enrolments (status);
create index if not exists events_type_idx on ops.events (event_type);
create index if not exists events_campaign_id_idx on ops.events (campaign_id);
create index if not exists test_verbatims_response_id_idx on signal.test_verbatims (test_response_id);
create index if not exists signal_reports_campaign_id_idx on reporting.signal_reports (campaign_id);

create trigger set_updated_at_contacts
before update on core.contacts
for each row execute function public.set_updated_at();

create trigger set_updated_at_panel_profiles
before update on core.panel_profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_projects
before update on catalog.projects
for each row execute function public.set_updated_at();

create trigger set_updated_at_campaigns
before update on ops.campaigns
for each row execute function public.set_updated_at();

create trigger set_updated_at_enrolments
before update on ops.enrolments
for each row execute function public.set_updated_at();

create trigger set_updated_at_test_responses
before update on signal.test_responses
for each row execute function public.set_updated_at();

create trigger set_updated_at_test_scores
before update on signal.test_scores
for each row execute function public.set_updated_at();

create trigger set_updated_at_test_verbatims
before update on signal.test_verbatims
for each row execute function public.set_updated_at();

create trigger set_updated_at_room_feedback
before update on signal.room_feedback
for each row execute function public.set_updated_at();

create trigger set_updated_at_signal_reports
before update on reporting.signal_reports
for each row execute function public.set_updated_at();

create or replace function signal.normalize_likert_5_to_100(input_value smallint)
returns numeric
language sql
immutable
as $$
  select case
    when input_value is null then null
    else round((((input_value::numeric - 1) / 4) * 100), 2)
  end;
$$;

create or replace function signal.compute_test_scores(p_test_response_id uuid, p_scoring_model_version text default 'signal_v1')
returns signal.test_scores
language plpgsql
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
    signal.normalize_likert_5_to_100(response_row.immediate_reaction_score) +
    signal.normalize_likert_5_to_100(response_row.promise_clarity_score)
  ) / 2, 2);

  v_feel := round((
    signal.normalize_likert_5_to_100(response_row.emotional_intensity_score) +
    signal.normalize_likert_5_to_100(response_row.mood_clarity_score)
  ) / 2, 2);

  v_care := round((
    signal.normalize_likert_5_to_100(response_row.character_interest_score) +
    signal.normalize_likert_5_to_100(response_row.character_projection_score)
  ) / 2, 2);

  v_continue := round((
    signal.normalize_likert_5_to_100(response_row.watch_intent_score) +
    signal.normalize_likert_5_to_100(response_row.continue_intent_score)
  ) / 2, 2);

  v_share := round((
    signal.normalize_likert_5_to_100(response_row.recommendation_score) +
    signal.normalize_likert_5_to_100(response_row.talkability_score)
  ) / 2, 2);

  v_desirability := round((v_hook + v_feel + v_care + v_continue + v_share) / 5, 2);

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
    p_scoring_model_version,
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

create or replace function signal.handle_test_response_score()
returns trigger
language plpgsql
as $$
begin
  perform signal.compute_test_scores(new.id);
  return new;
end;
$$;

create trigger compute_scores_after_test_response
after insert or update on signal.test_responses
for each row execute function signal.handle_test_response_score();

create or replace view analytics.v_campaign_signal_scores as
select
  c.id as campaign_id,
  c.name as campaign_name,
  p.id as project_id,
  p.name as project_name,
  p.main_genre as project_main_genre,
  count(ts.id) as sample_size,
  round(avg(ts.desirability_score), 2) as desirability_score,
  round(avg(ts.hook_score), 2) as hook_score,
  round(avg(ts.feel_score), 2) as feel_score,
  round(avg(ts.care_score), 2) as care_score,
  round(avg(ts.continue_score), 2) as continue_score,
  round(avg(ts.share_score), 2) as share_score
from ops.campaigns c
join catalog.projects p on p.id = c.project_id
left join ops.enrolments e on e.campaign_id = c.id
left join signal.test_responses tr on tr.enrolment_id = e.id
left join signal.test_scores ts on ts.test_response_id = tr.id
group by c.id, c.name, p.id, p.name, p.main_genre;

create or replace view analytics.v_campaign_scores_by_age_band as
select
  c.id as campaign_id,
  pp.age_band,
  count(ts.id) as sample_size,
  round(avg(ts.desirability_score), 2) as desirability_score,
  round(avg(ts.hook_score), 2) as hook_score,
  round(avg(ts.feel_score), 2) as feel_score,
  round(avg(ts.care_score), 2) as care_score,
  round(avg(ts.continue_score), 2) as continue_score,
  round(avg(ts.share_score), 2) as share_score
from ops.campaigns c
join ops.enrolments e on e.campaign_id = c.id
join core.panel_profiles pp on pp.contact_id = e.contact_id
join signal.test_responses tr on tr.enrolment_id = e.id
join signal.test_scores ts on ts.test_response_id = tr.id
group by c.id, pp.age_band;

create or replace view analytics.v_campaign_scores_by_declared_main_genre as
select
  c.id as campaign_id,
  pp.main_genre as declared_main_genre,
  count(ts.id) as sample_size,
  round(avg(ts.desirability_score), 2) as desirability_score,
  round(avg(ts.hook_score), 2) as hook_score,
  round(avg(ts.feel_score), 2) as feel_score,
  round(avg(ts.care_score), 2) as care_score,
  round(avg(ts.continue_score), 2) as continue_score,
  round(avg(ts.share_score), 2) as share_score
from ops.campaigns c
join ops.enrolments e on e.campaign_id = c.id
join core.panel_profiles pp on pp.contact_id = e.contact_id
join signal.test_responses tr on tr.enrolment_id = e.id
join signal.test_scores ts on ts.test_response_id = tr.id
group by c.id, pp.main_genre;

create or replace view analytics.v_campaign_scores_by_liked_genre as
select
  c.id as campaign_id,
  liked_genre.genre as liked_genre,
  count(ts.id) as sample_size,
  round(avg(ts.desirability_score), 2) as desirability_score,
  round(avg(ts.hook_score), 2) as hook_score,
  round(avg(ts.feel_score), 2) as feel_score,
  round(avg(ts.care_score), 2) as care_score,
  round(avg(ts.continue_score), 2) as continue_score,
  round(avg(ts.share_score), 2) as share_score
from ops.campaigns c
join ops.enrolments e on e.campaign_id = c.id
join core.panel_profiles pp on pp.contact_id = e.contact_id
join signal.test_responses tr on tr.enrolment_id = e.id
join signal.test_scores ts on ts.test_response_id = tr.id
cross join lateral unnest(pp.liked_genres) as liked_genre(genre)
group by c.id, liked_genre.genre;
