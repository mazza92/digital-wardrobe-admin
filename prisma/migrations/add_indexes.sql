-- Performance indexes for common queries
-- Run this SQL directly in Supabase SQL Editor

-- Outfit indexes
CREATE INDEX IF NOT EXISTS "outfits_isPublished_createdAt_idx" ON "outfits" ("isPublished", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "outfits_category_idx" ON "outfits" ("category");
CREATE INDEX IF NOT EXISTS "outfits_createdAt_idx" ON "outfits" ("createdAt" DESC);

-- Product indexes
CREATE INDEX IF NOT EXISTS "products_outfitId_idx" ON "products" ("outfitId");
CREATE INDEX IF NOT EXISTS "products_brand_idx" ON "products" ("brand");
CREATE INDEX IF NOT EXISTS "products_outfitId_createdAt_idx" ON "products" ("outfitId", "createdAt");

