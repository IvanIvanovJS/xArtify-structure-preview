-- Favorites RLS Policies
-- This file contains Row Level Security policies for the favorites table

-- Enable RLS on favorites table
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid()::text = "userId");

-- Users can add their own favorites
CREATE POLICY "Users can add own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid()::text = "userId");

-- Admins can view all favorites
CREATE POLICY "Admins can view all favorites" ON favorites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Admins can delete any favorites
CREATE POLICY "Admins can delete any favorites" ON favorites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User".role = 'ADMIN'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites("userId");
CREATE INDEX IF NOT EXISTS idx_favorites_painting_id ON favorites("paintingId");
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites("createdAt");

-- Create a function to check if user has favorited a painting
CREATE OR REPLACE FUNCTION is_painting_favorited(painting_id_param TEXT, user_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM favorites 
    WHERE "paintingId" = painting_id_param 
    AND "userId" = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_painting_favorited(TEXT, TEXT) TO authenticated;
