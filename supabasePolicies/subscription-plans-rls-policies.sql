-- Enable RLS on subscription plans table
ALTER TABLE "SubscriptionPlan" ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read subscription plans (public information)
CREATE POLICY "subscription_plans_select" ON "SubscriptionPlan"
  FOR SELECT USING (true);

-- Only admins can insert, update, or delete subscription plans
CREATE POLICY "subscription_plans_insert" ON "SubscriptionPlan"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

CREATE POLICY "subscription_plans_update" ON "SubscriptionPlan"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

CREATE POLICY "subscription_plans_delete" ON "SubscriptionPlan"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Enable RLS on artist subscriptions table
ALTER TABLE "ArtistSubscription" ENABLE ROW LEVEL SECURITY;

-- Artists can view their own subscription
CREATE POLICY "artist_subscriptions_select" ON "ArtistSubscription"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "ArtistProfile" 
      WHERE "ArtistProfile".id = "ArtistSubscription"."artistId"
      AND "ArtistProfile"."userId" = auth.uid()::text
    )
  );

-- Artists can insert their own subscription (during onboarding)
CREATE POLICY "artist_subscriptions_insert" ON "ArtistSubscription"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "ArtistProfile" 
      WHERE "ArtistProfile".id = "ArtistSubscription"."artistId"
      AND "ArtistProfile"."userId" = auth.uid()::text
    )
  );

-- Artists can update their own subscription
CREATE POLICY "artist_subscriptions_update" ON "ArtistSubscription"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "ArtistProfile" 
      WHERE "ArtistProfile".id = "ArtistSubscription"."artistId"
      AND "ArtistProfile"."userId" = auth.uid()::text
    )
  );

-- Artists can delete their own subscription (cancellation)
CREATE POLICY "artist_subscriptions_delete" ON "ArtistSubscription"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "ArtistProfile" 
      WHERE "ArtistProfile".id = "ArtistSubscription"."artistId"
      AND "ArtistProfile"."userId" = auth.uid()::text
    )
  );

-- Admins can view all subscriptions
CREATE POLICY "artist_subscriptions_admin_select" ON "ArtistSubscription"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admins can update all subscriptions
CREATE POLICY "artist_subscriptions_admin_update" ON "ArtistSubscription"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Enable RLS on artist FAQs table
ALTER TABLE "ArtistFAQ" ENABLE ROW LEVEL SECURITY;

-- Artists can view their own FAQs
CREATE POLICY "artist_faqs_select" ON "ArtistFAQ"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "ArtistProfile" 
      WHERE "ArtistProfile".id = "ArtistFAQ"."artistId"
      AND "ArtistProfile"."userId" = auth.uid()::text
    )
  );

-- Artists can insert their own FAQs
CREATE POLICY "artist_faqs_insert" ON "ArtistFAQ"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "ArtistProfile" 
      WHERE "ArtistProfile".id = "ArtistFAQ"."artistId"
      AND "ArtistProfile"."userId" = auth.uid()::text
    )
  );

-- Artists can update their own FAQs
CREATE POLICY "artist_faqs_update" ON "ArtistFAQ"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "ArtistProfile" 
      WHERE "ArtistProfile".id = "ArtistFAQ"."artistId"
      AND "ArtistProfile"."userId" = auth.uid()::text
    )
  );

-- Artists can delete their own FAQs
CREATE POLICY "artist_faqs_delete" ON "ArtistFAQ"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "ArtistProfile" 
      WHERE "ArtistProfile".id = "ArtistFAQ"."artistId"
      AND "ArtistProfile"."userId" = auth.uid()::text
    )
  );

-- Public can view artist FAQs (for artist profiles)
CREATE POLICY "artist_faqs_public_select" ON "ArtistFAQ"
  FOR SELECT USING (true);

-- Admins can view all FAQs
CREATE POLICY "artist_faqs_admin_select" ON "ArtistFAQ"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admins can update all FAQs
CREATE POLICY "artist_faqs_admin_update" ON "ArtistFAQ"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admins can delete all FAQs
CREATE POLICY "artist_faqs_admin_delete" ON "ArtistFAQ"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Update existing artist profile policies to include new fields
-- Drop existing policies first
DROP POLICY IF EXISTS "artist_profiles_select" ON "ArtistProfile";
DROP POLICY IF EXISTS "artist_profiles_insert" ON "ArtistProfile";
DROP POLICY IF EXISTS "artist_profiles_update" ON "ArtistProfile";
DROP POLICY IF EXISTS "artist_profiles_delete" ON "ArtistProfile";

-- Recreate artist profile policies with enhanced security
CREATE POLICY "artist_profiles_select" ON "ArtistProfile"
  FOR SELECT USING (
    -- Users can view their own profile
    "userId" = auth.uid()::text
    OR
    -- Public can view artist profiles (for gallery)
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = "ArtistProfile"."userId"
      AND "User".role IN ('ARTIST', 'ADMIN')
    )
    OR
    -- Admins can view all profiles
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

CREATE POLICY "artist_profiles_insert" ON "ArtistProfile"
  FOR INSERT WITH CHECK (
    -- Users can create their own artist profile
    "userId" = auth.uid()::text
    OR
    -- Admins can create profiles for any user
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

CREATE POLICY "artist_profiles_update" ON "ArtistProfile"
  FOR UPDATE USING (
    -- Users can update their own profile
    "userId" = auth.uid()::text
    OR
    -- Admins can update any profile
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

CREATE POLICY "artist_profiles_delete" ON "ArtistProfile"
  FOR DELETE USING (
    -- Users can delete their own profile
    "userId" = auth.uid()::text
    OR
    -- Admins can delete any profile
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Enable RLS on payment intents table
ALTER TABLE "payment_intents" ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment intents
CREATE POLICY "payment_intents_select" ON "payment_intents"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Users can insert their own payment intents
CREATE POLICY "payment_intents_insert" ON "payment_intents"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

-- Users can update their own payment intents
CREATE POLICY "payment_intents_update" ON "payment_intents"
  FOR UPDATE USING ("userId" = auth.uid()::text);

-- Admins can view all payment intents
CREATE POLICY "payment_intents_admin_select" ON "payment_intents"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admins can update all payment intents
CREATE POLICY "payment_intents_admin_update" ON "payment_intents"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

