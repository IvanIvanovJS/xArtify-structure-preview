  -- RLS Policies for Tags Table
  -- This file contains Row Level Security policies for the tags table
  -- Execute these commands in your Supabase SQL editor or PostgreSQL database

  -- Enable RLS on tags table
  ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;

  -- Policy: Artists can view their own tags
  CREATE POLICY "Artists can view own tags" ON "Tag"
    FOR SELECT USING (
      "artistId" IN (
        SELECT id FROM "ArtistProfile" 
        WHERE "userId" = auth.uid()::text
      )
    );

  -- Policy: Artists can insert their own tags
  CREATE POLICY "Artists can insert own tags" ON "Tag"
    FOR INSERT WITH CHECK (
      "artistId" IN (
        SELECT id FROM "ArtistProfile" 
        WHERE "userId" = auth.uid()::text
      )
    );

  -- Policy: Artists can update their own tags
  CREATE POLICY "Artists can update own tags" ON "Tag"
    FOR UPDATE USING (
      "artistId" IN (
        SELECT id FROM "ArtistProfile" 
        WHERE "userId" = auth.uid()::text
      )
    );

  -- Policy: Artists can delete their own tags
  CREATE POLICY "Artists can delete own tags" ON "Tag"
    FOR DELETE USING (
      "artistId" IN (
        SELECT id FROM "ArtistProfile" 
        WHERE "userId" = auth.uid()::text
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
  CREATE INDEX IF NOT EXISTS "Tag_artistId_idx" ON "Tag"("artistId");
  CREATE INDEX IF NOT EXISTS "Tag_createdAt_idx" ON "Tag"("createdAt");
  CREATE INDEX IF NOT EXISTS "Tag_name_artistId_idx" ON "Tag"("name", "artistId");

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tag" TO authenticated;
