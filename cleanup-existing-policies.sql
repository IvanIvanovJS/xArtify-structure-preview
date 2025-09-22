-- Cleanup existing RLS policies before applying new ones
-- Run this ONLY if you have conflicting policies that need to be removed

-- WARNING: This will remove existing policies. Only run if you have conflicts.
-- The main auth-duplicate-fix.sql script now preserves existing User table policies.

-- Drop existing policies on User table (ONLY if you have conflicts)
-- DROP POLICY IF EXISTS "Users can view own data" ON "User";
-- DROP POLICY IF EXISTS "Users can update own data" ON "User";
-- DROP POLICY IF EXISTS "Users can insert own data" ON "User";
-- DROP POLICY IF EXISTS "Users can delete own data" ON "User";
-- DROP POLICY IF EXISTS "Admins can view all users" ON "User";
-- DROP POLICY IF EXISTS "Admins can update all users" ON "User";
-- DROP POLICY IF EXISTS "Admins can insert all users" ON "User";
-- DROP POLICY IF EXISTS "Admins can delete all users" ON "User";

-- Drop existing policies on Account table
DROP POLICY IF EXISTS "Users can view own accounts" ON "Account";
DROP POLICY IF EXISTS "Users can update own accounts" ON "Account";
DROP POLICY IF EXISTS "Users can insert own accounts" ON "Account";
DROP POLICY IF EXISTS "Users can delete own accounts" ON "Account";
DROP POLICY IF EXISTS "Admins can view all accounts" ON "Account";
DROP POLICY IF EXISTS "Admins can update all accounts" ON "Account";
DROP POLICY IF EXISTS "Admins can insert all accounts" ON "Account";
DROP POLICY IF EXISTS "Admins can delete all accounts" ON "Account";

-- Drop existing policies on Session table
DROP POLICY IF EXISTS "Users can view own sessions" ON "Session";
DROP POLICY IF EXISTS "Users can update own sessions" ON "Session";
DROP POLICY IF EXISTS "Users can insert own sessions" ON "Session";
DROP POLICY IF EXISTS "Users can delete own sessions" ON "Session";
DROP POLICY IF EXISTS "Admins can view all sessions" ON "Session";
DROP POLICY IF EXISTS "Admins can update all sessions" ON "Session";
DROP POLICY IF EXISTS "Admins can insert all sessions" ON "Session";
DROP POLICY IF EXISTS "Admins can delete all sessions" ON "Session";

-- Disable RLS temporarily (optional - only if you want to start fresh)
-- ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;

-- Note: After running this cleanup, run the auth-duplicate-fix.sql script
-- to apply the new, properly configured RLS policies
