/*
  # Fix users table constraints

  1. Changes
    - Make password column nullable in my_users table
    - This allows Supabase to handle authentication while my_users stores profile data

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

ALTER TABLE my_users 
ALTER COLUMN password DROP NOT NULL;