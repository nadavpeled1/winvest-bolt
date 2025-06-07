/*
  # Fix stock price cache table column naming

  1. Changes
    - Rename `lastUpdated` column to `last_updated` to match application code
    - Update indexes to use correct column name
    - Ensure table structure matches application expectations

  2. Security
    - Maintain existing RLS policies
*/

-- First, check if the table exists and drop it if it has the wrong column name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_price_cache' AND column_name = 'lastupdated'
  ) THEN
    DROP TABLE IF EXISTS public.stock_price_cache CASCADE;
  END IF;
END $$;

-- Create stock price cache table with correct column names
CREATE TABLE IF NOT EXISTS public.stock_price_cache (
  symbol text PRIMARY KEY,
  price numeric NOT NULL,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_price_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read stock prices" ON public.stock_price_cache;
DROP POLICY IF EXISTS "System can manage stock prices" ON public.stock_price_cache;

-- Create policies for stock price cache
CREATE POLICY "Anyone can read stock prices"
  ON public.stock_price_cache
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage stock prices"
  ON public.stock_price_cache
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
DROP INDEX IF EXISTS idx_stock_price_cache_symbol;
DROP INDEX IF EXISTS idx_stock_price_cache_updated;
DROP INDEX IF EXISTS idx_stock_price_cache_lastupdated;

CREATE INDEX IF NOT EXISTS idx_stock_price_cache_symbol ON public.stock_price_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_price_cache_updated ON public.stock_price_cache(last_updated);