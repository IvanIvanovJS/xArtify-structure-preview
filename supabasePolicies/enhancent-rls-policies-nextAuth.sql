-- =============================================
-- ФАЗА 2: ENHANCED RLS POLICIES FOR NEXTAUTH
-- =============================================
-- Изпълни този SQL в Supabase SQL Editor СЛЕД rls-helper-functions.sql

-- =============================================
-- 1. DROP EXISTING BROKEN POLICIES
-- =============================================

-- Drop all existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";
DROP POLICY IF EXISTS "Users can insert own data" ON "User";

DROP POLICY IF EXISTS "Artists can create own profile" ON "ArtistProfile";
DROP POLICY IF EXISTS "Artists can update own profile" ON "ArtistProfile";
DROP POLICY IF EXISTS "Artists can manage own profile" ON "ArtistProfile";

DROP POLICY IF EXISTS "Artists can create paintings" ON "Painting";
DROP POLICY IF EXISTS "Artists can update own paintings" ON "Painting";
DROP POLICY IF EXISTS "Artists can delete own paintings" ON "Painting";
DROP POLICY IF EXISTS "Artists can manage own paintings" ON "Painting";

DROP POLICY IF EXISTS "Users can create enrollments" ON "Enrollment";
DROP POLICY IF EXISTS "Users can update own enrollments" ON "Enrollment";
DROP POLICY IF EXISTS "Users can manage own enrollments" ON "Enrollment";

DROP POLICY IF EXISTS "Users can create own subscriptions" ON "Subscription";
DROP POLICY IF EXISTS "Users can update own subscriptions" ON "Subscription";
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON "Subscription";

DROP POLICY IF EXISTS "Users can view own password reset tokens" ON "PasswordResetToken";
DROP POLICY IF EXISTS "Users can create own password reset tokens" ON "PasswordResetToken";

-- =============================================
-- 2. USER TABLE POLICIES
-- =============================================

-- Users can view their own data
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (is_owner(id));

-- Users can update their own data
CREATE POLICY "Users can update own data" ON "User"
  FOR UPDATE USING (is_owner(id));

-- Users can create their own account (for registration)
CREATE POLICY "Users can create own account" ON "User"
  FOR INSERT WITH CHECK (is_owner(id));

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON "User"
  FOR SELECT USING (is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON "User"
  FOR UPDATE USING (is_admin());

-- =============================================
-- 3. ARTISTPROFILE TABLE POLICIES
-- =============================================

-- Everyone can view artist profiles (for gallery)
CREATE POLICY "Everyone can view artist profiles" ON "ArtistProfile"
  FOR SELECT USING (true);

-- Users can create their own artist profile
CREATE POLICY "Users can create own artist profile" ON "ArtistProfile"
  FOR INSERT WITH CHECK (is_owner("userId"));

-- Artists can update their own profile
CREATE POLICY "Artists can update own profile" ON "ArtistProfile"
  FOR UPDATE USING (is_owner("userId"));

-- Artists can delete their own profile
CREATE POLICY "Artists can delete own profile" ON "ArtistProfile"
  FOR DELETE USING (is_owner("userId"));

-- Admins can manage all artist profiles
CREATE POLICY "Admins can manage all artist profiles" ON "ArtistProfile"
  FOR ALL USING (is_admin());

-- =============================================
-- 4. PAINTING TABLE POLICIES
-- =============================================

-- Everyone can view paintings (for gallery)
CREATE POLICY "Everyone can view paintings" ON "Painting"
  FOR SELECT USING (true);

-- Artists can create paintings (must have artist profile)
CREATE POLICY "Artists can create paintings" ON "Painting"
  FOR INSERT WITH CHECK (
    has_artist_profile() AND 
    "artistId" = get_current_artist_id()
  );

-- Artists can update their own paintings
CREATE POLICY "Artists can update own paintings" ON "Painting"
  FOR UPDATE USING (is_painting_owner(id));

-- Artists can delete their own paintings
CREATE POLICY "Artists can delete own paintings" ON "Painting"
  FOR DELETE USING (is_painting_owner(id));

-- Admins can manage all paintings
CREATE POLICY "Admins can manage all paintings" ON "Painting"
  FOR ALL USING (is_admin());

-- =============================================
-- 5. ENROLLMENT TABLE POLICIES
-- =============================================

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON "Enrollment"
  FOR SELECT USING (is_owner("userId"));

-- Users can create their own enrollments
CREATE POLICY "Users can create own enrollments" ON "Enrollment"
  FOR INSERT WITH CHECK (is_owner("userId"));

-- Users can update their own enrollments
CREATE POLICY "Users can update own enrollments" ON "Enrollment"
  FOR UPDATE USING (is_owner("userId"));

-- Users can delete their own enrollments
CREATE POLICY "Users can delete own enrollments" ON "Enrollment"
  FOR DELETE USING (is_owner("userId"));

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage all enrollments" ON "Enrollment"
  FOR ALL USING (is_admin());

-- =============================================
-- 6. SUBSCRIPTION TABLE POLICIES
-- =============================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON "Subscription"
  FOR SELECT USING (is_owner("userId"));

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions" ON "Subscription"
  FOR INSERT WITH CHECK (is_owner("userId"));

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON "Subscription"
  FOR UPDATE USING (is_owner("userId"));

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions" ON "Subscription"
  FOR DELETE USING (is_owner("userId"));

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON "Subscription"
  FOR ALL USING (is_admin());

-- =============================================
-- 7. PASSWORDRESETTOKEN TABLE POLICIES
-- =============================================

-- Users can view their own password reset tokens
CREATE POLICY "Users can view own password reset tokens" ON "PasswordResetToken"
  FOR SELECT USING (is_owner("userId"));

-- Users can create their own password reset tokens
CREATE POLICY "Users can create own password reset tokens" ON "PasswordResetToken"
  FOR INSERT WITH CHECK (is_owner("userId"));

-- Users can delete their own password reset tokens
CREATE POLICY "Users can delete own password reset tokens" ON "PasswordResetToken"
  FOR DELETE USING (is_owner("userId"));

-- Admins can manage all password reset tokens
CREATE POLICY "Admins can manage all password reset tokens" ON "PasswordResetToken"
  FOR ALL USING (is_admin());

-- =============================================
-- 8. VERIFICATION COMPLETE
-- =============================================

-- Show all active policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  CASE 
    WHEN qual IS NULL THEN 'No WHERE condition'
    ELSE qual
  END as where_condition,
  CASE 
    WHEN with_check IS NULL THEN 'No CHECK condition'
    ELSE with_check
  END as check_condition
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Test the policies (will show current context)
SELECT 
  'Policy Test' as test_type,
  test_user_context() as result;
