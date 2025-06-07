import { supabase } from './supabase';
import { buyStockWithTracking, sellStockWithTracking, validateTransaction } from './portfolioTracking';
import { getStockPrice as getNinjaStockPrice, getCachedStockPrice } from './ninjaApi';

export interface StockData {
  symbol: string;
  price: number;
  name?: string;
  change?: number;
  changePercent?: number;
}

export const getStockPrice = async (symbol: string): Promise<StockData> => {
  try {
    // Use Ninja API for live stock data
    const data = await getCachedStockPrice(symbol);
    return data;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    throw new Error(`Failed to fetch stock price for ${symbol}`);
  }
};

export const buyStockEnhanced = async (
  userId: string, 
  symbol: string, 
  quantity: number
): Promise<void> => {
  try {
    // Get current stock price
    const stockData = await getStockPrice(symbol);
    
    // Validate transaction
    const validation = validateTransaction(quantity, stockData.price);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Execute purchase with tracking
    await buyStockWithTracking(userId, symbol, quantity, stockData.price);
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to buy stock');
  }
};

export const sellStockEnhanced = async (
  userId: string, 
  symbol: string, 
  quantity: number
): Promise<void> => {
  try {
    // Get current stock price
    const stockData = await getStockPrice(symbol);
    
    // Validate transaction
    const validation = validateTransaction(quantity, stockData.price);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Execute sale with tracking
    await sellStockWithTracking(userId, symbol, quantity, stockData.price);
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to sell stock');
  }
};

// Calculate portfolio value using stored purchase prices (no external API needed)
export const calculatePortfolioValueFromStored = async (
  holdings: Array<{ stock_symbol: string; amount: number }>
): Promise<number> => {
  try {
    // This function now uses stored cost basis instead of live prices
    // The portfolio value is calculated from the total_invested in portfolio_positions
    return 0; // This will be handled by the new portfolio tracking system
  } catch (error) {
    console.error('Error calculating portfolio value:', error);
    return 0;
  }
};

// Get detailed holdings with cost basis information
export const getHoldingsWithCostBasis = async (
  userId: string
): Promise<Array<{
  id: string;
  stock_symbol: string;
  total_quantity: number;
  average_cost_basis: number;
  total_invested: number;
  current_value: number;
  name: string;
  unrealized_gain_loss: number;
  unrealized_gain_loss_percent: number;
}>> => {
  try {
    const { data: positions, error } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('user_id', userId)
      .gt('total_quantity', 0);

    if (error) throw error;

    if (!positions || positions.length === 0) {
      return [];
    }

    // For now, we'll use the cost basis as current value since we're not using live prices
    // In a real implementation, you might want to fetch current prices and calculate gains/losses
    const holdingsWithDetails = positions.map(position => ({
      id: position.id,
      stock_symbol: position.stock_symbol,
      total_quantity: position.total_quantity,
      average_cost_basis: position.average_cost_basis,
      total_invested: position.total_invested,
      current_value: position.total_invested, // Using cost basis as current value
      name: `${position.stock_symbol} Inc.`,
      unrealized_gain_loss: 0, // No gain/loss when using cost basis
      unrealized_gain_loss_percent: 0
    }));

    return holdingsWithDetails;
  } catch (error) {
    console.error('Error getting holdings with cost basis:', error);
    return [];
  }
};

// Legacy compatibility functions
export const buyStock = buyStockEnhanced;
export const sellStock = sellStockEnhanced;
export const calculatePortfolioValue = calculatePortfolioValueFromStored;
export const getHoldingsWithPrices = getHoldingsWithCostBasis;