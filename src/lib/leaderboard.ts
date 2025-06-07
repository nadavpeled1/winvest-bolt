import { supabase } from './supabase';
import { getCachedStockPrice } from './ninjaApi';

export interface LeaderboardEntry {
  id: string;
  username: string;
  cash: number;
  stockValue: number;
  totalValue: number;
  rank: number;
  lastUpdated: string;
}

export interface StockPriceCache {
  symbol: string;
  price: number;
  lastUpdated: string;
}

// Cache stock prices for 24 hours to minimize API calls
const STOCK_PRICE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const UPDATE_COOLDOWN = 60 * 60 * 1000; // 1 hour cooldown

let lastUpdateTime = 0;

export const canUpdatePrices = (): boolean => {
  return Date.now() - lastUpdateTime > UPDATE_COOLDOWN;
};

export const getTimeUntilNextUpdate = (): number => {
  const timeLeft = UPDATE_COOLDOWN - (Date.now() - lastUpdateTime);
  return Math.max(0, timeLeft);
};

export const updateStockPricesCache = async (): Promise<void> => {
  if (!canUpdatePrices()) {
    throw new Error('Update cooldown active. Please wait before updating again.');
  }

  try {
    // Get all unique stock symbols from holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('stock_symbol')
      .gt('amount', 0);

    if (holdingsError) throw holdingsError;

    const uniqueSymbols = [...new Set(holdings?.map(h => h.stock_symbol) || [])];

    if (uniqueSymbols.length === 0) {
      return;
    }

    // Fetch current prices for all symbols
    const priceUpdates = await Promise.allSettled(
      uniqueSymbols.map(async (symbol) => {
        try {
          const stockData = await getCachedStockPrice(symbol);
          return {
            symbol,
            price: stockData.price,
            lastUpdated: new Date().toISOString()
          };
        } catch (error) {
          console.warn(`Failed to update price for ${symbol}:`, error);
          return null;
        }
      })
    );

    const successfulUpdates = priceUpdates
      .filter((result): result is PromiseFulfilledResult<StockPriceCache | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    // Store updated prices in database
    if (successfulUpdates.length > 0) {
      const { error: upsertError } = await supabase
        .from('stock_price_cache')
        .upsert(successfulUpdates, { onConflict: 'symbol' });

      if (upsertError) throw upsertError;
    }

    lastUpdateTime = Date.now();
  } catch (error) {
    console.error('Error updating stock prices cache:', error);
    throw error;
  }
};

export const calculateUserPortfolioValue = async (userId: string): Promise<{ stockValue: number; totalValue: number; cash: number }> => {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('cash')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get user holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('stock_symbol, amount')
      .eq('user_id', userId)
      .gt('amount', 0);

    if (holdingsError) throw holdingsError;

    if (!holdings || holdings.length === 0) {
      return {
        stockValue: 0,
        totalValue: profile.cash,
        cash: profile.cash
      };
    }

    // Get cached stock prices
    const symbols = holdings.map(h => h.stock_symbol);
    const { data: cachedPrices, error: pricesError } = await supabase
      .from('stock_price_cache')
      .select('symbol, price')
      .in('symbol', symbols);

    if (pricesError) throw pricesError;

    // Calculate stock value
    let stockValue = 0;
    holdings.forEach(holding => {
      const cachedPrice = cachedPrices?.find(p => p.symbol === holding.stock_symbol);
      if (cachedPrice) {
        stockValue += holding.amount * cachedPrice.price;
      }
    });

    return {
      stockValue,
      totalValue: profile.cash + stockValue,
      cash: profile.cash
    };
  } catch (error) {
    console.error(`Error calculating portfolio value for user ${userId}:`, error);
    return { stockValue: 0, totalValue: 0, cash: 0 };
  }
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, cash');

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // Calculate portfolio values for all users
    const leaderboardData = await Promise.all(
      profiles.map(async (profile) => {
        const { stockValue, totalValue } = await calculateUserPortfolioValue(profile.id);
        return {
          id: profile.id,
          username: profile.username,
          cash: profile.cash,
          stockValue,
          totalValue,
          rank: 0, // Will be set after sorting
          lastUpdated: new Date().toISOString()
        };
      })
    );

    // Sort by total value and assign ranks
    leaderboardData.sort((a, b) => b.totalValue - a.totalValue);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardData;
  } catch (error) {
    console.error('Error generating leaderboard:', error);
    throw error;
  }
};

export const getLastPriceUpdateTime = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('stock_price_cache')
      .select('lastUpdated')
      .order('lastUpdated', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data.lastUpdated;
  } catch (error) {
    console.error('Error getting last price update time:', error);
    return null;
  }
};