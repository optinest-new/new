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
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'review', 'completed', 'archived')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  quoted_amount numeric(12, 2),
  amount_paid numeric(12, 2),
  summary text,
  start_date date,
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects
add constraint projects_status_check
check (status in ('planning', 'in_progress', 'review', 'completed', 'archived'));

alter table public.projects
  add column if not exists quoted_amount numeric(12, 2),
  add column if not exists amount_paid numeric(12, 2);

alter table public.projects drop constraint if exists projects_quoted_amount_check;
alter table public.projects
add constraint projects_quoted_amount_check
check (quoted_amount is null or quoted_amount >= 0);

alter table public.projects drop constraint if exists projects_amount_paid_check;
alter table public.projects
add constraint projects_amount_paid_check
check (amount_paid is null or amount_paid >= 0);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'manager', 'owner')),
  added_at timestamptz not null default timezone('utc', now()),
  primary key (project_id, user_id)
);

create table if not exists public.project_member_emails (
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null,
  role text not null default 'client' check (role in ('client', 'manager', 'owner')),
  added_at timestamptz not null default timezone('utc', now()),
  primary key (project_id, email)
);

alter table public.project_member_emails
  add column if not exists project_id uuid references public.projects(id) on delete cascade,
  add column if not exists email text,
  add column if not exists role text not null default 'client',
  add column if not exists added_at timestamptz not null default timezone('utc', now());

alter table public.project_member_emails
  alter column project_id set not null,
  alter column email set not null;

alter table public.project_member_emails drop constraint if exists project_member_emails_role_check;
alter table public.project_member_emails
add constraint project_member_emails_role_check
check (role in ('client', 'manager', 'owner'));

insert into public.project_member_emails (project_id, email, role)
select
  pm.project_id,
  lower(trim(u.email)),
  pm.role
from public.project_members pm
join auth.users u on u.id = pm.user_id
where u.email is not null
  and trim(u.email) <> ''
on conflict (project_id, email) do update
set role = excluded.role;

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

create table if not exists public.project_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  provider text not null default 'paypal' check (provider in ('paypal')),
  provider_order_id text not null,
  provider_capture_id text,
  status text not null default 'created' check (status in ('created', 'approved', 'captured', 'voided', 'failed')),
  amount numeric(12, 2) not null check (amount >= 0),
  currency_code text not null default 'USD',
  payer_user_id uuid references auth.users(id) on delete set null,
  payer_email text,
  provider_payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, provider_order_id)
);

create table if not exists public.project_billing_profiles (
  project_id uuid primary key references public.projects(id) on delete cascade,
  recurring_enabled boolean not null default false,
  recurring_amount numeric(12, 2),
  recurring_interval text not null default 'monthly' check (
    recurring_interval in ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')
  ),
  next_payment_due_at date,
  autopay_provider text check (autopay_provider in ('paypal')),
  notes text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_feature_settings (
  id boolean not null default true,
  manual_payments_enabled boolean not null default true,
  recurring_payments_enabled boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
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

create table if not exists public.portal_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  event_type text not null,
  title text not null,
  message text,
  link_path text,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.portal_notifications
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists project_id uuid references public.projects(id) on delete cascade,
  add column if not exists event_type text,
  add column if not exists title text,
  add column if not exists message text,
  add column if not exists link_path text,
  add column if not exists is_read boolean not null default false,
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.portal_notifications
  alter column user_id set not null,
  alter column event_type set not null,
  alter column title set not null;

create table if not exists public.onboarding_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company_name text,
  phone text,
  services_needed text[] not null default '{}'::text[],
  budget_range text,
  timeline_goal text,
  preferred_call_at timestamptz,
  goals text,
  notes text,
  status text not null default 'call_scheduled' check (
    status in (
      'call_scheduled',
      'qualified',
      'deposited',
      'project_started'
    )
  ),
  manager_notes text,
  proposed_project_name text,
  quoted_amount numeric(12, 2),
  deposit_amount numeric(12, 2),
  payment_reference text,
  converted_project_id uuid references public.projects(id) on delete set null,
  converted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_magnet_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  post_slug text,
  post_title text,
  magnet_title text not null,
  page_path text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.onboarding_leads
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists company_name text,
  add column if not exists phone text,
  add column if not exists services_needed text[] not null default '{}'::text[],
  add column if not exists budget_range text,
  add column if not exists timeline_goal text,
  add column if not exists preferred_call_at timestamptz,
  add column if not exists goals text,
  add column if not exists notes text,
  add column if not exists status text not null default 'call_scheduled',
  add column if not exists manager_notes text,
  add column if not exists proposed_project_name text,
  add column if not exists quoted_amount numeric(12, 2),
  add column if not exists deposit_amount numeric(12, 2),
  add column if not exists payment_reference text,
  add column if not exists converted_project_id uuid references public.projects(id) on delete set null,
  add column if not exists converted_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.onboarding_leads
  alter column full_name set not null,
  alter column email set not null;

alter table public.onboarding_leads drop constraint if exists onboarding_leads_status_check;

update public.onboarding_leads
set status = case
  when status in ('call_scheduled', 'intake_submitted') then 'call_scheduled'
  when status in ('qualified', 'proposal_sent', 'proposal_approved', 'contract_signed', 'invoice_sent', 'not_fit') then 'qualified'
  when status = 'deposit_paid' then 'deposited'
  when status in ('deposited', 'project_started') then status
  else 'call_scheduled'
end;
alter table public.onboarding_leads
add constraint onboarding_leads_status_check
check (
  status in (
    'call_scheduled',
    'qualified',
    'deposited',
    'project_started'
  )
);

alter table public.project_payments
  add column if not exists project_id uuid references public.projects(id) on delete cascade,
  add column if not exists provider text not null default 'paypal',
  add column if not exists provider_order_id text,
  add column if not exists provider_capture_id text,
  add column if not exists status text not null default 'created',
  add column if not exists amount numeric(12, 2) not null default 0,
  add column if not exists currency_code text not null default 'USD',
  add column if not exists payer_user_id uuid references auth.users(id) on delete set null,
  add column if not exists payer_email text,
  add column if not exists provider_payload jsonb,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.project_payments
  alter column project_id set not null,
  alter column provider_order_id set not null,
  alter column amount set not null,
  alter column currency_code set not null;

alter table public.project_payments drop constraint if exists project_payments_provider_check;
alter table public.project_payments
add constraint project_payments_provider_check
check (provider in ('paypal'));

alter table public.project_payments drop constraint if exists project_payments_status_check;
alter table public.project_payments
add constraint project_payments_status_check
check (status in ('created', 'approved', 'captured', 'voided', 'failed'));

alter table public.project_payments drop constraint if exists project_payments_amount_check;
alter table public.project_payments
add constraint project_payments_amount_check
check (amount >= 0);

alter table public.project_billing_profiles
  add column if not exists project_id uuid references public.projects(id) on delete cascade,
  add column if not exists recurring_enabled boolean not null default false,
  add column if not exists recurring_amount numeric(12, 2),
  add column if not exists recurring_interval text not null default 'monthly',
  add column if not exists next_payment_due_at date,
  add column if not exists autopay_provider text,
  add column if not exists notes text,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.project_billing_profiles
  alter column project_id set not null,
  alter column recurring_enabled set not null,
  alter column recurring_interval set not null;

alter table public.project_billing_profiles drop constraint if exists project_billing_profiles_recurring_interval_check;
alter table public.project_billing_profiles
add constraint project_billing_profiles_recurring_interval_check
check (recurring_interval in ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'));

alter table public.project_billing_profiles drop constraint if exists project_billing_profiles_recurring_amount_check;
alter table public.project_billing_profiles
add constraint project_billing_profiles_recurring_amount_check
check (recurring_amount is null or recurring_amount > 0);

alter table public.project_billing_profiles drop constraint if exists project_billing_profiles_autopay_provider_check;
alter table public.project_billing_profiles
add constraint project_billing_profiles_autopay_provider_check
check (autopay_provider is null or autopay_provider in ('paypal'));

alter table public.project_billing_profiles drop constraint if exists project_billing_profiles_schedule_check;
alter table public.project_billing_profiles
add constraint project_billing_profiles_schedule_check
check (
  recurring_enabled = false
  or (recurring_amount is not null and recurring_amount > 0 and next_payment_due_at is not null)
);

alter table public.payment_feature_settings
  add column if not exists id boolean,
  add column if not exists manual_payments_enabled boolean not null default true,
  add column if not exists recurring_payments_enabled boolean not null default true,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.payment_feature_settings
set
  id = coalesce(id, true),
  manual_payments_enabled = coalesce(manual_payments_enabled, true),
  recurring_payments_enabled = coalesce(recurring_payments_enabled, true);

alter table public.payment_feature_settings
  alter column id set default true,
  alter column id set not null,
  alter column manual_payments_enabled set default true,
  alter column manual_payments_enabled set not null,
  alter column recurring_payments_enabled set default true,
  alter column recurring_payments_enabled set not null;

alter table public.payment_feature_settings
drop constraint if exists payment_feature_settings_singleton_check;

alter table public.payment_feature_settings
add constraint payment_feature_settings_singleton_check check (id = true);

delete from public.payment_feature_settings a
using public.payment_feature_settings b
where a.ctid < b.ctid
  and a.id = b.id;

update public.projects p
set
  quoted_amount = coalesce(p.quoted_amount, ol.quoted_amount),
  amount_paid = coalesce(p.amount_paid, ol.deposit_amount)
from public.onboarding_leads ol
where ol.converted_project_id = p.id
  and (
    (p.quoted_amount is null and ol.quoted_amount is not null)
    or (p.amount_paid is null and ol.deposit_amount is not null)
  );

alter table public.lead_magnet_submissions
  add column if not exists email text,
  add column if not exists post_slug text,
  add column if not exists post_title text,
  add column if not exists magnet_title text,
  add column if not exists page_path text,
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.lead_magnet_submissions
  alter column email set not null,
  alter column magnet_title set not null;

create index if not exists idx_project_members_user_id on public.project_members(user_id);
create index if not exists idx_project_member_emails_email on public.project_member_emails(lower(email));
create index if not exists idx_project_updates_project_id_created_at on public.project_updates(project_id, created_at desc);
create index if not exists idx_project_questions_project_id_created_at on public.project_questions(project_id, created_at desc);
create index if not exists idx_project_question_messages_project_id_created_at on public.project_question_messages(project_id, created_at asc);
create index if not exists idx_project_question_messages_question_id_created_at on public.project_question_messages(question_id, created_at asc);
create index if not exists idx_project_files_project_id_created_at on public.project_files(project_id, created_at desc);
create index if not exists idx_project_payments_project_created_at on public.project_payments(project_id, created_at desc);
create unique index if not exists idx_project_payments_provider_order_id on public.project_payments(provider, provider_order_id);
create unique index if not exists idx_project_payments_provider_capture_id on public.project_payments(provider, provider_capture_id) where provider_capture_id is not null;
create index if not exists idx_project_billing_profiles_next_due on public.project_billing_profiles(next_payment_due_at) where recurring_enabled = true;
create unique index if not exists idx_payment_feature_settings_id on public.payment_feature_settings(id);
insert into public.payment_feature_settings (id, manual_payments_enabled, recurring_payments_enabled)
values (true, true, true)
on conflict (id) do nothing;
create index if not exists idx_project_client_intake_updated_at on public.project_client_intake(updated_at desc);
create index if not exists idx_project_access_items_project_id_created_at on public.project_access_items(project_id, created_at asc);
create index if not exists idx_project_milestones_project_id_sort on public.project_milestones(project_id, sort_order asc, created_at asc);
create index if not exists idx_project_approval_tasks_project_id_created_at on public.project_approval_tasks(project_id, created_at desc);
create index if not exists idx_onboarding_leads_created_at on public.onboarding_leads(created_at desc);
create index if not exists idx_onboarding_leads_status on public.onboarding_leads(status);
create index if not exists idx_onboarding_leads_email on public.onboarding_leads(lower(email));
create index if not exists idx_lead_magnet_submissions_created_at on public.lead_magnet_submissions(created_at desc);
create index if not exists idx_lead_magnet_submissions_email on public.lead_magnet_submissions(lower(email));
create index if not exists idx_portal_notifications_user_created_at on public.portal_notifications(user_id, created_at desc);
create index if not exists idx_portal_notifications_user_read on public.portal_notifications(user_id, is_read);

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

drop trigger if exists project_payments_set_updated_at on public.project_payments;
create trigger project_payments_set_updated_at
before update on public.project_payments
for each row execute function public.set_updated_at();

drop trigger if exists project_billing_profiles_set_updated_at on public.project_billing_profiles;
create trigger project_billing_profiles_set_updated_at
before update on public.project_billing_profiles
for each row execute function public.set_updated_at();

drop trigger if exists payment_feature_settings_set_updated_at on public.payment_feature_settings;
create trigger payment_feature_settings_set_updated_at
before update on public.payment_feature_settings
for each row execute function public.set_updated_at();

drop trigger if exists onboarding_leads_set_updated_at on public.onboarding_leads;
create trigger onboarding_leads_set_updated_at
before update on public.onboarding_leads
for each row execute function public.set_updated_at();

create or replace function public.create_user_notification(
  target_user_uuid uuid,
  project_uuid uuid,
  event_key text,
  title_text text,
  message_text text default null,
  link_text text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  project_name text := null;
  normalized_title text := coalesce(nullif(trim(title_text), ''), 'Portal Update');
begin
  if target_user_uuid is null then
    return;
  end if;

  if project_uuid is not null then
    select nullif(trim(p.name), '')
    into project_name
    from public.projects p
    where p.id = project_uuid;
  end if;

  insert into public.portal_notifications (
    user_id,
    project_id,
    event_type,
    title,
    message,
    link_path
  )
  values (
    target_user_uuid,
    project_uuid,
    coalesce(nullif(trim(event_key), ''), 'project_event'),
    case
      when project_name is null then normalized_title
      else project_name || ': ' || normalized_title
    end,
    nullif(trim(coalesce(message_text, '')), ''),
    nullif(trim(coalesce(link_text, '')), '')
  );
end;
$$;

create or replace function public.create_project_notification(
  project_uuid uuid,
  event_key text,
  title_text text,
  message_text text default null,
  link_text text default null,
  exclude_user_uuid uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  inserted_count integer := 0;
  project_name text := null;
  normalized_title text := coalesce(nullif(trim(title_text), ''), 'Portal Update');
begin
  if project_uuid is null then
    return 0;
  end if;

  select nullif(trim(p.name), '')
  into project_name
  from public.projects p
  where p.id = project_uuid;

  with recipient_users as (
    select pm.user_id as user_id
    from public.project_members pm
    where pm.project_id = project_uuid
    union
    select u.id as user_id
    from public.project_member_emails pme
    join auth.users u on lower(coalesce(u.email, '')) = lower(pme.email)
    where pme.project_id = project_uuid
    union
    select bm.id as user_id
    from (
      select u.id
      from auth.users u
      order by u.created_at asc
      limit 1
    ) bm
  )
  insert into public.portal_notifications (
    user_id,
    project_id,
    event_type,
    title,
    message,
    link_path
  )
  select
    ru.user_id,
    project_uuid,
    coalesce(nullif(trim(event_key), ''), 'project_event'),
    case
      when project_name is null then normalized_title
      else project_name || ': ' || normalized_title
    end,
    nullif(trim(coalesce(message_text, '')), ''),
    nullif(trim(coalesce(link_text, '')), '')
  from recipient_users ru
  where exclude_user_uuid is null or ru.user_id <> exclude_user_uuid;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

drop function if exists public.record_project_paypal_capture(uuid, text, text, numeric, text, jsonb, text);

create function public.record_project_paypal_capture(
  project_uuid uuid,
  provider_order text,
  provider_capture text,
  captured_amount numeric,
  currency text default 'USD',
  provider_payload_json jsonb default null,
  payer_email_text text default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  existing_status text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_project_member(project_uuid) then
    raise exception 'not_authorized';
  end if;

  if provider_order is null or trim(provider_order) = '' then
    raise exception 'invalid_order_id';
  end if;

  if provider_capture is null or trim(provider_capture) = '' then
    raise exception 'invalid_capture_id';
  end if;

  if captured_amount is null or captured_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  select pp.status
  into existing_status
  from public.project_payments pp
  where pp.project_id = project_uuid
    and pp.provider = 'paypal'
    and pp.provider_order_id = trim(provider_order)
  for update;

  if existing_status is null then
    raise exception 'payment_not_found';
  end if;

  if existing_status = 'captured' then
    return;
  end if;

  update public.project_payments
  set
    status = 'captured',
    provider_capture_id = trim(provider_capture),
    amount = captured_amount,
    currency_code = coalesce(nullif(trim(upper(currency)), ''), 'USD'),
    payer_user_id = coalesce(payer_user_id, auth.uid()),
    payer_email = coalesce(nullif(trim(coalesce(payer_email_text, '')), ''), payer_email),
    provider_payload = coalesce(provider_payload_json, provider_payload),
    updated_at = timezone('utc', now())
  where project_id = project_uuid
    and provider = 'paypal'
    and provider_order_id = trim(provider_order);

  update public.projects
  set amount_paid = coalesce(amount_paid, 0) + captured_amount
  where id = project_uuid;
end;
$$;

create or replace function public.get_payment_feature_flags()
returns table(
  manual_payments_enabled boolean,
  recurring_payments_enabled boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(
      (
        select pfs.manual_payments_enabled
        from public.payment_feature_settings pfs
        where pfs.id = true
        limit 1
      ),
      true
    ) as manual_payments_enabled,
    coalesce(
      (
        select pfs.recurring_payments_enabled
        from public.payment_feature_settings pfs
        where pfs.id = true
        limit 1
      ),
      true
    ) as recurring_payments_enabled;
$$;

create or replace function public.handle_project_activity_notifications()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor_id uuid := auth.uid();
  project_name text;
  link_to_project text;
  update_title text;
begin
  if tg_table_name = 'project_updates' and tg_op = 'INSERT' then
    perform public.create_project_notification(
      new.project_id,
      'project_update',
      'New Project Update',
      coalesce(new.title, 'A project update was posted.'),
      '/portal?project=' || new.project_id::text,
      new.created_by
    );
    return new;
  end if;

  if tg_table_name = 'project_questions' and tg_op = 'INSERT' then
    perform public.create_project_notification(
      new.project_id,
      'question_thread',
      'New Question Thread',
      'A new client/manager question was posted.',
      '/portal?project=' || new.project_id::text,
      new.author_id
    );
    return new;
  end if;

  if tg_table_name = 'project_question_messages' and tg_op = 'INSERT' then
    perform public.create_project_notification(
      new.project_id,
      'question_reply',
      'New Thread Reply',
      'A new reply was added to a question thread.',
      '/portal?project=' || new.project_id::text,
      new.author_id
    );
    return new;
  end if;

  if tg_table_name = 'project_files' and tg_op = 'INSERT' then
    perform public.create_project_notification(
      new.project_id,
      'file_uploaded',
      'New File Uploaded',
      coalesce(new.file_name, 'A file was uploaded.'),
      '/portal?project=' || new.project_id::text,
      new.uploaded_by
    );
    return new;
  end if;

  if tg_table_name = 'project_milestones' and tg_op = 'INSERT' then
    perform public.create_project_notification(
      new.project_id,
      'milestone_created',
      'New Milestone Added',
      coalesce(new.title, 'A milestone was added.'),
      '/portal?project=' || new.project_id::text,
      new.created_by
    );
    return new;
  end if;

  if tg_table_name = 'project_milestones' and tg_op = 'UPDATE' then
    if
      new.title is distinct from old.title
      or new.details is distinct from old.details
      or new.status is distinct from old.status
      or new.due_date is distinct from old.due_date
      or new.sort_order is distinct from old.sort_order
    then
      perform public.create_project_notification(
        new.project_id,
        'milestone_updated',
        'Milestone Updated',
        coalesce(new.title, 'A milestone was updated.'),
        '/portal?project=' || new.project_id::text,
        actor_id
      );
    end if;
    return new;
  end if;

  if tg_table_name = 'project_approval_tasks' and tg_op = 'INSERT' then
    perform public.create_project_notification(
      new.project_id,
      'approval_requested',
      'Approval Requested',
      coalesce(new.title, 'A new approval task needs review.'),
      '/portal?project=' || new.project_id::text,
      new.requested_by
    );
    return new;
  end if;

  if tg_table_name = 'project_approval_tasks' and tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      if new.status = 'approved' then
        update_title := 'Task Approved';
      elsif new.status = 'changes_requested' then
        update_title := 'Changes Requested';
      else
        update_title := 'Approval Task Updated';
      end if;

      perform public.create_project_notification(
        new.project_id,
        'approval_status',
        update_title,
        coalesce(new.title, 'An approval task status changed.'),
        '/portal?project=' || new.project_id::text,
        actor_id
      );
    end if;
    return new;
  end if;

  if tg_table_name = 'project_access_items' and tg_op = 'INSERT' then
    perform public.create_project_notification(
      new.project_id,
      'access_item_added',
      'Access Item Added',
      coalesce(new.title, 'A new access checklist item was added.'),
      '/portal?project=' || new.project_id::text,
      new.created_by
    );
    return new;
  end if;

  if tg_table_name = 'project_access_items' and tg_op = 'UPDATE' then
    if
      new.status is distinct from old.status
      or new.login_url is distinct from old.login_url
      or new.account_email is distinct from old.account_email
      or new.username is distinct from old.username
      or new.secret_value is distinct from old.secret_value
      or new.secure_link is distinct from old.secure_link
      or new.notes is distinct from old.notes
    then
      perform public.create_project_notification(
        new.project_id,
        'access_item_updated',
        'Access Checklist Updated',
        coalesce(new.title, 'An access checklist item was updated.'),
        '/portal?project=' || new.project_id::text,
        new.updated_by
      );
    end if;
    return new;
  end if;

  if tg_table_name = 'project_client_intake' and tg_op = 'INSERT' then
    perform public.create_project_notification(
      new.project_id,
      'intake_submitted',
      'Client Intake Submitted',
      'Project intake information was submitted.',
      '/portal?project=' || new.project_id::text,
      new.updated_by
    );
    return new;
  end if;

  if tg_table_name = 'project_client_intake' and tg_op = 'UPDATE' then
    perform public.create_project_notification(
      new.project_id,
      'intake_updated',
      'Client Intake Updated',
      'Project intake information was updated.',
      '/portal?project=' || new.project_id::text,
      new.updated_by
    );
    return new;
  end if;

  if tg_table_name = 'projects' and tg_op = 'UPDATE' then
    if
      new.status is distinct from old.status
      or new.progress is distinct from old.progress
      or new.summary is distinct from old.summary
      or new.start_date is distinct from old.start_date
      or new.due_date is distinct from old.due_date
    then
      project_name := coalesce(new.name, 'Project');
      link_to_project := '/portal?project=' || new.id::text;
      perform public.create_project_notification(
        new.id,
        'project_snapshot',
        'Project Snapshot Updated',
        project_name || ' has new project details.',
        link_to_project,
        actor_id
      );
    end if;
    return new;
  end if;

  if tg_table_name = 'project_members' and tg_op = 'INSERT' then
    select nullif(trim(p.name), '')
    into project_name
    from public.projects p
    where p.id = new.project_id;

    perform public.create_user_notification(
      new.user_id,
      new.project_id,
      'project_assignment',
      'Project Assigned',
      coalesce(project_name, 'Project') || ' was assigned to your portal account.',
      '/portal?project=' || new.project_id::text
    );
    return new;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists notify_project_updates on public.project_updates;
create trigger notify_project_updates
after insert on public.project_updates
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_questions on public.project_questions;
create trigger notify_project_questions
after insert on public.project_questions
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_question_messages on public.project_question_messages;
create trigger notify_project_question_messages
after insert on public.project_question_messages
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_files on public.project_files;
create trigger notify_project_files
after insert on public.project_files
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_milestones_insert on public.project_milestones;
create trigger notify_project_milestones_insert
after insert on public.project_milestones
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_milestones_update on public.project_milestones;
create trigger notify_project_milestones_update
after update on public.project_milestones
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_approval_tasks_insert on public.project_approval_tasks;
create trigger notify_project_approval_tasks_insert
after insert on public.project_approval_tasks
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_approval_tasks_update on public.project_approval_tasks;
create trigger notify_project_approval_tasks_update
after update on public.project_approval_tasks
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_access_items_insert on public.project_access_items;
create trigger notify_project_access_items_insert
after insert on public.project_access_items
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_access_items_update on public.project_access_items;
create trigger notify_project_access_items_update
after update on public.project_access_items
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_client_intake_insert on public.project_client_intake;
create trigger notify_project_client_intake_insert
after insert on public.project_client_intake
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_client_intake_update on public.project_client_intake;
create trigger notify_project_client_intake_update
after update on public.project_client_intake
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_projects_update on public.projects;
create trigger notify_projects_update
after update on public.projects
for each row execute function public.handle_project_activity_notifications();

drop trigger if exists notify_project_members_insert on public.project_members;
create trigger notify_project_members_insert
after insert on public.project_members
for each row execute function public.handle_project_activity_notifications();

create or replace function public.is_project_member(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_bootstrap_manager() or exists (
    select 1
    from public.project_members pm
    where pm.project_id = project_uuid
      and pm.user_id = auth.uid()
  ) or exists (
    select 1
    from public.project_member_emails pme
    join auth.users u on u.id = auth.uid()
    where pme.project_id = project_uuid
      and lower(pme.email) = lower(coalesce(u.email, ''))
  );
$$;

create or replace function public.is_project_admin(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_bootstrap_manager() or exists (
    select 1
    from public.project_members pm
    where pm.project_id = project_uuid
      and pm.user_id = auth.uid()
      and pm.role in ('manager', 'owner')
  ) or exists (
    select 1
    from public.project_member_emails pme
    join auth.users u on u.id = auth.uid()
    where pme.project_id = project_uuid
      and lower(pme.email) = lower(coalesce(u.email, ''))
      and pme.role in ('manager', 'owner')
  );
$$;

create or replace function public.is_portal_manager()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_bootstrap_manager() or exists (
    select 1
    from public.project_members pm
    where pm.user_id = auth.uid()
      and pm.role in ('manager', 'owner')
  ) or exists (
    select 1
    from public.project_member_emails pme
    join auth.users u on u.id = auth.uid()
    where lower(pme.email) = lower(coalesce(u.email, ''))
      and pme.role in ('manager', 'owner')
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
  normalized_email text := lower(trim(client_email));
begin
  if not public.is_project_admin(project_uuid) then
    raise exception 'not_authorized';
  end if;

  if client_role not in ('client', 'manager', 'owner') then
    raise exception 'invalid_role';
  end if;

  if normalized_email is null or normalized_email = '' then
    raise exception 'invalid_email';
  end if;

  insert into public.project_member_emails (project_id, email, role)
  values (project_uuid, normalized_email, client_role)
  on conflict (project_id, email) do update
  set role = excluded.role;

  select u.id
  into target_user_id
  from auth.users u
  where lower(u.email) = normalized_email
  order by u.created_at asc
  limit 1;

  if target_user_id is not null then
    insert into public.project_members (project_id, user_id, role)
    values (project_uuid, target_user_id, client_role)
    on conflict (project_id, user_id) do update
    set role = excluded.role;
  end if;

  return target_user_id;
end;
$$;

drop function if exists public.submit_client_project(text, text, date, date);

create function public.submit_client_project(
  project_name text,
  summary_text text default null,
  requested_start_date date default null,
  requested_due_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_project_name text := nullif(trim(project_name), '');
  normalized_summary text := nullif(trim(coalesce(summary_text, '')), '');
  submitter_email text;
  submitter_full_name text;
  timeline_text text := null;
  manager_user_id uuid;
  new_lead_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if normalized_project_name is null then
    raise exception 'project_name_required';
  end if;

  if
    requested_start_date is not null
    and requested_due_date is not null
    and requested_due_date < requested_start_date
  then
    raise exception 'invalid_date_range';
  end if;

  select lower(trim(u.email))
  into submitter_email
  from auth.users u
  where u.id = auth.uid();

  if submitter_email is null or submitter_email = '' then
    raise exception 'email_required';
  end if;

  if exists (
    select 1
    from public.projects p
    where p.status not in ('completed', 'archived')
      and (
        exists (
          select 1
          from public.project_members pm
          where pm.project_id = p.id
            and pm.user_id = auth.uid()
        )
        or exists (
          select 1
          from public.project_member_emails pme
          where pme.project_id = p.id
            and lower(pme.email) = submitter_email
        )
      )
  ) then
    raise exception 'active_project_exists';
  end if;

  select
    nullif(
      trim(
        coalesce(
          u.raw_user_meta_data ->> 'registered_full_name',
          u.raw_user_meta_data ->> 'full_name',
          u.raw_user_meta_data ->> 'name',
          u.raw_user_meta_data ->> 'fullName',
          ''
        )
      ),
      ''
    )
  into submitter_full_name
  from auth.users u
  where u.id = auth.uid();

  if submitter_full_name is null then
    submitter_full_name := nullif(
      trim(initcap(replace(replace(split_part(submitter_email, '@', 1), '.', ' '), '_', ' '))),
      ''
    );
  end if;

  if submitter_full_name is null then
    submitter_full_name := 'Client';
  end if;

  timeline_text := case
    when requested_start_date is not null and requested_due_date is not null then
      'Requested start ' || requested_start_date::text || ', due ' || requested_due_date::text
    when requested_start_date is not null then
      'Requested start ' || requested_start_date::text
    when requested_due_date is not null then
      'Requested due ' || requested_due_date::text
    else null
  end;

  insert into public.onboarding_leads (
    full_name,
    email,
    status,
    proposed_project_name,
    goals,
    timeline_goal,
    notes,
    created_by
  )
  values (
    submitter_full_name,
    submitter_email,
    'call_scheduled',
    normalized_project_name,
    normalized_summary,
    timeline_text,
    'Submitted from client portal project request.',
    auth.uid()
  )
  returning id into new_lead_id;

  select u.id
  into manager_user_id
  from auth.users u
  order by u.created_at asc
  limit 1;

  perform public.create_user_notification(
    manager_user_id,
    null,
    'client_project_submission',
    'Client Project Submitted',
    submitter_email || ' submitted "' || normalized_project_name || '" to onboarding.',
    '/portal/onboarding'
  );

  return new_lead_id;
end;
$$;

drop function if exists public.claim_pending_project_memberships();

create function public.claim_pending_project_memberships()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_email text;
  changed_count integer := 0;
begin
  if auth.uid() is null then
    return 0;
  end if;

  select lower(trim(u.email))
  into current_email
  from auth.users u
  where u.id = auth.uid();

  if current_email is null or current_email = '' then
    return 0;
  end if;

  insert into public.project_members (project_id, user_id, role)
  select
    pme.project_id,
    auth.uid(),
    pme.role
  from public.project_member_emails pme
  where lower(pme.email) = current_email
  on conflict (project_id, user_id) do update
  set role = excluded.role;

  get diagnostics changed_count = row_count;
  return changed_count;
end;
$$;

drop function if exists public.update_project_summary(uuid, text);

create function public.update_project_summary(
  project_uuid uuid,
  summary_text text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_project_member(project_uuid) then
    raise exception 'not_authorized';
  end if;

  update public.projects
  set summary = nullif(trim(summary_text), '')
  where id = project_uuid;
end;
$$;

drop function if exists public.delete_project_permanently(uuid);

create function public.delete_project_permanently(project_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if project_uuid is null then
    raise exception 'project_required';
  end if;

  if not public.is_project_admin(project_uuid) then
    raise exception 'not_authorized';
  end if;

  delete from public.projects
  where id = project_uuid;

  if not found then
    raise exception 'project_not_found';
  end if;
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

drop function if exists public.get_project_contacts(uuid);

create function public.get_project_contacts(project_uuid uuid)
returns table(email text, full_name text, role text)
language sql
security definer
set search_path = public, auth
as $$
  with requester as (
    select public.is_project_admin(project_uuid) as allowed
  ),
  raw_contacts as (
    select
      lower(trim(u.email)) as email,
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
      ) as full_name,
      pm.role
    from public.project_members pm
    join auth.users u on u.id = pm.user_id
    left join lateral (
      select i.identity_data
      from auth.identities i
      where i.user_id = u.id
      limit 1
    ) ident on true
    where pm.project_id = project_uuid
      and u.email is not null
      and trim(u.email) <> ''

    union all

    select
      lower(trim(pme.email)) as email,
      null::text as full_name,
      pme.role
    from public.project_member_emails pme
    where pme.project_id = project_uuid
      and pme.email is not null
      and trim(pme.email) <> ''
  ),
  ranked_contacts as (
    select
      rc.email,
      rc.full_name,
      rc.role,
      row_number() over (
        partition by rc.email
        order by
          case rc.role
            when 'owner' then 0
            when 'manager' then 1
            else 2
          end,
          case when rc.full_name is null then 1 else 0 end
      ) as rank_order
    from raw_contacts rc
  )
  select
    c.email::text,
    c.full_name::text,
    c.role::text
  from ranked_contacts c
  cross join requester r
  where r.allowed
    and c.rank_order = 1
  order by
    case c.role
      when 'owner' then 0
      when 'manager' then 1
      else 2
    end,
    c.email;
$$;

revoke all on function public.is_project_member(uuid) from public;
grant execute on function public.is_project_member(uuid) to authenticated;

revoke all on function public.is_project_admin(uuid) from public;
grant execute on function public.is_project_admin(uuid) to authenticated;

revoke all on function public.is_bootstrap_manager() from public;
grant execute on function public.is_bootstrap_manager() to authenticated;

revoke all on function public.is_portal_manager() from public;
grant execute on function public.is_portal_manager() to authenticated;

revoke all on function public.assign_client_to_project(uuid, text, text) from public;
grant execute on function public.assign_client_to_project(uuid, text, text) to authenticated;

revoke all on function public.submit_client_project(text, text, date, date) from public;
grant execute on function public.submit_client_project(text, text, date, date) to authenticated;

revoke all on function public.claim_pending_project_memberships() from public;
grant execute on function public.claim_pending_project_memberships() to authenticated;

revoke all on function public.create_project_notification(uuid, text, text, text, text, uuid) from public;
grant execute on function public.create_project_notification(uuid, text, text, text, text, uuid) to authenticated;

revoke all on function public.create_user_notification(uuid, uuid, text, text, text, text) from public;
grant execute on function public.create_user_notification(uuid, uuid, text, text, text, text) to authenticated;

revoke all on function public.record_project_paypal_capture(uuid, text, text, numeric, text, jsonb, text) from public;
grant execute on function public.record_project_paypal_capture(uuid, text, text, numeric, text, jsonb, text) to authenticated;

revoke all on function public.get_payment_feature_flags() from public;
grant execute on function public.get_payment_feature_flags() to authenticated;

revoke all on function public.update_project_summary(uuid, text) from public;
grant execute on function public.update_project_summary(uuid, text) to authenticated;

revoke all on function public.delete_project_permanently(uuid) from public;
grant execute on function public.delete_project_permanently(uuid) to authenticated;

revoke all on function public.search_project_user_emails(uuid, text, integer) from public;
grant execute on function public.search_project_user_emails(uuid, text, integer) to authenticated;

revoke all on function public.get_project_contacts(uuid) from public;
grant execute on function public.get_project_contacts(uuid) to authenticated;

grant insert on table public.onboarding_leads to anon, authenticated;
grant select, update, delete on table public.onboarding_leads to authenticated;
grant select, insert on table public.project_payments to authenticated;
grant select, insert, update on table public.project_billing_profiles to authenticated;
grant select, insert, update on table public.payment_feature_settings to authenticated;
grant insert on table public.lead_magnet_submissions to anon, authenticated;
grant select, delete on table public.lead_magnet_submissions to authenticated;
grant select, update on table public.portal_notifications to authenticated;

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_questions enable row level security;
alter table public.project_question_messages enable row level security;
alter table public.project_files enable row level security;
alter table public.project_payments enable row level security;
alter table public.project_billing_profiles enable row level security;
alter table public.payment_feature_settings enable row level security;
alter table public.project_client_intake enable row level security;
alter table public.project_access_items enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_approval_tasks enable row level security;
alter table public.onboarding_leads enable row level security;
alter table public.lead_magnet_submissions enable row level security;
alter table public.portal_notifications enable row level security;

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

drop policy if exists "Members can view project payments" on public.project_payments;
create policy "Members can view project payments"
on public.project_payments
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Members can create project payments" on public.project_payments;
create policy "Members can create project payments"
on public.project_payments
for insert
to authenticated
with check (
  public.is_project_member(project_id)
  and provider = 'paypal'
  and (payer_user_id is null or payer_user_id = auth.uid())
);

drop policy if exists "Members can view project billing profiles" on public.project_billing_profiles;
create policy "Members can view project billing profiles"
on public.project_billing_profiles
for select
to authenticated
using (public.is_project_member(project_id));

drop policy if exists "Managers can manage project billing profiles" on public.project_billing_profiles;
create policy "Managers can manage project billing profiles"
on public.project_billing_profiles
for all
to authenticated
using (public.is_project_admin(project_id))
with check (public.is_project_admin(project_id));

drop policy if exists "Managers can view payment feature settings" on public.payment_feature_settings;
create policy "Managers can view payment feature settings"
on public.payment_feature_settings
for select
to authenticated
using (public.is_portal_manager());

drop policy if exists "Managers can insert payment feature settings" on public.payment_feature_settings;
create policy "Managers can insert payment feature settings"
on public.payment_feature_settings
for insert
to authenticated
with check (public.is_portal_manager());

drop policy if exists "Managers can update payment feature settings" on public.payment_feature_settings;
create policy "Managers can update payment feature settings"
on public.payment_feature_settings
for update
to authenticated
using (public.is_portal_manager())
with check (public.is_portal_manager());

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

drop policy if exists "Anyone can submit onboarding leads" on public.onboarding_leads;
create policy "Anyone can submit onboarding leads"
on public.onboarding_leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Managers can view onboarding leads" on public.onboarding_leads;
create policy "Managers can view onboarding leads"
on public.onboarding_leads
for select
to authenticated
using (public.is_bootstrap_manager());

drop policy if exists "Managers can update onboarding leads" on public.onboarding_leads;
create policy "Managers can update onboarding leads"
on public.onboarding_leads
for update
to authenticated
using (public.is_bootstrap_manager())
with check (public.is_bootstrap_manager());

drop policy if exists "Managers can delete onboarding leads" on public.onboarding_leads;
create policy "Managers can delete onboarding leads"
on public.onboarding_leads
for delete
to authenticated
using (public.is_bootstrap_manager());

drop policy if exists "Anyone can submit lead magnet captures" on public.lead_magnet_submissions;
create policy "Anyone can submit lead magnet captures"
on public.lead_magnet_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Managers can view lead magnet captures" on public.lead_magnet_submissions;
create policy "Managers can view lead magnet captures"
on public.lead_magnet_submissions
for select
to authenticated
using (public.is_bootstrap_manager());

drop policy if exists "Managers can delete lead magnet captures" on public.lead_magnet_submissions;
create policy "Managers can delete lead magnet captures"
on public.lead_magnet_submissions
for delete
to authenticated
using (public.is_bootstrap_manager());

drop policy if exists "Users can view own notifications" on public.portal_notifications;
create policy "Users can view own notifications"
on public.portal_notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can update own notifications" on public.portal_notifications;
create policy "Users can update own notifications"
on public.portal_notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

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

drop policy if exists "Managers can delete storage files" on storage.objects;
create policy "Managers can delete storage files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-files'
  and public.storage_project_id(name) is not null
  and public.is_project_admin(public.storage_project_id(name))
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  published_at date not null default current_date,
  author text not null,
  category text not null,
  tags text[] not null default '{}'::text[],
  primary_keyword text not null,
  feature_image text not null,
  content_markdown text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc);
create index if not exists blog_posts_is_published_idx on public.blog_posts(is_published);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
on public.blog_posts
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Managers can read all blog posts" on public.blog_posts;
create policy "Managers can read all blog posts"
on public.blog_posts
for select
to authenticated
using (public.is_bootstrap_manager());

drop policy if exists "Managers can insert blog posts" on public.blog_posts;
create policy "Managers can insert blog posts"
on public.blog_posts
for insert
to authenticated
with check (public.is_bootstrap_manager());

drop policy if exists "Managers can update blog posts" on public.blog_posts;
create policy "Managers can update blog posts"
on public.blog_posts
for update
to authenticated
using (public.is_bootstrap_manager())
with check (public.is_bootstrap_manager());

drop policy if exists "Managers can delete blog posts" on public.blog_posts;
create policy "Managers can delete blog posts"
on public.blog_posts
for delete
to authenticated
using (public.is_bootstrap_manager());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  8388608,
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read blog images" on storage.objects;
create policy "Public can read blog images"
on storage.objects
for select
to public
using (bucket_id = 'blog-images');

drop policy if exists "Managers can upload blog images" on storage.objects;
create policy "Managers can upload blog images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and public.is_bootstrap_manager()
);

drop policy if exists "Managers can update blog images" on storage.objects;
create policy "Managers can update blog images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-images'
  and public.is_bootstrap_manager()
)
with check (
  bucket_id = 'blog-images'
  and public.is_bootstrap_manager()
);

drop policy if exists "Managers can delete blog images" on storage.objects;
create policy "Managers can delete blog images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and public.is_bootstrap_manager()
);
