-- Migration: Add word_sort_order column and UPDATE policy to user_settings table
-- Run this in Supabase SQL Editor so users can save their preferred sorting order

-- 1. Add word_sort_order column to user_settings if it doesn't already exist
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS word_sort_order TEXT DEFAULT 'newest';

-- 2. Add UPDATE policy so users can update their own settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_settings' 
        AND policyname = 'Users can update own settings'
    ) THEN
        CREATE POLICY "Users can update own settings"
        ON public.user_settings FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
END
$$;
