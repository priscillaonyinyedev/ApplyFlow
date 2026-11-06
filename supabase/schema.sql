-- Apply this once in the Supabase SQL editor. Auth owns passwords; this schema
-- stores each user's profile and job-search records behind row-level security.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  current_role text not null default '',
  location text not null default '',
  linkedin_url text not null default '',
  portfolio_url text not null default '',
  bio text not null default '',
  resume_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, email, current_role, location, linkedin_url, portfolio_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'current_role', ''),
    coalesce(new.raw_user_meta_data->>'location', ''),
    coalesce(new.raw_user_meta_data->>'linkedin_url', ''),
    coalesce(new.raw_user_meta_data->>'portfolio_url', '')
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute procedure public.create_profile_for_auth_user();

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  title text not null,
  location text not null default '',
  salary text not null default '',
  status text not null default 'Applied' check (status in ('Applied','Under Review','Interview','Offer','Rejected')),
  applied_at date not null default current_date,
  employment_type text not null default 'Full-time',
  description text not null default '',
  company_color text not null default '#725cff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  title text not null,
  location text not null default '',
  salary text not null default '',
  description text not null default '',
  url text not null default '',
  company_color text not null default '#725cff',
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  title text not null,
  interview_date date not null,
  interview_time time not null,
  stage text not null default 'Recruiter screen',
  company_color text not null default '#725cff',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.interviews enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.applications, public.saved_jobs, public.interviews to authenticated;

drop policy if exists "Users manage their own profile" on public.profiles;
drop policy if exists "Users manage their own applications" on public.applications;
drop policy if exists "Users manage their own saved jobs" on public.saved_jobs;
drop policy if exists "Users manage their own interviews" on public.interviews;
create policy "Users manage their own profile" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Users manage their own applications" on public.applications for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage their own saved jobs" on public.saved_jobs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage their own interviews" on public.interviews for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists applications_user_date_idx on public.applications(user_id, applied_at desc);
create index if not exists saved_jobs_user_created_idx on public.saved_jobs(user_id, created_at desc);
create index if not exists interviews_user_date_idx on public.interviews(user_id, interview_date, interview_time);
