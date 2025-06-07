const NINJA_API_KEY = 'DZJ+mU9/YR2jagUyLIaNIQ==Ul4nHpCfV0yOh0tC';
const NINJA_API_BASE_URL = 'https://api.api-ninjas.com/v1';

export interface NinjaStockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change?: number;
  changePercent?: number;
}

export const getStockPrice = async (symbol: string): Promise<StockData> => {
  try {
    const response = await fetch(`${NINJA_API_BASE_URL}/stockprice?ticker=${symbol}`, {
      headers: {
        'X-Api-Key': NINJA_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: NinjaStockData = await response.json();

    if (!data || !data.ticker) {
      throw new Error('Invalid stock symbol or no data available');
    }

    return {
      symbol: data.ticker,
      name: data.name || `${data.ticker} Inc.`,
      price: data.price,
      change: data.change,
      changePercent: data.change_percent,
    };
  } catch (error) {
    console.error('Error fetching stock data from Ninja API:', error);
    throw new Error(`Failed to fetch stock price for ${symbol}`);
  }
};

export const getMultipleStockPrices = async (symbols: string[]): Promise<StockData[]> => {
  try {
    const promises = symbols.map(symbol => getStockPrice(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<StockData> => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    console.error('Error fetching multiple stock prices:', error);
    throw new Error('Failed to fetch stock prices');
  }
};

// Cache for stock prices to avoid excessive API calls
const stockPriceCache = new Map<string, { data: StockData; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

export const getCachedStockPrice = async (symbol: string): Promise<StockData> => {
  const cached = stockPriceCache.get(symbol);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const data = await getStockPrice(symbol);
  stockPriceCache.set(symbol, { data, timestamp: now });
  
  return data;
};

export const searchStocks = async (query: string): Promise<StockData[]> => {
  // For now, we'll search through common stock symbols
  // In a production app, you might want to use a different API endpoint for search
  const commonStocks = [
    'AAPL', 'MSFT', 'AMZN', 'TSLA', 'GOOGL', 'META', 'NVDA', 'NFLX', 
    'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'BAC',
    'ADBE', 'CRM', 'INTC', 'AMD', 'ORCL', 'IBM', 'CSCO', 'XOM', 'CVX'
  ];

  const matchingSymbols = commonStocks.filter(symbol => 
    symbol.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10); // Limit to 10 results

  if (matchingSymbols.length === 0) {
    return [];
  }

  try {
    return await getMultipleStockPrices(matchingSymbols);
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};