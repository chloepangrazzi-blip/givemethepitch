# Supabase SIGNAL V1 Guide

## Ce que je t'ai préparé
- Un script SQL complet : `supabase-signal-v1.sql`
- Il crée la structure V1 du noyau panel / SIGNAL
- Il inclut les tables, contraintes, index, triggers, fonction de scoring et premières vues analytics

## Ce que tu fais concrètement dans Supabase
1. Ouvre ton projet Supabase
2. Va dans `SQL Editor`
3. Crée une nouvelle query
4. Ouvre le fichier `supabase-signal-v1.sql`
5. Copie-colle tout le contenu dans le SQL Editor
6. Clique sur `Run`

## Ce que tu dois voir après exécution
Tu dois voir les schémas suivants dans `Database` :
- `core`
- `catalog`
- `ops`
- `signal`
- `reporting`
- `analytics`

Et les tables suivantes :
- `core.contacts`
- `core.panel_profiles`
- `catalog.projects`
- `ops.campaigns`
- `ops.enrolments`
- `ops.events`
- `signal.test_responses`
- `signal.test_scores`
- `signal.test_verbatims`
- `signal.room_feedback`
- `reporting.signal_reports`

## Ce que fait déjà le script
- `test_scores` est recalculé automatiquement après chaque insert / update sur `signal.test_responses`
- Les 5 sous-scores SIGNAL sont calculés sur 100
- Le score global de désirabilité est la moyenne simple des 5 sous-scores
- Les vues analytics permettent déjà de lire les scores :
  - par campagne
  - par tranche d'âge
  - par genre principal déclaré
  - par genres aimés

## Ce que tu auras encore à faire ensuite
Pas tout de suite, mais juste après ce script :
1. me confirmer que le script est bien passé
2. me donner les infos du projet Supabase
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - plus tard `SUPABASE_SERVICE_ROLE_KEY`
3. ensuite je préparerai pour toi :
   - les policies RLS
   - les fonctions / RPC utiles
   - le branchement des formulaires Next.js

## Important
Ce script pose la base V1. Il n'active pas encore :
- les policies RLS
- les rôles métiers complets
- le vrai branchement front -> Supabase
- l'espace producteurs

Donc après ce script, la base existe, mais elle n'est pas encore connectée à ton produit.
