-- Check existing RLS policies before applying new ones
-- Run this first to see what policies already exist

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('User', 'Account', 'Session')
ORDER BY tablename;

-- Check existing policies on User table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'User'
ORDER BY policyname;

-- Check existing policies on Account table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'Account'
ORDER BY policyname;

-- Check existing policies on Session table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'Session'
ORDER BY policyname;

-- Check for duplicate users (if any exist)
SELECT 
    u.email,
    COUNT(*) as user_count,
    STRING_AGG(u.id, ', ') as user_ids,
    STRING_AGG(COALESCE(a.provider, 'credentials'), ', ') as providers
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
WHERE u.email IS NOT NULL
GROUP BY u.email
HAVING COUNT(*) > 1
ORDER BY user_count DESC;
