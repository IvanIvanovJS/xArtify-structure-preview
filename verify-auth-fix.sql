-- Verify Authentication Fix Results
-- Run this to check if the fix worked correctly

-- 1. Check for duplicate users (should return 0 rows)
SELECT 
    u.email,
    COUNT(*) as user_count
FROM "User" u
WHERE u.email IS NOT NULL
GROUP BY u.email
HAVING COUNT(*) > 1;

-- 2. Check if RLS is enabled on all auth tables
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('User', 'Account', 'Session')
ORDER BY tablename;

-- 3. Check existing policies on User table
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'User'
ORDER BY policyname;

-- 4. Check existing policies on Account table
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'Account'
ORDER BY policyname;

-- 5. Check existing policies on Session table
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'Session'
ORDER BY policyname;

-- 6. Check if helper functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'is_owner')
AND routine_schema = 'public';

-- 7. Check user accounts with multiple providers
SELECT 
    u.email,
    u.name,
    STRING_AGG(a.provider, ', ') as providers,
    COUNT(a.id) as account_count
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
WHERE u.email IS NOT NULL
GROUP BY u.email, u.name
HAVING COUNT(a.id) > 1
ORDER BY account_count DESC;
