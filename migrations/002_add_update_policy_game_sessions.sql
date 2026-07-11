-- Migration: Add UPDATE policy to game_sessions table
-- Run this in Supabase SQL Editor to fix the issue where level is stuck at 1

CREATE POLICY "Users can update their own game_sessions"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = user_id);
