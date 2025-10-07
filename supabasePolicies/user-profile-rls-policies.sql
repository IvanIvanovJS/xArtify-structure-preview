-- ================================
-- User Profile RLS Policies
-- ================================
-- These policies ensure users can only access and modify their own profile data

-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Users can delete own profile" ON "User";

-- Policy: Users can view their own profile data
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

-- Policy: Users can update their own profile data
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- Policy: Users can delete their own profile (with additional checks in application)
CREATE POLICY "Users can delete own profile" ON "User"
  FOR DELETE USING (auth.uid()::text = id);

-- ================================
-- Artist Profile RLS Policies
-- ================================
-- These policies ensure artists can only access and modify their own artist profile

-- Enable RLS on ArtistProfile table
ALTER TABLE "ArtistProfile" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Artists can view own profile" ON "ArtistProfile";
DROP POLICY IF EXISTS "Artists can insert own profile" ON "ArtistProfile";
DROP POLICY IF EXISTS "Artists can update own profile" ON "ArtistProfile";
DROP POLICY IF EXISTS "Artists can delete own profile" ON "ArtistProfile";

-- Policy: Artists can view their own artist profile
CREATE POLICY "Artists can view own profile" ON "ArtistProfile"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Policy: Artists can create their own artist profile
CREATE POLICY "Artists can insert own profile" ON "ArtistProfile"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

-- Policy: Artists can update their own artist profile
CREATE POLICY "Artists can update own profile" ON "ArtistProfile"
  FOR UPDATE USING ("userId" = auth.uid()::text);

-- Policy: Artists can delete their own artist profile
CREATE POLICY "Artists can delete own profile" ON "ArtistProfile"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- ================================
-- Account and Session RLS Policies
-- ================================
-- These policies ensure users can only access their own authentication data

-- Enable RLS on Account table
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own accounts" ON "Account";
DROP POLICY IF EXISTS "Users can insert own accounts" ON "Account";
DROP POLICY IF EXISTS "Users can update own accounts" ON "Account";
DROP POLICY IF EXISTS "Users can delete own accounts" ON "Account";

-- Policy: Users can view their own account data
CREATE POLICY "Users can view own accounts" ON "Account"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Policy: Users can create their own account data
CREATE POLICY "Users can insert own accounts" ON "Account"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

-- Policy: Users can update their own account data
CREATE POLICY "Users can update own accounts" ON "Account"
  FOR UPDATE USING ("userId" = auth.uid()::text);

-- Policy: Users can delete their own account data
CREATE POLICY "Users can delete own accounts" ON "Account"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- Enable RLS on Session table
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own sessions" ON "Session";
DROP POLICY IF EXISTS "Users can insert own sessions" ON "Session";
DROP POLICY IF EXISTS "Users can update own sessions" ON "Session";
DROP POLICY IF EXISTS "Users can delete own sessions" ON "Session";

-- Policy: Users can view their own session data
CREATE POLICY "Users can view own sessions" ON "Session"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Policy: Users can create their own session data
CREATE POLICY "Users can insert own sessions" ON "Session"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

-- Policy: Users can update their own session data
CREATE POLICY "Users can update own sessions" ON "Session"
  FOR UPDATE USING ("userId" = auth.uid()::text);

-- Policy: Users can delete their own session data
CREATE POLICY "Users can delete own sessions" ON "Session"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- ================================
-- Password Reset Token RLS Policies
-- ================================
-- These policies ensure users can only access their own password reset tokens

-- Enable RLS on PasswordResetToken table
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reset tokens" ON "PasswordResetToken";
DROP POLICY IF EXISTS "Users can insert own reset tokens" ON "PasswordResetToken";
DROP POLICY IF EXISTS "Users can update own reset tokens" ON "PasswordResetToken";
DROP POLICY IF EXISTS "Users can delete own reset tokens" ON "PasswordResetToken";

-- Policy: Users can view their own password reset tokens
CREATE POLICY "Users can view own reset tokens" ON "PasswordResetToken"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Policy: Users can create their own password reset tokens
CREATE POLICY "Users can insert own reset tokens" ON "PasswordResetToken"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

-- Policy: Users can update their own password reset tokens
CREATE POLICY "Users can update own reset tokens" ON "PasswordResetToken"
  FOR UPDATE USING ("userId" = auth.uid()::text);

-- Policy: Users can delete their own password reset tokens
CREATE POLICY "Users can delete own reset tokens" ON "PasswordResetToken"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- ================================
-- Additional Security Notes
-- ================================
-- 
-- 1. These policies work in conjunction with application-level authentication
-- 2. The auth.uid() function returns the authenticated user's ID from Supabase Auth
-- 3. All profile operations are restricted to the authenticated user's own data
-- 4. Admin users have additional privileges handled at the application level
-- 5. The policies ensure data isolation between users at the database level
-- 
-- ================================
-- Testing the Policies
-- ================================
-- 
-- To test these policies:
-- 1. Create test users with different IDs
-- 2. Try to access other users' data (should fail)
-- 3. Try to modify other users' data (should fail)
-- 4. Verify that users can only access their own data
-- 
-- Example test queries:
-- SELECT * FROM "User" WHERE id = 'other-user-id'; -- Should return empty for non-admin users
-- UPDATE "User" SET name = 'Hacked' WHERE id = 'other-user-id'; -- Should fail for non-admin users
