/*
  # Create stock price cache table

  1. New Tables
    - `stock_price_cache`
      - `symbol` (text, primary key)
      - `price` (numeric)
      - `last_updated` (timestamptz)

  2. Security
    - Enable RLS on stock_price_cache table
    - Add policies for authenticated users to read cache data
*/

-- Create stock price cache table
CREATE TABLE IF NOT EXISTS public.stock_price_cache (
  symbol text PRIMARY KEY,
  price numeric NOT NULL,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_price_cache ENABLE ROW LEVEL SECURITY;

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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stock_price_cache_symbol ON public.stock_price_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_price_cache_updated ON public.stock_price_cache(last_updated);