-- supabase/seed.sql
-- Seeds the principal account into the single-row JSONB store used by the API.
-- Safe to re-run: it never overwrites existing data or duplicates the principal.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.reelearn_state (
  id   smallint primary key check (id = 1),
  data jsonb not null
);

-- Data holds password hashes; block Supabase's public REST API from reading it.
-- The API connects as the postgres role via DATABASE_URL, which bypasses RLS.
alter table public.reelearn_state enable row level security;

-- Create the state row with all 14 empty model arrays (no-op if it exists).
insert into public.reelearn_state (id, data)
values (1, '{
  "user": [], "classroom": [], "classEnrollment": [], "subject": [],
  "question": [], "quiz": [], "quizQuestion": [], "assignment": [],
  "quizAttempt": [], "studentQuestionAnswer": [], "revisionPost": [],
  "revisionInteraction": [], "revisionReview": [], "meeting": []
}'::jsonb)
on conflict (id) do nothing;

-- Append the principal only if that email doesn't already exist.
update public.reelearn_state
set data = jsonb_set(
  data,
  '{user}',
  coalesce(data->'user', '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'id', 'principal-' || encode(extensions.digest('principal@reelearn.dev', 'sha256'), 'hex'),
      'name', 'School Principal',
      'email', 'principal@reelearn.dev',
      'passwordHash', extensions.crypt('Admin@2026', extensions.gen_salt('bf', 12)),
      'role', 'PRINCIPAL',
      'approvalStatus', 'APPROVED',
      'approvedAt', null,
      'approvedById', null,
      'avatarUrl', null,
      'createdAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )
  )
)
where id = 1
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(data->'user', '[]'::jsonb)) u
    where lower(u->>'email') = 'principal@reelearn.dev'
  );