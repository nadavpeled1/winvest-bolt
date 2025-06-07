-- Add cash column to users table
ALTER TABLE public.users
ADD COLUMN cash DECIMAL(15,2) DEFAULT 10000.00 NOT NULL;

-- Create holdings table
CREATE TABLE public.holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  stock_symbol VARCHAR(10) NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, stock_symbol)
);

-- Disable RLS for holdings table since we're not using Supabase Auth
ALTER TABLE public.holdings DISABLE ROW LEVEL SECURITY;

-- Add weekly cash increment function
CREATE OR REPLACE FUNCTION increment_weekly_cash()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET cash = cash + 100.00;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run weekly (this needs to be set up in your task scheduler)
-- For development, you can manually run: SELECT increment_weekly_cash();