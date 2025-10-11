-- RLS Policies for Admin Subscription Management
-- These policies ensure only admins can access subscription management functionality

-- Enable RLS on ArtistSubscription table (if not already enabled)
ALTER TABLE "ArtistSubscription" ENABLE ROW LEVEL SECURITY;

-- Admin can view all artist subscriptions
CREATE POLICY "admin_artist_subscriptions_select" ON "ArtistSubscription"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admin can update artist subscriptions (for management actions)
CREATE POLICY "admin_artist_subscriptions_update" ON "ArtistSubscription"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admin can insert artist subscriptions (for manual creation if needed)
CREATE POLICY "admin_artist_subscriptions_insert" ON "ArtistSubscription"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admin can delete artist subscriptions (for cleanup if needed)
CREATE POLICY "admin_artist_subscriptions_delete" ON "ArtistSubscription"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Enable RLS on PaymentIntent table (if not already enabled)
ALTER TABLE "payment_intents" ENABLE ROW LEVEL SECURITY;

-- Admin can view all payment intents
CREATE POLICY "admin_payment_intents_select" ON "payment_intents"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admin can update payment intents
CREATE POLICY "admin_payment_intents_update" ON "payment_intents"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admin can insert payment intents
CREATE POLICY "admin_payment_intents_insert" ON "payment_intents"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admin can delete payment intents
CREATE POLICY "admin_payment_intents_delete" ON "payment_intents"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Additional policies for analytics queries
-- Admin can access aggregated subscription data
CREATE POLICY "admin_subscription_analytics" ON "ArtistSubscription"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admin can access user data for subscription management
CREATE POLICY "admin_user_subscription_data" ON "User"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" admin_user
      WHERE admin_user.id = auth.uid()::text 
      AND admin_user.role = 'ADMIN'
    )
  );

-- Admin can access artist profile data for subscription management
CREATE POLICY "admin_artist_profile_subscription_data" ON "ArtistProfile"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );
