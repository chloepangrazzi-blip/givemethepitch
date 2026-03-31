-- SIGNAL V1 - RLS foundation
-- Philosophy:
-- 1. enable RLS everywhere on business tables
-- 2. deny direct browser access by default
-- 3. keep writes flowing through server-side service-role code for now
-- 4. expose analytics/reporting later through controlled views or RPCs

alter table core.contacts enable row level security;
alter table core.panel_profiles enable row level security;
alter table catalog.projects enable row level security;
alter table ops.campaigns enable row level security;
alter table ops.enrolments enable row level security;
alter table ops.events enable row level security;
alter table signal.test_responses enable row level security;
alter table signal.test_scores enable row level security;
alter table signal.test_verbatims enable row level security;
alter table signal.room_feedback enable row level security;
alter table reporting.signal_reports enable row level security;

-- Optional hardening: force RLS even for table owners in normal app usage.
-- Service role still bypasses RLS.
alter table core.contacts force row level security;
alter table core.panel_profiles force row level security;
alter table catalog.projects force row level security;
alter table ops.campaigns force row level security;
alter table ops.enrolments force row level security;
alter table ops.events force row level security;
alter table signal.test_responses force row level security;
alter table signal.test_scores force row level security;
alter table signal.test_verbatims force row level security;
alter table signal.room_feedback force row level security;
alter table reporting.signal_reports force row level security;

-- Remove permissive leftovers if the script is re-run.
drop policy if exists contacts_no_access on core.contacts;
drop policy if exists panel_profiles_no_access on core.panel_profiles;
drop policy if exists projects_no_access on catalog.projects;
drop policy if exists campaigns_no_access on ops.campaigns;
drop policy if exists enrolments_no_access on ops.enrolments;
drop policy if exists events_no_access on ops.events;
drop policy if exists test_responses_no_access on signal.test_responses;
drop policy if exists test_scores_no_access on signal.test_scores;
drop policy if exists test_verbatims_no_access on signal.test_verbatims;
drop policy if exists room_feedback_no_access on signal.room_feedback;
drop policy if exists signal_reports_no_access on reporting.signal_reports;

-- Create explicit deny-all placeholders.
-- PostgreSQL RLS is deny-by-default once enabled and no policy matches,
-- but naming these helps make intent obvious in the dashboard.
create policy contacts_no_access on core.contacts
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy panel_profiles_no_access on core.panel_profiles
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy projects_no_access on catalog.projects
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy campaigns_no_access on ops.campaigns
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy enrolments_no_access on ops.enrolments
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy events_no_access on ops.events
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy test_responses_no_access on signal.test_responses
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy test_scores_no_access on signal.test_scores
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy test_verbatims_no_access on signal.test_verbatims
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy room_feedback_no_access on signal.room_feedback
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

create policy signal_reports_no_access on reporting.signal_reports
as restrictive
for all
to authenticated, anon
using (false)
with check (false);

-- Grants for API usage through server-side code.
-- In Supabase, the service_role bypasses RLS, but schema/table grants must still exist.
grant usage on schema core, catalog, ops, signal, reporting, analytics to anon, authenticated;
grant all on all tables in schema core to service_role;
grant all on all tables in schema catalog to service_role;
grant all on all tables in schema ops to service_role;
grant all on all tables in schema signal to service_role;
grant all on all tables in schema reporting to service_role;
grant all on all sequences in schema core to service_role;
grant all on all sequences in schema catalog to service_role;
grant all on all sequences in schema ops to service_role;
grant all on all sequences in schema signal to service_role;
grant all on all sequences in schema reporting to service_role;

-- Read-only grants for future internal server-rendered queries if needed.
grant select on analytics.v_campaign_signal_scores to authenticated;
grant select on analytics.v_campaign_scores_by_age_band to authenticated;
grant select on analytics.v_campaign_scores_by_declared_main_genre to authenticated;
grant select on analytics.v_campaign_scores_by_liked_genre to authenticated;

-- NOTE:
-- We intentionally do NOT open browser-side insert/update policies yet.
-- Next step after this script: create RPCs / server endpoints for each form flow.
