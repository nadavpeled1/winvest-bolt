import { supabase } from './supabase';

export interface PortfolioTransaction {
  id: string;
  user_id: string;
  stock_symbol: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price_per_share: number;
  total_value: number;
  transaction_date: string;
}

export interface PortfolioPosition {
  id: string;
  user_id: string;
  stock_symbol: string;
  total_quantity: number;
  average_cost_basis: number;
  total_invested: number;
  updated_at: string;
}

export interface PortfolioValue {
  total_portfolio_value: number;
  total_invested: number;
  cash_balance: number;
  total_net_worth: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  cash_balance: number;
  portfolio_value: number;
  total_net_worth: number;
  rank_position: number;
}

// Buy stock with enhanced tracking
export const buyStockWithTracking = async (
  userId: string, 
  symbol: string, 
  quantity: number, 
  pricePerShare: number
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('handle_stock_purchase_with_tracking', {
      p_user_id: userId,
      p_stock_symbol: symbol,
      p_qty: quantity,
      p_price_per_share: pricePerShare
    });

    if (error) throw error;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to buy stock');
  }
};

// Sell stock with enhanced tracking
export const sellStockWithTracking = async (
  userId: string, 
  symbol: string, 
  quantity: number, 
  pricePerShare: number
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('handle_stock_sale_with_tracking', {
      p_user_id: userId,
      p_stock_symbol: symbol,
      p_qty: quantity,
      p_price_per_share: pricePerShare
    });

    if (error) throw error;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to sell stock');
  }
};

// Get user's portfolio value
export const getUserPortfolioValue = async (userId: string): Promise<PortfolioValue> => {
  try {
    const { data, error } = await supabase.rpc('calculate_user_portfolio_value', {
      p_user_id: userId
    });

    if (error) throw error;
    
    return data[0] || {
      total_portfolio_value: 0,
      total_invested: 0,
      cash_balance: 0,
      total_net_worth: 0
    };
  } catch (error) {
    console.error('Error getting portfolio value:', error);
    return {
      total_portfolio_value: 0,
      total_invested: 0,
      cash_balance: 0,
      total_net_worth: 0
    };
  }
};

// Get leaderboard with portfolio values
export const getLeaderboardWithPortfolioValues = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard_with_portfolio_values');

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

// Get user's portfolio positions
export const getUserPortfolioPositions = async (userId: string): Promise<PortfolioPosition[]> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('user_id', userId)
      .gt('total_quantity', 0)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting portfolio positions:', error);
    return [];
  }
};

// Get user's transaction history
export const getUserTransactionHistory = async (
  userId: string, 
  limit: number = 50
): Promise<PortfolioTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

// Get portfolio summary for a user
export const getPortfolioSummary = async (userId: string) => {
  try {
    const [portfolioValue, positions, recentTransactions] = await Promise.all([
      getUserPortfolioValue(userId),
      getUserPortfolioPositions(userId),
      getUserTransactionHistory(userId, 10)
    ]);

    return {
      portfolioValue,
      positions,
      recentTransactions,
      totalPositions: positions.length,
      diversificationScore: Math.min(positions.length * 10, 100) // Simple diversification metric
    };
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    throw error;
  }
};

// Validate transaction inputs
export const validateTransaction = (
  quantity: number, 
  pricePerShare: number
): { isValid: boolean; error?: string } => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { isValid: false, error: 'Quantity must be a positive integer' };
  }

  if (typeof pricePerShare !== 'number' || pricePerShare <= 0) {
    return { isValid: false, error: 'Price per share must be a positive number' };
  }

  if (pricePerShare > 1000000) {
    return { isValid: false, error: 'Price per share seems unreasonably high' };
  }

  return { isValid: true };
};

// Calculate portfolio performance metrics
export const calculatePortfolioMetrics = (positions: PortfolioPosition[]) => {
  if (positions.length === 0) {
    return {
      totalInvested: 0,
      totalValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      bestPerformer: null,
      worstPerformer: null
    };
  }

  const totalInvested = positions.reduce((sum, pos) => sum + pos.total_invested, 0);
  const totalValue = positions.reduce((sum, pos) => sum + pos.total_invested, 0); // Using cost basis as current value
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    bestPerformer: positions[0]?.stock_symbol || null,
    worstPerformer: positions[positions.length - 1]?.stock_symbol || null
  };
};