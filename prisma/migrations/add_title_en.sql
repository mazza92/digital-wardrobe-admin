-- Add titleEn column to outfits table
-- Run this SQL directly in Supabase SQL Editor if Prisma migration fails

ALTER TABLE "outfits" 
ADD COLUMN IF NOT EXISTS "titleEn" TEXT;

