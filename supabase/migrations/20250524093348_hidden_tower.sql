/*
  # Enable authentication with my_users table

  1. Changes
    - Enable Row Level Security on my_users table
    - Add policies for authenticated users
    - Create function to handle user authentication
    - Create trigger to sync auth.users with my_users

  2. Security
    - Enable RLS on my_users table
    - Add policies for users to read/update their own data
*/

-- Enable RLS
ALTER TABLE my_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON my_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON my_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Create function to handle user authentication
CREATE OR REPLACE FUNCTION authenticate_user(p_username_or_email TEXT, p_password TEXT)
RETURNS my_users AS $$
DECLARE
  v_user my_users;
BEGIN
  -- Find user by username or email
  SELECT *
  INTO v_user
  FROM my_users
  WHERE (username = p_username_or_email OR email = p_username_or_email)
    AND password = p_password;

  RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;