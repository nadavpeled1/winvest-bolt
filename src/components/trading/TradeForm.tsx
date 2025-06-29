import React, { useState } from 'react';
import { Search, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { getStockPrice, buyStock, sellStock, StockData } from '../../lib/marketstack';
import { searchStocks } from '../../lib/ninjaApi';
import { cn } from '../../lib/utils';

const TradeForm: React.FC = () => {
  const { user } = useAuth();
  const { profile, holdings, fetchUserData } = useUser();
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');

  const handleSearch = async (searchTerm?: string) => {
    const searchSymbol = searchTerm || symbol;
    if (!searchSymbol) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await getStockPrice(searchSymbol.toUpperCase());
      setStockData(data);
      setShowSearchResults(false);
    } catch (err) {
      setError('Stock not found or API error');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolChange = async (value: string) => {
    setSymbol(value);
    setStockData(null);
    
    if (value.length >= 2) {
      setSearching(true);
      try {
        const results = await searchStocks(value);
        setSearchResults(results);
        setShowSearchResults(results.length > 0);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const selectStock = (stock: StockData) => {
    setSymbol(stock.symbol);
    setStockData(stock);
    setShowSearchResults(false);
  };

  const handleTrade = async () => {
    if (!user || !stockData || !profile) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'buy') {
        await buyStock(user.id, stockData.symbol, quantity);
      } else {
        await sellStock(user.id, stockData.symbol, quantity);
      }
      
      await fetchUserData();
      setSymbol('');
      setQuantity(1);
      setStockData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  const currentHolding = holdings.find(h => h.stock_symbol === stockData?.symbol);
  const maxSellQuantity = currentHolding?.amount || 0;
  const totalCost = stockData ? stockData.price * quantity : 0;
  const canAfford = profile ? profile.cash >= totalCost : false;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Trade Stocks</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('buy')}
            className={`px-3 py-1 rounded-lg text-sm ${
              mode === 'buy'
                ? 'bg-success-600 text-white'
                : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setMode('sell')}
            className={`px-3 py-1 rounded-lg text-sm ${
              mode === 'sell'
                ? 'bg-error-600 text-white'
                : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Stock Symbol</label>
          <div className="relative">
            <input
              type="text"
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value.toUpperCase())}
              className="input pl-10 pr-20"
              placeholder="e.g., AAPL"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            {searching && (
              <Loader2 className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin\" size={16} />
            )}
            <button
              onClick={() => handleSearch()}
              disabled={!symbol || loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            >
              Search
            </button>
          </div>
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-dark-200 border border-dark-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => selectStock(stock)}
                  className="w-full px-4 py-3 text-left hover:bg-dark-300 border-b border-dark-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{stock.symbol}</p>
                      <p className="text-sm text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${stock.price.toFixed(2)}</p>
                      {stock.changePercent !== undefined && (
                        <p className={cn(
                          "text-xs flex items-center",
                          stock.changePercent >= 0 ? "text-success-500" : "text-error-500"
                        )}>
                          {stock.changePercent >= 0 ? (
                            <TrendingUp size={12} className="mr-1" />
                          ) : (
                            <TrendingDown size={12} className="mr-1" />
                          )}
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {stockData && (
          <>
            <div className="p-4 bg-dark-300 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{stockData.symbol}</h3>
                  {stockData.name && (
                    <p className="text-sm text-gray-400">{stockData.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="font-medium">${stockData.price.toFixed(2)}</p>
                  {stockData.changePercent !== undefined && (
                    <p className={cn(
                      "text-xs flex items-center justify-end mt-1",
                      stockData.changePercent >= 0 ? "text-success-500" : "text-error-500"
                    )}>
                      {stockData.changePercent >= 0 ? (
                        <TrendingUp size={12} className="mr-1" />
                      ) : (
                        <TrendingDown size={12} className="mr-1" />
                      )}
                      {stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
              {mode === 'sell' && currentHolding && (
                <div className="mt-2 text-sm text-gray-400">
                  You own: {currentHolding.amount} shares
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max={mode === 'sell' ? maxSellQuantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="input"
              />
              {mode === 'sell' && (
                <p className="text-xs text-gray-400 mt-1">
                  Maximum: {maxSellQuantity} shares
                </p>
              )}
            </div>

            <div className="p-4 bg-dark-300 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Value</span>
                <span className="font-medium">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              {mode === 'buy' && (
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-400">Available Cash</span>
                  <span className={cn(
                    "text-gray-400",
                    !canAfford && "text-error-500"
                  )}>
                    ${profile?.cash.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleTrade}
              disabled={
                loading || 
                (mode === 'sell' && quantity > maxSellQuantity) ||
                (mode === 'buy' && !canAfford)
              }
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                mode === 'buy'
                  ? 'bg-success-600 hover:bg-success-700'
                  : 'bg-error-600 hover:bg-error-700'
              } text-white disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                `${mode === 'buy' ? 'Buy' : 'Sell'} ${quantity} ${stockData.symbol}`
              )}
            </button>
          </>
        )}

        {error && (
          <div className="p-3 bg-error-900/50 border border-error-800 rounded-lg text-error-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeForm;