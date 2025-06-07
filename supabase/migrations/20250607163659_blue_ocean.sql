/*
  # Portfolio Value Tracking System

  1. New Tables
    - `portfolio_transactions` - Track individual buy/sell transactions with purchase prices
    - `portfolio_positions` - Current positions with weighted average cost basis

  2. Functions
    - `handle_stock_purchase_with_tracking()` - Enhanced purchase tracking
    - `handle_stock_sale_with_tracking()` - Enhanced sale tracking with cost basis
    - `calculate_user_portfolio_value()` - Calculate portfolio value from stored prices
    - `get_leaderboard_with_portfolio_values()` - Leaderboard with portfolio calculations

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create portfolio transactions table to track all buy/sell activities
CREATE TABLE IF NOT EXISTS public.portfolio_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_share numeric NOT NULL CHECK (price_per_share > 0),
  total_value numeric NOT NULL CHECK (total_value > 0),
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create portfolio positions table to track current holdings with cost basis
CREATE TABLE IF NOT EXISTS public.portfolio_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  total_quantity integer NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  average_cost_basis numeric NOT NULL DEFAULT 0 CHECK (average_cost_basis >= 0),
  total_invested numeric NOT NULL DEFAULT 0 CHECK (total_invested >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

-- Enable RLS
ALTER TABLE public.portfolio_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_positions ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_transactions
CREATE POLICY "Users can view all transactions"
  ON public.portfolio_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own transactions"
  ON public.portfolio_transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for portfolio_positions
CREATE POLICY "Users can view all positions"
  ON public.portfolio_positions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own positions"
  ON public.portfolio_positions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Enhanced function to handle stock purchases with cost basis tracking
CREATE OR REPLACE FUNCTION handle_stock_purchase_with_tracking(
  p_user_id uuid,
  p_stock_symbol text,
  p_qty integer,
  p_price_per_share numeric
) RETURNS void AS $$
DECLARE
  v_total_cost numeric;
  v_current_qty integer := 0;
  v_current_invested numeric := 0;
  v_new_avg_cost numeric;
  v_new_total_invested numeric;
BEGIN
  -- Validate inputs
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;
  
  IF p_price_per_share <= 0 THEN
    RAISE EXCEPTION 'Price per share must be positive';
  END IF;

  v_total_cost := p_qty * p_price_per_share;

  -- Check if user has sufficient funds
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id AND cash >= v_total_cost
  ) THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  -- Get current position if exists
  SELECT total_quantity, total_invested
  INTO v_current_qty, v_current_invested
  FROM portfolio_positions
  WHERE user_id = p_user_id AND stock_symbol = p_stock_symbol;

  -- Calculate new weighted average cost basis
  v_new_total_invested := COALESCE(v_current_invested, 0) + v_total_cost;
  v_new_avg_cost := v_new_total_invested / (COALESCE(v_current_qty, 0) + p_qty);

  -- Update user cash
  UPDATE profiles 
  SET cash = cash - v_total_cost,
      updated_at = now()
  WHERE id = p_user_id;

  -- Record the transaction
  INSERT INTO portfolio_transactions (
    user_id, stock_symbol, transaction_type, quantity, 
    price_per_share, total_value
  ) VALUES (
    p_user_id, p_stock_symbol, 'buy', p_qty, 
    p_price_per_share, v_total_cost
  );

  -- Update or insert portfolio position
  INSERT INTO portfolio_positions (
    user_id, stock_symbol, total_quantity, 
    average_cost_basis, total_invested, updated_at
  ) VALUES (
    p_user_id, p_stock_symbol, p_qty, 
    p_price_per_share, v_total_cost, now()
  )
  ON CONFLICT (user_id, stock_symbol)
  DO UPDATE SET 
    total_quantity = COALESCE(v_current_qty, 0) + p_qty,
    average_cost_basis = v_new_avg_cost,
    total_invested = v_new_total_invested,
    updated_at = now();

  -- Update legacy holdings table for compatibility
  INSERT INTO holdings (user_id, stock_symbol, amount)
  VALUES (p_user_id, p_stock_symbol, p_qty)
  ON CONFLICT (user_id, stock_symbol)
  DO UPDATE SET amount = holdings.amount + excluded.amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to handle stock sales with cost basis tracking
CREATE OR REPLACE FUNCTION handle_stock_sale_with_tracking(
  p_user_id uuid,
  p_stock_symbol text,
  p_qty integer,
  p_price_per_share numeric
) RETURNS void AS $$
DECLARE
  v_total_value numeric;
  v_current_qty integer;
  v_current_invested numeric;
  v_avg_cost numeric;
  v_cost_of_sold_shares numeric;
  v_remaining_invested numeric;
BEGIN
  -- Validate inputs
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;
  
  IF p_price_per_share <= 0 THEN
    RAISE EXCEPTION 'Price per share must be positive';
  END IF;

  v_total_value := p_qty * p_price_per_share;

  -- Get current position
  SELECT total_quantity, total_invested, average_cost_basis
  INTO v_current_qty, v_current_invested, v_avg_cost
  FROM portfolio_positions
  WHERE user_id = p_user_id AND stock_symbol = p_stock_symbol;

  -- Check if user has sufficient shares
  IF v_current_qty IS NULL OR v_current_qty < p_qty THEN
    RAISE EXCEPTION 'Insufficient shares';
  END IF;

  -- Calculate cost basis of sold shares
  v_cost_of_sold_shares := v_avg_cost * p_qty;
  v_remaining_invested := v_current_invested - v_cost_of_sold_shares;

  -- Update user cash
  UPDATE profiles 
  SET cash = cash + v_total_value,
      updated_at = now()
  WHERE id = p_user_id;

  -- Record the transaction
  INSERT INTO portfolio_transactions (
    user_id, stock_symbol, transaction_type, quantity, 
    price_per_share, total_value
  ) VALUES (
    p_user_id, p_stock_symbol, 'sell', p_qty, 
    p_price_per_share, v_total_value
  );

  -- Update portfolio position
  IF v_current_qty = p_qty THEN
    -- Selling all shares - remove position
    DELETE FROM portfolio_positions
    WHERE user_id = p_user_id AND stock_symbol = p_stock_symbol;
  ELSE
    -- Partial sale - update position
    UPDATE portfolio_positions
    SET 
      total_quantity = v_current_qty - p_qty,
      total_invested = v_remaining_invested,
      updated_at = now()
    WHERE user_id = p_user_id AND stock_symbol = p_stock_symbol;
  END IF;

  -- Update legacy holdings table for compatibility
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

-- Function to calculate user portfolio value from stored purchase prices
CREATE OR REPLACE FUNCTION calculate_user_portfolio_value(p_user_id uuid)
RETURNS TABLE(
  total_portfolio_value numeric,
  total_invested numeric,
  cash_balance numeric,
  total_net_worth numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(pp.total_invested), 0) as total_portfolio_value,
    COALESCE(SUM(pp.total_invested), 0) as total_invested,
    p.cash as cash_balance,
    p.cash + COALESCE(SUM(pp.total_invested), 0) as total_net_worth
  FROM profiles p
  LEFT JOIN portfolio_positions pp ON p.id = pp.user_id
  WHERE p.id = p_user_id
  GROUP BY p.id, p.cash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard with portfolio values
CREATE OR REPLACE FUNCTION get_leaderboard_with_portfolio_values()
RETURNS TABLE(
  user_id uuid,
  username text,
  cash_balance numeric,
  portfolio_value numeric,
  total_net_worth numeric,
  rank_position bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.username,
    p.cash as cash_balance,
    COALESCE(SUM(pp.total_invested), 0) as portfolio_value,
    p.cash + COALESCE(SUM(pp.total_invested), 0) as total_net_worth,
    ROW_NUMBER() OVER (ORDER BY (p.cash + COALESCE(SUM(pp.total_invested), 0)) DESC) as rank_position
  FROM profiles p
  LEFT JOIN portfolio_positions pp ON p.id = pp.user_id
  GROUP BY p.id, p.username, p.cash
  ORDER BY total_net_worth DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_user_id ON public.portfolio_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_symbol ON public.portfolio_transactions(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_date ON public.portfolio_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_user_id ON public.portfolio_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_symbol ON public.portfolio_positions(stock_symbol);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.portfolio_transactions TO authenticated;
GRANT ALL ON public.portfolio_positions TO authenticated;
GRANT EXECUTE ON FUNCTION handle_stock_purchase_with_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION handle_stock_sale_with_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_portfolio_value TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard_with_portfolio_values TO authenticated;