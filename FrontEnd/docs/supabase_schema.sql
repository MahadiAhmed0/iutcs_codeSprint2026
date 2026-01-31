-- ============================================
-- IUTCS Code Sprint 2026 - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing tables (this will also drop policies)
-- ============================================
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Create Tables
-- ============================================

-- Profiles table (linked to Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'participant' CHECK (role IN ('admin', 'participant')),
  is_registered BOOLEAN DEFAULT false,
  team_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  leader_name TEXT NOT NULL,
  leader_email TEXT NOT NULL,
  leader_phone TEXT NOT NULL,
  department TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  payment_verified BOOLEAN DEFAULT false,
  members JSONB DEFAULT '[]',
  submission_status TEXT DEFAULT 'pending' CHECK (submission_status IN ('pending', 'submitted', 'approved', 'rejected')),
  submission_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  github_link TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES auth.users(id)
);

-- Add foreign key for team_id in profiles
ALTER TABLE public.profiles
ADD CONSTRAINT fk_team
FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- Step 3: Create Indexes
-- ============================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_team_id ON public.profiles(team_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_teams_leader_id ON public.teams(leader_id);
CREATE INDEX idx_submissions_team_id ON public.submissions(team_id);

-- Step 4: Enable RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
-- ============================================

-- PROFILES POLICIES
-- Allow users to read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- TEAMS POLICIES
-- Allow users to view their own team
CREATE POLICY "teams_select_own"
  ON public.teams FOR SELECT
  TO authenticated
  USING (leader_id = auth.uid());

-- Allow users to insert their own team
CREATE POLICY "teams_insert_own"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (leader_id = auth.uid());

-- Allow users to update their own team
CREATE POLICY "teams_update_own"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (leader_id = auth.uid())
  WITH CHECK (leader_id = auth.uid());

-- Allow admins to view all teams
CREATE POLICY "teams_select_admin"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to update all teams
CREATE POLICY "teams_update_admin"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- SUBMISSIONS POLICIES
-- Allow team leaders to manage their submissions
CREATE POLICY "submissions_all_leader"
  ON public.submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = submissions.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Allow admins to manage all submissions
CREATE POLICY "submissions_all_admin"
  ON public.submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Step 6: Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.submissions TO authenticated;

-- ============================================
-- DONE! Your database is ready.
-- ============================================

-- To make a user an admin, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
