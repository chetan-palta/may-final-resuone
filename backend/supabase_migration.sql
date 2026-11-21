-- ==============================================================================
-- ResuOne Supabase PostgreSQL Database Initialization & Migration Script
-- ==============================================================================
-- Instructions for Supabase:
-- 1. Log in to your Supabase project dashboard (https://supabase.com/dashboard).
-- 2. Select your project and navigate to "SQL Editor" in the left sidebar.
-- 3. Click "+ New query", paste this entire script, and click "Run" (or Ctrl+Enter).
-- 4. Verify that tables 'users' and 'resumes' appear under Table Editor.
-- ==============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    google_id TEXT UNIQUE,
    avatar TEXT,
    password_hash TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Untitled Resume',
    data JSONB DEFAULT '{}'::jsonb,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_last_updated ON public.resumes(last_updated DESC);

-- 4. Enable Row Level Security (RLS) - Optional / Recommended for Supabase
-- Since ResuOne backend connects directly with postgres credentials via the 'pg' library,
-- backend queries bypass RLS. If you enable RLS, grant access to service_role/postgres:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Allow postgres/service_role full access:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow service_role full access users'
    ) THEN
        CREATE POLICY "Allow service_role full access users" ON public.users FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Allow service_role full access resumes'
    ) THEN
        CREATE POLICY "Allow service_role full access resumes" ON public.resumes FOR ALL USING (true);
    END IF;
END $$;

-- 5. Seed Demo Admin Account
-- Email: admin@resuone.com | Password: Demo@123 (bcrypt hash)
INSERT INTO public.users (email, name, password_hash, is_admin)
VALUES (
    'admin@resuone.com',
    'ResuOne Admin',
    '$2b$10$w09ZqWk0R5bZ0yv5T3M2sO0e7U2yGvM1wFmYyV6K7cQ2jF.4LzD5i',
    TRUE
)
ON CONFLICT (email) DO UPDATE
SET is_admin = TRUE,
    name = EXCLUDED.name;

-- Verification query
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'resumes');
