import { supabase } from './supabase';

const API_KEY = import.meta.env.VITE_MARKETSTACK_API_KEY;
const BASE_URL = 'http://api.marketstack.com/v1';

export interface StockData {
  symbol: string;
  price: number;
  name?: string;
}

export const getStockPrice = async (symbol: string): Promise<StockData> => {
  try {
    // For demo purposes, return mock data
    // In production, you would use the actual API
    const mockPrices: { [key: string]: number } = {
      'AAPL': 182.63,
      'MSFT': 336.82,
      'AMZN': 178.15,
      'TSLA': 248.50,
      'NVDA': 924.79,
      'GOOGL': 142.56,
      'META': 298.73,
    };

    const price = mockPrices[symbol] || Math.random() * 200 + 50;

    return {
      symbol,
      price,
      name: `${symbol} Inc.`
    };
  } catch (error) {
    throw new Error('Failed to fetch stock price');
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