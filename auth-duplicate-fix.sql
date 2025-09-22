-- Authentication Duplicate Users Fix
-- This script fixes the duplicate user issue where the same email can be used
-- for both credentials and OAuth authentication

-- Step 1: Identify duplicate users (same email, different accounts)
-- Run this query to see duplicates:
/*
SELECT 
    u.email,
    COUNT(*) as user_count,
    STRING_AGG(u.id, ', ') as user_ids,
    STRING_AGG(a.provider, ', ') as providers
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
WHERE u.email IS NOT NULL
GROUP BY u.email
HAVING COUNT(*) > 1
ORDER BY user_count DESC;
*/

-- Step 2: Create a function to merge duplicate users
CREATE OR REPLACE FUNCTION merge_duplicate_users()
RETURNS void AS $$
DECLARE
    duplicate_record RECORD;
    primary_user_id TEXT;
    secondary_user_id TEXT;
    account_record RECORD;
BEGIN
    -- Find all duplicate email addresses
    FOR duplicate_record IN
        SELECT 
            u.email,
            u.id as user_id,
            ROW_NUMBER() OVER (PARTITION BY u.email ORDER BY u."createdAt" ASC) as rn
        FROM "User" u
        WHERE u.email IS NOT NULL
        GROUP BY u.email, u.id, u."createdAt"
        HAVING COUNT(*) OVER (PARTITION BY u.email) > 1
    LOOP
        -- Skip if this is not the first (oldest) user
        IF duplicate_record.rn > 1 THEN
            -- Get the primary (oldest) user ID
            SELECT id INTO primary_user_id 
            FROM "User" 
            WHERE email = duplicate_record.email 
            ORDER BY "createdAt" ASC 
            LIMIT 1;
            
            secondary_user_id := duplicate_record.user_id;
            
            -- Move all accounts from secondary user to primary user
            UPDATE "Account" 
            SET "userId" = primary_user_id 
            WHERE "userId" = secondary_user_id;
            
            -- Move artist profile if exists
            UPDATE "ArtistProfile" 
            SET "userId" = primary_user_id 
            WHERE "userId" = secondary_user_id;
            
            -- Move subscriptions
            UPDATE "Subscription" 
            SET "userId" = primary_user_id 
            WHERE "userId" = secondary_user_id;
            
            -- Move enrollments
            UPDATE "Enrollment" 
            SET "userId" = primary_user_id 
            WHERE "userId" = secondary_user_id;
            
            -- Move password reset tokens
            UPDATE "PasswordResetToken" 
            SET "userId" = primary_user_id 
            WHERE "userId" = secondary_user_id;
            
            -- Update user data with the most complete information
            UPDATE "User" 
            SET 
                name = COALESCE(name, (SELECT name FROM "User" WHERE id = secondary_user_id)),
                image = COALESCE(image, (SELECT image FROM "User" WHERE id = secondary_user_id)),
                "emailVerified" = COALESCE("emailVerified", (SELECT "emailVerified" FROM "User" WHERE id = secondary_user_id))
            WHERE id = primary_user_id;
            
            -- Delete the secondary user
            DELETE FROM "User" WHERE id = secondary_user_id;
            
            RAISE NOTICE 'Merged user % into primary user % for email %', 
                secondary_user_id, primary_user_id, duplicate_record.email;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Run the merge function
SELECT merge_duplicate_users();

-- Step 4: Clean up the function
-- DROP FUNCTION merge_duplicate_users();

-- Step 5: Verify no duplicates remain
SELECT 
    u.email,
    COUNT(*) as user_count
FROM "User" u
WHERE u.email IS NOT NULL
GROUP BY u.email
HAVING COUNT(*) > 1;

-- Step 6: Check if helper functions exist, create them if needed
-- These functions are used by the existing RLS policies

-- Create is_admin() function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "User" 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create is_owner(user_id) function if it doesn't exist
CREATE OR REPLACE FUNCTION is_owner(user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN auth.uid()::text = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We're keeping existing policies as they use proper helper functions
-- Only add missing policies for Account and Session tables

-- Step 7: Enable RLS policies for authentication tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Note: User table already has proper policies, we only need to add policies for Account and Session tables

-- Account table policies using helper functions
CREATE POLICY "Users can view own accounts" ON "Account"
  FOR SELECT USING (is_owner("userId"));

CREATE POLICY "Users can insert own accounts" ON "Account"
  FOR INSERT WITH CHECK (is_owner("userId"));

CREATE POLICY "Users can update own accounts" ON "Account"
  FOR UPDATE USING (is_owner("userId"));

CREATE POLICY "Users can delete own accounts" ON "Account"
  FOR DELETE USING (is_owner("userId"));

CREATE POLICY "Admins can view all accounts" ON "Account"
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all accounts" ON "Account"
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all accounts" ON "Account"
  FOR DELETE USING (is_admin());

-- Session table policies using helper functions
CREATE POLICY "Users can view own sessions" ON "Session"
  FOR SELECT USING (is_owner("userId"));

CREATE POLICY "Users can insert own sessions" ON "Session"
  FOR INSERT WITH CHECK (is_owner("userId"));

CREATE POLICY "Users can update own sessions" ON "Session"
  FOR UPDATE USING (is_owner("userId"));

CREATE POLICY "Users can delete own sessions" ON "Session"
  FOR DELETE USING (is_owner("userId"));

CREATE POLICY "Admins can view all sessions" ON "Session"
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all sessions" ON "Session"
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all sessions" ON "Session"
  FOR DELETE USING (is_admin());
