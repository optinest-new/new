# Client Portal Setup

1. In Supabase Auth settings, enable Email provider with:
   - email/password login enabled
   - user signups enabled
   - email confirmations disabled
   - redirect URL includes `/portal` for password recovery emails
2. Run `/Users/jeff/Desktop/dev/jeffgab/supabase/client-portal.sql` in the SQL Editor.
3. Add values to `/Users/jeff/Desktop/dev/jeffgab/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Register/login the manager account first (this becomes the bootstrap manager).
5. Have clients register accounts at `/portal`.
6. Use portal Manager Controls to assign client emails to projects.

## Bootstrap manager

- The first authenticated Supabase user (earliest `auth.users.created_at`) is treated as the global manager.
- That user can create projects and assign clients by email from the portal admin workspace.
- If a client email is not found during assignment, have that client sign in to `/portal` once first.

## Admin usage

- Sign in with a `manager` or `owner` project membership.
- Open a project, then use **Admin Workspace** to:
  - update project status/progress/summary
  - publish timeline updates
  - reply inside client question threads

## Useful seed examples

```sql
-- Example: create a project
insert into public.projects (name, status, progress, summary, start_date, due_date)
values (
  'Northline Dental SEO Retainer',
  'in_progress',
  42,
  'Technical SEO, local content updates, and conversion page refreshes.',
  '2026-02-01',
  '2026-04-30'
)
returning id;

-- Example: assign a client user to the project
insert into public.project_members (project_id, user_id, role)
values ('<project_uuid>', '<auth_user_uuid>', 'client');

-- Example: publish an update as manager/owner account
insert into public.project_updates (project_id, title, body, progress, created_by)
values (
  '<project_uuid>',
  'Sitemap and crawl cleanup completed',
  'Resolved duplicate indexable URLs and re-submitted sitemap to Search Console.',
  50,
  '<manager_auth_user_uuid>'
);
```
