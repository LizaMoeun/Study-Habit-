-- StudyHabit Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations table
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  organization_name text not null,
  organization_type text not null,
  expected_students text not null,
  subscription_plan text check (subscription_plan in ('monthly', 'yearly')) default 'monthly',
  subscription_status text check (subscription_status in ('active', 'inactive', 'trial', 'cancelled')) default 'trial',
  trial_ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('admin', 'student')) not null,
  organization_id uuid references public.organizations on delete set null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invitations table
create table public.invitations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  invitation_code text unique not null,
  student_name text not null,
  student_email text not null,
  status text check (status in ('pending', 'accepted', 'expired')) default 'pending',
  created_by uuid references public.profiles on delete cascade not null,
  expires_at timestamp with time zone not null,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Study sessions table
create table public.study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  subject text not null,
  duration_hours numeric(5,2) not null check (duration_hours > 0),
  notes text,
  session_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Achievements/Badges table
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  badge_type text not null,
  badge_name text not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index profiles_organization_id_idx on public.profiles(organization_id);
create index profiles_role_idx on public.profiles(role);
create index invitations_organization_id_idx on public.invitations(organization_id);
create index invitations_code_idx on public.invitations(invitation_code);
create index invitations_status_idx on public.invitations(status);
create index study_sessions_user_id_idx on public.study_sessions(user_id);
create index study_sessions_session_date_idx on public.study_sessions(session_date);
create index achievements_user_id_idx on public.achievements(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.study_sessions enable row level security;
alter table public.achievements enable row level security;

-- Organizations policies
create policy "Admins can view their own organization"
  on public.organizations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = organizations.id
      and profiles.role = 'admin'
    )
  );

create policy "Admins can update their own organization"
  on public.organizations for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = organizations.id
      and profiles.role = 'admin'
    )
  );

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles in their organization"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.organization_id = profiles.organization_id
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Invitations policies
create policy "Admins can view invitations for their organization"
  on public.invitations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = invitations.organization_id
      and profiles.role = 'admin'
    )
  );

create policy "Admins can create invitations for their organization"
  on public.invitations for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = invitations.organization_id
      and profiles.role = 'admin'
    )
  );

create policy "Admins can update invitations for their organization"
  on public.invitations for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = invitations.organization_id
      and profiles.role = 'admin'
    )
  );

create policy "Anyone can view invitation by code (for signup)"
  on public.invitations for select
  using (true);

-- Study sessions policies
create policy "Users can view their own study sessions"
  on public.study_sessions for select
  using (auth.uid() = user_id);

create policy "Admins can view all study sessions in their organization"
  on public.study_sessions for select
  using (
    exists (
      select 1 from public.profiles as admin_profile
      join public.profiles as student_profile on student_profile.id = study_sessions.user_id
      where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.organization_id = student_profile.organization_id
    )
  );

create policy "Users can create their own study sessions"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own study sessions"
  on public.study_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own study sessions"
  on public.study_sessions for delete
  using (auth.uid() = user_id);

-- Achievements policies
create policy "Users can view their own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Admins can view all achievements in their organization"
  on public.achievements for select
  using (
    exists (
      select 1 from public.profiles as admin_profile
      join public.profiles as student_profile on student_profile.id = achievements.user_id
      where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.organization_id = student_profile.organization_id
    )
  );

create policy "System can create achievements"
  on public.achievements for insert
  with check (true);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_organizations_updated_at before update on public.organizations
  for each row execute procedure public.handle_updated_at();

create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_invitations_updated_at before update on public.invitations
  for each row execute procedure public.handle_updated_at();

create trigger handle_study_sessions_updated_at before update on public.study_sessions
  for each row execute procedure public.handle_updated_at();
