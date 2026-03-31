-- Phase 9 - Grants additifs service_role
-- Objectif: réaligner les droits serveur sur les tables ajoutées après la phase v1 RLS
-- sans modifier les schémas, les vues ni les données.

grant usage on schema core, catalog, ops, signal, reporting, analytics to service_role;

grant all on all tables in schema core to service_role;
grant all on all tables in schema catalog to service_role;
grant all on all tables in schema ops to service_role;
grant all on all tables in schema signal to service_role;
grant all on all tables in schema reporting to service_role;
grant all on all tables in schema analytics to service_role;

grant all on all sequences in schema core to service_role;
grant all on all sequences in schema catalog to service_role;
grant all on all sequences in schema ops to service_role;
grant all on all sequences in schema signal to service_role;
grant all on all sequences in schema reporting to service_role;
grant all on all sequences in schema analytics to service_role;

alter default privileges in schema core grant all on tables to service_role;
alter default privileges in schema catalog grant all on tables to service_role;
alter default privileges in schema ops grant all on tables to service_role;
alter default privileges in schema signal grant all on tables to service_role;
alter default privileges in schema reporting grant all on tables to service_role;
alter default privileges in schema analytics grant all on tables to service_role;

alter default privileges in schema core grant all on sequences to service_role;
alter default privileges in schema catalog grant all on sequences to service_role;
alter default privileges in schema ops grant all on sequences to service_role;
alter default privileges in schema signal grant all on sequences to service_role;
alter default privileges in schema reporting grant all on sequences to service_role;
alter default privileges in schema analytics grant all on sequences to service_role;
