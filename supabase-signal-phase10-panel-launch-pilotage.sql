create or replace view "02_pilot_recrutement"."01_lancement_panel" as
with latest_enrolment as (
  select
    e.*,
    row_number() over (
      partition by e.contact_id
      order by coalesce(e.completed_at, e.nda_accepted_at, e.started_at, e.invited_at, e.created_at) desc, e.created_at desc
    ) as rn
  from ops.enrolments e
),
latest_test as (
  select
    tr.*,
    row_number() over (
      partition by tr.enrolment_id
      order by coalesce(tr.submitted_at, tr.created_at) desc, tr.created_at desc
    ) as rn
  from signal.test_responses tr
),
base as (
  select
    lo.operation_lancement_code as code_operation,
    c.contact_code as code_contact,
    coalesce(concat_ws(' ', c.first_name, c.last_name), lo.nom_snapshot) as nom_complet,
    coalesce(c.email, lo.email_snapshot) as email,
    le.access_code as code_acces,
    camp.campagne_code as code_campagne,
    camp.name as campagne,
    p.projet_code as code_projet,
    p.name as projet,
    lo.envoye_le,
    lo.ouvert_le,
    lo.clique_le,
    lo.cle_activee_le,
    lo.formulaire_commence_le,
    lo.formulaire_termine_le,
    le.started_at as cle_verifiee_le,
    le.nda_accepted_at as nda_signee_le,
    le.completed_at as test_complete_le,
    le.status as statut_enrolment,
    lt.reponse_test_code as code_test,
    lo.statut_operation,
    lo.nombre_relances,
    lo.relance_a_faire,
    lo.derniere_relance_le,
    nullif(greatest(
      coalesce(le.completed_at, '-infinity'::timestamptz),
      coalesce(le.nda_accepted_at, '-infinity'::timestamptz),
      coalesce(le.started_at, '-infinity'::timestamptz),
      coalesce(lo.cle_activee_le, '-infinity'::timestamptz),
      coalesce(lo.formulaire_termine_le, '-infinity'::timestamptz),
      coalesce(lo.formulaire_commence_le, '-infinity'::timestamptz),
      coalesce(lo.clique_le, '-infinity'::timestamptz),
      coalesce(lo.ouvert_le, '-infinity'::timestamptz),
      coalesce(lo.envoye_le, '-infinity'::timestamptz)
    ), '-infinity'::timestamptz) as derniere_etape_le
  from ops.launch_operations lo
  left join core.contacts c on c.id = lo.contact_id
  left join latest_enrolment le on le.contact_id = lo.contact_id and le.rn = 1
  left join ops.campaigns camp on camp.id = le.campaign_id
  left join catalog.projects p on p.id = camp.project_id
  left join latest_test lt on lt.enrolment_id = le.id and lt.rn = 1
  where lo.cible_role = 'paneliste'
),
enriched as (
  select
    base.*,
    case
      when base.test_complete_le is not null then 'test_termine'
      when base.nda_signee_le is not null then 'nda_signee'
      when coalesce(base.cle_verifiee_le, base.cle_activee_le) is not null then 'cle_verifiee'
      when base.formulaire_termine_le is not null then 'questionnaire_termine'
      when base.formulaire_commence_le is not null then 'questionnaire_commence'
      when base.clique_le is not null then 'mail_clique'
      when base.ouvert_le is not null then 'mail_ouvert'
      when base.envoye_le is not null then 'mail_envoye'
      else 'a_envoyer'
    end as etat_parcours_global,
    case
      when base.test_complete_le is not null then null
      when base.nda_signee_le is not null then 'test_a_finaliser'
      when coalesce(base.cle_verifiee_le, base.cle_activee_le) is not null then 'nda_a_signer'
      when base.formulaire_termine_le is not null then 'cle_a_verifier'
      when base.formulaire_commence_le is not null then 'questionnaire_a_terminer'
      when base.clique_le is not null then 'questionnaire_non_demarre'
      when base.envoye_le is not null then 'invitation_sans_clic'
      else null
    end as motif_relance,
    case
      when base.test_complete_le is not null then null
      when base.nda_signee_le is not null then base.nda_signee_le + interval '2 days'
      when coalesce(base.cle_verifiee_le, base.cle_activee_le) is not null then coalesce(base.cle_verifiee_le, base.cle_activee_le) + interval '2 days'
      when base.formulaire_termine_le is not null then base.formulaire_termine_le + interval '2 days'
      when base.formulaire_commence_le is not null then base.formulaire_commence_le + interval '2 days'
      when base.clique_le is not null then base.clique_le + interval '2 days'
      when base.envoye_le is not null then base.envoye_le + interval '3 days'
      else null
    end as prochaine_relance_le
  from base
)
select
  code_operation,
  code_contact,
  nom_complet,
  email,
  to_char(envoye_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_envoi,
  to_char(ouvert_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_ouverture,
  to_char(clique_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_clic,
  to_char(formulaire_commence_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_questionnaire_commence,
  to_char(formulaire_termine_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_questionnaire_termine,
  statut_operation,
  nombre_relances,
  relance_a_faire,
  code_acces,
  code_campagne,
  campagne,
  code_projet,
  projet,
  to_char(coalesce(cle_verifiee_le, cle_activee_le) at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_verification_cle,
  to_char(nda_signee_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_signature_nda,
  to_char(test_complete_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_test_complete,
  to_char(derniere_etape_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_derniere_etape,
  statut_enrolment,
  etat_parcours_global,
  motif_relance,
  case
    when prochaine_relance_le is not null
      and test_complete_le is null
      and prochaine_relance_le <= now()
    then 'oui'
    else 'non'
  end as relance_recommandee,
  to_char(prochaine_relance_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_prochaine_relance,
  case
    when test_complete_le is not null then 'aucune'
    when nombre_relances >= 2 then 'R3+'
    when nombre_relances = 1 then 'R2'
    when motif_relance is not null then 'R1'
    else null
  end as niveau_relance,
  to_char(derniere_relance_le at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as date_derniere_relance,
  code_test
from enriched
order by coalesce(envoye_le, derniere_etape_le) desc nulls last, code_operation desc;
