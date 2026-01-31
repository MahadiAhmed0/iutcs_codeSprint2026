# Authentication Setup Guide

This document provides a comprehensive guide for setting up Supabase authentication with Google OAuth for the IUTCS Code Sprint 2026 application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Google OAuth Configuration](#google-oauth-configuration)
4. [Database Schema Setup](#database-schema-setup)
5. [Environment Variables](#environment-variables)
6. [Role-Based Access Control](#role-based-access-control)
7. [Authentication Flow](#authentication-flow)
8. [Setting Up Admin Users](#setting-up-admin-users)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable Google OAuth in Supabase (Authentication → Providers → Google)
3. Run the SQL schema from `supabase_schema.sql` in SQL Editor
4. Copy `.env.local.example` to `.env.local` and add your Supabase keys
5. Run `npm run dev` and test login

---

## Supabase Project Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - **Name**: `iutcs-codesprint-2026`
   - **Database Password**: Create a strong password
   - **Region**: Choose the nearest region
5. Click "Create new project"

### Step 2: Get API Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

---

## Google OAuth Configuration

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**

### Step 2: Configure OAuth Consent Screen

1. Click "Configure Consent Screen"
2. Select **External** user type
3. Fill in required fields:
   - App name: `IUTCS Code Sprint 2026`
   - User support email: Your email
   - Developer contact email: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### Step 3: Create OAuth Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Select **Web application**
3. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-production-domain.com` (production)
4. Add authorized redirect URIs:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Replace `YOUR_PROJECT_REF` with your Supabase project reference
5. Save and copy the **Client ID** and **Client Secret**

### Step 4: Configure Google Provider in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and enable it
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Save changes

---

## Database Schema Setup

### Option 1: Run the SQL File (Recommended)

Open the file `supabase_schema.sql` in this project and copy its entire contents into **Supabase Dashboard → SQL Editor → New Query**, then click "Run".

### Option 2: Manual Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
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

-- Create teams table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  leader_name TEXT NOT NULL,
  leader_email TEXT NOT NULL,
  leader_phone TEXT NOT NULL,
  department TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  members JSONB DEFAULT '[]',
  submission_status TEXT DEFAULT 'pending',
  submission_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create basic policies (see supabase_schema.sql for complete policies)
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "teams_select_own" ON public.teams FOR SELECT TO authenticated USING (leader_id = auth.uid());
CREATE POLICY "teams_insert_own" ON public.teams FOR INSERT TO authenticated WITH CHECK (leader_id = auth.uid());
CREATE POLICY "teams_update_own" ON public.teams FOR UPDATE TO authenticated USING (leader_id = auth.uid());
```

---

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Getting Your Keys

1. **Project URL**: Supabase Dashboard → Settings → API → Project URL
2. **Anon Key**: Supabase Dashboard → Settings → API → Project API keys → anon public

---

## Role-Based Access Control

### Route Protection

The middleware handles route protection:

| Route | Access |
|-------|--------|
| `/` | Public |
| `/login` | Public (redirects if logged in) |
| `/team-registration` | Participants only (not registered) |
| `/team-dashboard` | Participants only (registered) |
| `/submission` | Participants only (registered) |
| `/admin` | Admins only |

---

## Authentication Flow

```
User visits /login
       ↓
Clicks "Continue with Google"
       ↓
Redirected to Google OAuth
       ↓
User grants permission
       ↓
Redirected to /auth/callback
       ↓
Callback creates profile (if new user)
       ↓
Redirect based on role/registration:
  ├── Admin? → /admin
  ├── Registered? → /team-dashboard
  └── New user? → /team-registration
```

---

## Setting Up Admin Users

Admins must be set **manually** in Supabase. Run this SQL after the user has logged in at least once:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

---

## Troubleshooting

### Issue: Stuck on loading / Profile not found

**Cause**: RLS policies blocking queries or profile wasn't created

**Solution**:
1. Check if tables exist in Supabase Table Editor
2. Run the `supabase_schema.sql` file to reset everything
3. Log out and log in again to create a fresh profile

### Issue: "auth_callback_error" on login

**Cause**: OAuth callback URL mismatch

**Solution**:
- Check Google Cloud Console redirect URIs
- Ensure the callback URL matches: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### Issue: "Permission denied" or query hangs

**Cause**: RLS policies are too restrictive

**Solution**: Temporarily disable RLS to test:
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
```

Then re-enable after fixing policies:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
```

### Debug: Check your data

```sql
-- See all profiles
SELECT * FROM public.profiles;

-- See all teams
SELECT * FROM public.teams;

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## File Structure

```
├── app/
│   ├── auth/callback/route.ts    # OAuth callback handler
│   ├── login/page.tsx            # Login page
│   ├── team-registration/page.tsx
│   ├── team-dashboard/page.tsx
│   └── admin/page.tsx
├── contexts/
│   └── auth-context.tsx          # Auth provider
├── lib/supabase/
│   ├── client.ts                 # Browser client
│   ├── server.ts                 # Server client
│   └── middleware.ts             # Session management
├── middleware.ts                 # Route protection
├── supabase_schema.sql           # Database schema (RUN THIS!)
├── .env.local.example            # Environment template
└── AUTHENTICATION_README.md      # This file
```

---

*Last updated: February 2026*
