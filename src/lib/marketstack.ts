import { supabase } from './supabase';
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

export const buyStock = async (userId: string, symbol: string, quantity: number): Promise<void> => {
  try {
    const stockData = await getStockPrice(symbol);
    const totalCost = stockData.price * quantity;

    const { error } = await supabase.rpc('handle_stock_purchase', {
      p_user_id: userId,
      p_stock_symbol: symbol,
      p_qty: quantity,
      p_cost: totalCost
    });

    if (error) throw error;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to buy stock');
  }
};

export const sellStock = async (userId: string, symbol: string, quantity: number): Promise<void> => {
  try {
    const stockData = await getStockPrice(symbol);
    const totalValue = stockData.price * quantity;

    const { error } = await supabase.rpc('handle_stock_sale', {
      p_user_id: userId,
      p_stock_symbol: symbol,
      p_qty: quantity,
      p_value: totalValue
    });

    if (error) throw error;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to sell stock');
  }
};

// Get current portfolio value based on live stock prices
export const calculatePortfolioValue = async (holdings: Array<{ stock_symbol: string; amount: number }>): Promise<number> => {
  try {
    let totalValue = 0;
    
    for (const holding of holdings) {
      try {
        const stockData = await getCachedStockPrice(holding.stock_symbol);
        totalValue += stockData.price * holding.amount;
      } catch (error) {
        console.warn(`Failed to get price for ${holding.stock_symbol}:`, error);
        // Continue with other holdings even if one fails
      }
    }
    
    return totalValue;
  } catch (error) {
    console.error('Error calculating portfolio value:', error);
    return 0;
  }
};

// Get detailed holdings with current prices
export const getHoldingsWithPrices = async (holdings: Array<{ id: string; stock_symbol: string; amount: number }>): Promise<Array<{
  id: string;
  stock_symbol: string;
  amount: number;
  current_price: number;
  current_value: number;
  name: string;
  change?: number;
  changePercent?: number;
}>> => {
  try {
    const holdingsWithPrices = await Promise.allSettled(
      holdings.map(async (holding) => {
        try {
          const stockData = await getCachedStockPrice(holding.stock_symbol);
          return {
            ...holding,
            current_price: stockData.price,
            current_value: stockData.price * holding.amount,
            name: stockData.name || `${holding.stock_symbol} Inc.`,
            change: stockData.change,
            changePercent: stockData.changePercent,
          };
        } catch (error) {
          console.warn(`Failed to get price for ${holding.stock_symbol}:`, error);
          return {
            ...holding,
            current_price: 0,
            current_value: 0,
            name: `${holding.stock_symbol} Inc.`,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    return holdingsWithPrices
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    console.error('Error getting holdings with prices:', error);
    return [];
  }
};