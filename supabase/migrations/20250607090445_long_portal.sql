/*
  # Complete Database Setup for Stock Trading App
  
  This script creates all necessary tables, functions, and policies for the stock trading application.
  Run this in your Supabase SQL Editor to fix the "relation does not exist" errors.
  
  1. New Tables
    - `profiles` - User profiles with cash balance
    - `holdings` - User stock holdings
    
  2. Functions
    - `handle_new_user()` - Creates profile when user signs up
    - `handle_stock_purchase()` - Handles stock purchases
    - `handle_stock_sale()` - Handles stock sales
    
  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Drop existing objects if they exist (for clean setup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS handle_stock_purchase(uuid, text, integer, numeric);
DROP FUNCTION IF EXISTS handle_stock_sale(uuid, text, integer, numeric);
DROP TABLE IF EXISTS public.holdings;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  cash numeric DEFAULT 10000.00 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create holdings table
CREATE TABLE public.holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for holdings
CREATE POLICY "Users can view all holdings"
  ON public.holdings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own holdings"
  ON public.holdings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, cash)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'User'),
    10000.00
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to handle stock purchases
CREATE OR REPLACE FUNCTION handle_stock_purchase(
  p_user_id uuid,
  p_stock_symbol text,
  p_qty integer,
  p_cost numeric
) RETURNS void AS $$
BEGIN
  -- Check if user has sufficient funds
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id AND cash >= p_cost
  ) THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  -- Update user cash
  UPDATE profiles 
  SET cash = cash - p_cost,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Update holdings
  INSERT INTO holdings (user_id, stock_symbol, amount)
  VALUES (p_user_id, p_stock_symbol, p_qty)
  ON CONFLICT (user_id, stock_symbol)
  DO UPDATE SET 
    amount = holdings.amount + excluded.amount,
    created_at = CASE 
      WHEN holdings.amount = 0 THEN now() 
      ELSE holdings.created_at 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle stock sales
CREATE OR REPLACE FUNCTION handle_stock_sale(
  p_user_id uuid,
  p_stock_symbol text,
  p_qty integer,
  p_value numeric
) RETURNS void AS $$
BEGIN
  -- Check if user has sufficient shares
  IF NOT EXISTS (
    SELECT 1 FROM holdings 
    WHERE user_id = p_user_id 
    AND stock_symbol = p_stock_symbol 
    AND amount >= p_qty
  ) THEN
    RAISE EXCEPTION 'Insufficient shares';
  END IF;

  -- Update user cash
  UPDATE profiles 
  SET cash = cash + p_value,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Update holdings
  UPDATE holdings 
  SET amount = amount - p_qty 
  WHERE user_id = p_user_id AND stock_symbol = p_stock_symbol;
  
  -- Delete holding if amount is 0
  DELETE FROM holdings 
  WHERE user_id = p_user_id 
    AND stock_symbol = p_stock_symbol 
    AND amount <= 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON public.holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_stock_symbol ON public.holdings(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_holdings_user_stock ON public.holdings(user_id, stock_symbol);

-- Insert sample data for existing users (if any)
-- This will create profiles for any existing auth users who don't have profiles yet
INSERT INTO public.profiles (id, username, cash)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1), 'User') as username,
  10000.00 as cash
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.holdings TO authenticated;
GRANT EXECUTE ON FUNCTION handle_stock_purchase TO authenticated;
GRANT EXECUTE ON FUNCTION handle_stock_sale TO authenticated;