create extension if not exists pgcrypto;

create table if not exists public.room_access_requests (
  id uuid primary key default gen_random_uuid(),
  access_code text not null unique,
  email text not null,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  nda_signed_at timestamptz,
  session_slug text not null default 'mareenoire',
  profile jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  nda_identity jsonb
);

create unique index if not exists room_access_requests_access_code_idx
  on public.room_access_requests (access_code);
