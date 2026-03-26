-- Run this in the Supabase SQL Editor to add image support to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';
