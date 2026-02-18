-- Client portal schema for project tracking, questions, and private file sharing.
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.try_parse_uuid(value text)
returns uuid
language plpgsql
immutable
as $$
begin
  return value::uuid;
exception
  when others then
    return null;
end;
$$;

create or replace function public.storage_project_id(path text)
returns uuid
language sql
immutable
as $$
  select public.try_parse_uuid(split_part(path, '/', 1));
$$;

create or replace function public.is_bootstrap_manager()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select auth.uid() = (
    select u.id
    from auth.users u
    order by u.created_at asc
    limit 1
  );
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'review', 'completed')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  summary text,
  start_date date,
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'manager', 'owner')),
  added_at timestamptz not null default timezone('utc', now()),
  primary key (project_id, user_id)
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  body text not null,
  progress integer check (progress >= 0 and progress <= 100),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text,
  attachment_url text,
  attachment_file_name text,
  attachment_file_path text,
  attachment_mime_type text,
  answered_by uuid references auth.users(id),
  answered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.project_questions
  add column if not exists project_id uuid references public.projects(id) on delete cascade,
  add column if not exists author_id uuid references auth.users(id) on delete cascade,
  add column if not exists question text,
  add column if not exists attachment_url text,
  add column if not exists attachment_file_name text,
  add column if not exists attachment_file_path text,
  add column if not exists attachment_mime_type text;

create table if not exists public.project_question_messages (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.project_questions(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  attachment_url text,
  attachment_file_name text,
  attachment_file_path text,
  attachment_mime_type text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.project_question_messages
  add column if not exists question_id uuid references public.project_questions(id) on delete cascade,
  add column if not exists project_id uuid references public.projects(id) on delete cascade,
  add column if not exists author_id uuid references auth.users(id) on delete cascade,
  add column if not exists message text,
  add column if not exists attachment_url text,
  add column if not exists attachment_file_name text,
  add column if not exists attachment_file_path text,
  add column if not exists attachment_mime_type text;

insert into public.project_question_messages (
  question_id,
  project_id,
  author_id,
  message,
  attachment_url,
  attachment_file_name,
  attachment_file_path,
  attachment_mime_type,
  created_at
)
select
  q.id,
  q.project_id,
  q.author_id,
  q.question,
  q.attachment_url,
  q.attachment_file_name,
  q.attachment_file_path,
  q.attachment_mime_type,
  q.created_at
from public.project_questions q
where q.question is not null
  and q.author_id is not null
  and q.project_id is not null
  and not exists (
    select 1
    from public.project_question_messages m
    where m.question_id = q.id
  );

insert into public.project_question_messages (
  question_id,
  project_id,
  author_id,
  message,
  created_at
)
select
  q.id,
  q.project_id,
  q.answered_by,
  q.answer,
  coalesce(q.answered_at, q.created_at)
from public.project_questions q
where q.answer is not null
  and q.answer <> ''
  and q.answered_by is not null
  and q.project_id is not null
  and not exists (
    select 1
    from public.project_question_messages m
    where m.question_id = q.id
      and m.author_id = q.answered_by
      and m.message = q.answer
  );

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null unique,
  mime_type text,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_client_intake (
  project_id uuid primary key references public.projects(id) on delete cascade,
  company_name text,
  website_url text,
  target_audience text,
  primary_goal text,
  secondary_goal text,
  timeline_goal text,
  success_metrics text,
  service_needs text[] not null default '{}'::text[],
  cms_platform text,
  notes text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_access_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  access_key text not null,
  title text not null,
  description text,
  service_area text,
  status text not null default 'missing' check (status in ('missing', 'submitted', 'verified', 'not_needed')),
  login_url text,
  account_email text,
  username text,
  secret_value text,
  secure_link text,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (project_id, access_key)
);

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  details text,
  due_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_approval_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'changes_requested')),
  requested_by uuid references auth.users(id),
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  client_note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_members_user_id on public.project_members(user_id);
create index if not exists idx_project_updates_project_id_created_at on public.project_updates(project_id, created_at desc);
create index if not exists idx_project_questions_project_id_created_at on public.project_questions(project_id, created_at desc);
create index if not exists idx_project_question_messages_project_id_created_at on public.project_question_messages(project_id, created_at asc);
create index if not exists idx_project_question_messages_question_id_created_at on public.project_question_messages(question_id, created_at asc);
create index if not exists idx_project_files_project_id_created_at on public.project_files(project_id, created_at desc);
create index if not exists idx_project_client_intake_updated_at on public.project_client_intake(updated_at desc);
create index if not exists idx_project_access_items_project_id_created_at on public.project_access_items(project_id, created_at asc);
create index if not exists idx_project_milestones_project_id_sort on public.project_milestones(project_id, sort_order asc, created_at asc);
create index if not exists idx_project_approval_tasks_project_id_created_at on public.project_approval_tasks(project_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists project_client_intake_set_updated_at on public.project_client_intake;
create trigger project_client_intake_set_updated_at
before update on public.project_client_intake
for each row execute function public.set_updated_at();

drop trigger if exists project_access_items_set_updated_at on public.project_access_items;
create trigger project_access_items_set_updated_at
before update on public.project_access_items
for each row execute function public.set_updated_at();

create or replace function public.is_project_member(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_bootstrap_manager() or exists (
    select 1
    from public.project_members pm
    where pm.project_id = project_uuid
      and pm.user_id = auth.uid()
  );
$$;

create or replace function public.is_project_admin(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_bootstrap_manager() or exists (
    select 1
    from public.project_members pm
    where pm.project_id = project_uuid
      and pm.user_id = auth.uid()
      and pm.role in ('manager', 'owner')
  );
$$;

create or replace function public.assign_client_to_project(
  project_uuid uuid,
  client_email text,
  client_role text default 'client'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid;
begin
  if not public.is_project_admin(project_uuid) then
    raise exception 'not_authorized';
  end if;

  if client_role not in ('client', 'manager', 'owner') then
    raise exception 'invalid_role';
  end if;

  select u.id
  into target_user_id
  from auth.users u
  where lower(u.email) = lower(trim(client_email))
  order by u.created_at asc
  limit 1;

  if target_user_id is null then
    raise exception 'user_not_found';
  end if;

  insert into public.project_members (project_id, user_id, role)
  values (project_uuid, target_user_id, client_role)
  on conflict (project_id, user_id) do update
  set role = excluded.role;

  return target_user_id;
end;
$$;

drop function if exists public.search_project_user_emails(uuid, text, integer);

create function public.search_project_user_emails(
  project_uuid uuid,
  search_query text,
  result_limit integer default 8
)
returns table(email text, full_name text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  query_text text := lower(trim(search_query));
  safe_limit integer := greatest(1, least(coalesce(result_limit, 8), 20));
begin
  if not public.is_project_admin(project_uuid) then
    return;
  end if;

  if query_text is null or char_length(query_text) < 2 then
    return;
  end if;

  return query
  select
    u.email::text,
    nullif(
      trim(
        coalesce(
          u.raw_user_meta_data ->> 'registered_full_name',
          u.raw_user_meta_data ->> 'full_name',
          u.raw_user_meta_data ->> 'name',
          u.raw_user_meta_data ->> 'fullName',
          ident.identity_data ->> 'full_name',
          ident.identity_data ->> 'name',
          ident.identity_data ->> 'fullName',
          ''
        )
      ),
      ''
    )::text
  from auth.users u
  left join lateral (
    select i.identity_data
    from auth.identities i
    where i.user_id = u.id
    limit 1
  ) ident on true
  where u.email is not null
    and lower(u.email) like query_text || '%'
  order by u.email asc
  limit safe_limit;
end;
$$;

revoke all on function public.is_project_member(uuid) from public;
grant execute on function public.is_project_member(uuid) to authenticated;

revoke all on function public.is_project_admin(uuid) from public;
grant execute on function public.is_project_admin(uuid) to authenticated;

revoke all on function public.is_bootstrap_manager() from public;
grant execute on function public.is_bootstrap_manager() to authenticated;

revoke all on function public.assign_client_to_project(uuid, text, text) from public;
grant execute on function public.assign_client_to_project(uuid, text, text) to authenticated;

revoke all on function public.search_project_user_emails(uuid, text, integer) from public;
grant execute on function public.search_project_user_emails(uuid, text, integer) to authenticated;

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_questions enable row level security;
alter table public.project_question_messages enable row level security;
alter table public.project_files enable row level security;
alter table public.project_client_intake enable row level security;
alter table public.project_access_items enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_approval_tasks enable row level security;

drop policy if exists "Members can view projects" on public.projects;
create policy "Members can view projects"
on public.projects
for select
to authenticated
using (public.is_project_member(id));

drop policy if exists "Managers can update projects" on public.projects;
create policy "Managers can update projects"
on public.projects
for update
to authenticated
using (public.is_project_admin(id))
with check (public.is_project_admin(id));

drop policy if exists "Managers can create projects" on public.projects;
create policy "Managers can create projects"
on public.projects
for insert
to authenticated
with check (public.is_bootstrap_manager());

drop policy if exists "Members can view project memberships" on public.project_members;
create policy "Members can view project memberships"
on public.project_members
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Managers can manage memberships" on public.project_members;
create policy "Managers can manage memberships"
on public.project_members
for all
to authenticated
using (public.is_project_admin(project_id))
with check (public.is_project_admin(project_id));

drop policy if exists "Members can view updates" on public.project_updates;
create policy "Members can view updates"
on public.project_updates
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Managers can write updates" on public.project_updates;
drop policy if exists "Managers can insert updates" on public.project_updates;
create policy "Managers can insert updates"
on public.project_updates
for insert
to authenticated
with check (
  public.is_project_admin(project_id)
  and created_by = auth.uid()
);

drop policy if exists "Managers can update updates" on public.project_updates;
create policy "Managers can update updates"
on public.project_updates
for update
to authenticated
using (public.is_project_admin(project_id))
with check (public.is_project_admin(project_id));

drop policy if exists "Managers can delete updates" on public.project_updates;
create policy "Managers can delete updates"
on public.project_updates
for delete
to authenticated
using (public.is_project_admin(project_id));

drop policy if exists "Members can view questions" on public.project_questions;
create policy "Members can view questions"
on public.project_questions
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Members can insert questions" on public.project_questions;
create policy "Members can insert questions"
on public.project_questions
for insert
to authenticated
with check (
  public.is_project_member(project_id)
  and author_id = auth.uid()
);

drop policy if exists "Managers can answer questions" on public.project_questions;
create policy "Managers can answer questions"
on public.project_questions
for update
to authenticated
using (public.is_project_admin(project_id))
with check (
  public.is_project_admin(project_id)
  and answered_by = auth.uid()
);

drop policy if exists "Members can view question messages" on public.project_question_messages;
create policy "Members can view question messages"
on public.project_question_messages
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Members can insert question messages" on public.project_question_messages;
create policy "Members can insert question messages"
on public.project_question_messages
for insert
to authenticated
with check (
  public.is_project_member(project_id)
  and author_id = auth.uid()
  and exists (
    select 1
    from public.project_questions q
    where q.id = question_id
      and q.project_id = project_id
  )
);

drop policy if exists "Members can view project files" on public.project_files;
create policy "Members can view project files"
on public.project_files
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Members can add project files" on public.project_files;
create policy "Members can add project files"
on public.project_files
for insert
to authenticated
with check (
  public.is_project_member(project_id)
  and uploaded_by = auth.uid()
);

drop policy if exists "Members can view intake" on public.project_client_intake;
create policy "Members can view intake"
on public.project_client_intake
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Members can insert intake" on public.project_client_intake;
create policy "Members can insert intake"
on public.project_client_intake
for insert
to authenticated
with check (
  public.is_project_member(project_id)
  and updated_by = auth.uid()
);

drop policy if exists "Members can update intake" on public.project_client_intake;
create policy "Members can update intake"
on public.project_client_intake
for update
to authenticated
using (public.is_project_member(project_id))
with check (
  public.is_project_member(project_id)
  and updated_by = auth.uid()
);

drop policy if exists "Members can view access items" on public.project_access_items;
create policy "Members can view access items"
on public.project_access_items
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Members can insert access items" on public.project_access_items;
create policy "Members can insert access items"
on public.project_access_items
for insert
to authenticated
with check (
  public.is_project_member(project_id)
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

drop policy if exists "Members can update access items" on public.project_access_items;
create policy "Members can update access items"
on public.project_access_items
for update
to authenticated
using (public.is_project_member(project_id))
with check (
  public.is_project_member(project_id)
  and updated_by = auth.uid()
);

drop policy if exists "Members can view milestones" on public.project_milestones;
create policy "Members can view milestones"
on public.project_milestones
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Managers can manage milestones" on public.project_milestones;
create policy "Managers can manage milestones"
on public.project_milestones
for all
to authenticated
using (public.is_project_admin(project_id))
with check (public.is_project_admin(project_id));

drop policy if exists "Members can view approvals" on public.project_approval_tasks;
create policy "Members can view approvals"
on public.project_approval_tasks
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Managers can create approvals" on public.project_approval_tasks;
create policy "Managers can create approvals"
on public.project_approval_tasks
for insert
to authenticated
with check (
  public.is_project_admin(project_id)
  and requested_by = auth.uid()
);

drop policy if exists "Members can update approvals" on public.project_approval_tasks;
create policy "Members can update approvals"
on public.project_approval_tasks
for update
to authenticated
using (public.is_project_member(project_id))
with check (public.is_project_member(project_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files',
  'project-files',
  false,
  20971520,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members can read storage files" on storage.objects;
create policy "Members can read storage files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-files'
  and public.storage_project_id(name) is not null
  and public.is_project_member(public.storage_project_id(name))
);

drop policy if exists "Members can upload storage files" on storage.objects;
create policy "Members can upload storage files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-files'
  and public.storage_project_id(name) is not null
  and public.is_project_member(public.storage_project_id(name))
);
