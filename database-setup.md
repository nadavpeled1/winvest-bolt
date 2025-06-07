# Database Setup Instructions

Your application is failing because the database tables don't exist in your Supabase project. Follow these steps to fix the issue:

## Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to the **SQL Editor** in the left sidebar
4. Copy and paste the entire contents of `supabase/migrations/20250607084858_gentle_dune.sql` into the SQL editor
5. Click **Run** to execute the migration

## Option 2: Manual Table Creation

If you prefer to create tables manually, go to the **Table Editor** in your Supabase dashboard and create:

### Profiles Table
- Table name: `profiles`
- Columns:
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique, not null)
  - `cash` (numeric, default 10000.00, not null)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

### Holdings Table
- Table name: `holdings`
- Columns:
  - `id` (uuid, primary key, default gen_random_uuid())
  - `user_id` (uuid, references profiles.id, not null)
  - `stock_symbol` (text, not null)
  - `amount` (integer, default 0, not null)
  - `created_at` (timestamptz, default now())
- Add unique constraint on (user_id, stock_symbol)

## Important Notes

- Make sure to enable Row Level Security (RLS) on both tables
- The migration file contains all necessary policies and functions
- After applying the schema, your application should work correctly

## Verification

After applying the migration, you can verify it worked by:
1. Refreshing your application
2. The profile page should load without errors
3. You should be able to see user data and holdings