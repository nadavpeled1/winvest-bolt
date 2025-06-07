-- Function to handle stock purchase
CREATE OR REPLACE FUNCTION handle_stock_purchase(
  user_id uuid,
  stock_symbol text,
  qty integer,
  cost numeric
) RETURNS void AS $$
BEGIN
  -- Check if user has sufficient funds
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND cash >= cost
  ) THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  -- Update user cash
  UPDATE users 
  SET cash = cash - cost 
  WHERE id = user_id;
  
  -- Update holdings
  INSERT INTO holdings (user_id, stock_symbol, amount)
  VALUES (user_id, stock_symbol, qty)
  ON CONFLICT (user_id, stock_symbol)
  DO UPDATE SET amount = holdings.amount + excluded.amount;
END;
$$ LANGUAGE plpgsql;

-- Function to handle stock sale
CREATE OR REPLACE FUNCTION handle_stock_sale(
  user_id uuid,
  stock_symbol text,
  qty integer,
  value numeric
) RETURNS void AS $$
BEGIN
  -- Check if user has sufficient shares
  IF NOT EXISTS (
    SELECT 1 FROM holdings 
    WHERE user_id = user_id 
    AND stock_symbol = stock_symbol 
    AND amount >= qty
  ) THEN
    RAISE EXCEPTION 'Insufficient shares';
  END IF;

  -- Update user cash
  UPDATE users 
  SET cash = cash + value 
  WHERE id = user_id;
  
  -- Update holdings
  UPDATE holdings 
  SET amount = amount - qty 
  WHERE user_id = user_id AND stock_symbol = stock_symbol;
  
  -- Delete holding if amount is 0
  DELETE FROM holdings 
  WHERE user_id = user_id 
    AND stock_symbol = stock_symbol 
    AND amount <= 0;
END;
$$ LANGUAGE plpgsql;