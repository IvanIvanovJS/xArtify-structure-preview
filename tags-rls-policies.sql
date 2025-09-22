-- RLS Policies for Tags Table
-- This file contains Row Level Security policies for the tags table
-- Execute these commands in your Supabase SQL editor or PostgreSQL database

-- Enable RLS on tags table
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;

-- Policy: Artists can view their own tags
CREATE POLICY "Artists can view own tags" ON "Tag"
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM "ArtistProfile" 
      WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Artists can insert their own tags
CREATE POLICY "Artists can insert own tags" ON "Tag"
  FOR INSERT WITH CHECK (
    artist_id IN (
      SELECT id FROM "ArtistProfile" 
      WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Artists can update their own tags
CREATE POLICY "Artists can update own tags" ON "Tag"
  FOR UPDATE USING (
    artist_id IN (
      SELECT id FROM "ArtistProfile" 
      WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Artists can delete their own tags
CREATE POLICY "Artists can delete own tags" ON "Tag"
  FOR DELETE USING (
    artist_id IN (
      SELECT id FROM "ArtistProfile" 
      WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Admins can view all tags
CREATE POLICY "Admins can view all tags" ON "Tag"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Policy: Admins can insert tags for any artist
CREATE POLICY "Admins can insert any tags" ON "Tag"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Policy: Admins can update any tags
CREATE POLICY "Admins can update any tags" ON "Tag"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Policy: Admins can delete any tags
CREATE POLICY "Admins can delete any tags" ON "Tag"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Tag_artist_id_idx" ON "Tag"("artist_id");
CREATE INDEX IF NOT EXISTS "Tag_created_at_idx" ON "Tag"("created_at");
CREATE INDEX IF NOT EXISTS "Tag_name_artist_id_idx" ON "Tag"("name", "artist_id");

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tag" TO authenticated;
GRANT USAGE ON SEQUENCE "Tag_id_seq" TO authenticated;
