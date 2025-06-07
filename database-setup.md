# Database Setup Instructions

Your application is failing because the database tables don't exist in your Supabase project. Follow these steps to fix the issue:

## Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to the **SQL Editor** in the left sidebar
4. **IMPORTANT**: Apply migrations in the following order:

### Step 1: Apply Core Schema Migration
Copy and paste the entire contents of `supabase/migrations/20250607084858_gentle_dune.sql` into the SQL editor and click **Run**.

### Step 2: Apply Stock Price Cache Migration
Copy and paste the entire contents of `supabase/migrations/fix_stock_price_cache_column.sql` into the SQL editor and click **Run**.

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

### Stock Price Cache Table
- Table name: `stock_price_cache`
- Columns:
  - `symbol` (text, primary key)
  - `price` (numeric, not null)
  - `last_updated` (timestamptz, default now())

## Important Notes

- Make sure to enable Row Level Security (RLS) on all tables
- The migration files contain all necessary policies and functions
- **CRITICAL**: The `stock_price_cache` table must use `last_updated` (snake_case) column name
- After applying the schema, your application should work correctly

## Verification

After applying the migrations, you can verify it worked by:
1. Refreshing your application
2. The profile page should load without errors
3. You should be able to see user data and holdings
4. The leaderboard "Update Portfolio Values" button should work without errors

## Troubleshooting

If you still see column name errors:
1. Check that the `stock_price_cache` table has a column named `last_updated` (not `lastUpdated`)
2. If the column name is wrong, run the `fix_stock_price_cache_column.sql` migration
3. Refresh your browser and try again