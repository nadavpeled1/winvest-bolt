/*
  # Create authentication and user tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `cash` (numeric, default 10000)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `holdings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `stock_symbol` (text)
      - `amount` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  cash numeric DEFAULT 10000.00 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create holdings table
CREATE TABLE IF NOT EXISTS public.holdings (
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
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

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
CREATE POLICY "Users can view own holdings"
  ON public.holdings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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
  VALUES (new.id, new.raw_user_meta_data->>'username', 10000.00);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
  SET cash = cash - p_cost 
  WHERE id = p_user_id;
  
  -- Update holdings
  INSERT INTO holdings (user_id, stock_symbol, amount)
  VALUES (p_user_id, p_stock_symbol, p_qty)
  ON CONFLICT (user_id, stock_symbol)
  DO UPDATE SET amount = holdings.amount + excluded.amount;
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
  SET cash = cash + p_value 
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