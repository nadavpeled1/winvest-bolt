import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Filter, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import StockChart from '../components/charts/StockChart';

const PortfolioPage: React.FC = () => {
  const [view, setView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const portfolioValue = 127463;
  const portfolioChange = 2.3;
  
  const stocks = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      shares: 15, 
      price: 182.63, 
      change: 1.25, 
      value: 2739.45,
      sector: 'Technology'
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corporation', 
      shares: 10, 
      price: 336.82, 
      change: 2.47, 
      value: 3368.20,
      sector: 'Technology'
    },
    { 
      symbol: 'AMZN', 
      name: 'Amazon.com Inc.', 
      shares: 12, 
      price: 178.15, 
      change: -0.83, 
      value: 2137.80,
      sector: 'Consumer Cyclical'
    },
    { 
      symbol: 'TSLA', 
      name: 'Tesla, Inc.', 
      shares: 8, 
      price: 248.50, 
      change: -1.36, 
      value: 1988.00,
      sector: 'Automotive'
    },
    { 
      symbol: 'NVDA', 
      name: 'NVIDIA Corporation', 
      shares: 5, 
      price: 924.79, 
      change: 3.42, 
      value: 4623.95,
      sector: 'Technology'
    },
    { 
      symbol: 'JPM', 
      name: 'JPMorgan Chase & Co.', 
      shares: 20, 
      price: 183.38, 
      change: 0.87, 
      value: 3667.60,
      sector: 'Financial Services'
    },
    { 
      symbol: 'XOM', 
      name: 'Exxon Mobil Corporation', 
      shares: 25, 
      price: 112.85, 
      change: -0.63, 
      value: 2821.25,
      sector: 'Energy'
    },
  ];
  
  const filteredStocks = stocks.filter((stock) => {
    if (searchQuery) {
      return (
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (view === 'all') return true;
    if (view === 'gainers') return stock.change > 0;
    if (view === 'losers') return stock.change < 0;
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Portfolio</h1>
          <div className="mt-1 flex items-center">
            <p className="text-lg font-semibold mr-3">
              ${portfolioValue.toLocaleString()}
            </p>
            <div className={cn(
              "flex items-center text-sm",
              portfolioChange > 0 ? "text-success-500" : "text-error-500"
            )}>
              {portfolioChange > 0 ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              {portfolioChange > 0 ? '+' : ''}{portfolioChange}% today
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 space-x-2">
          <button className="btn-primary">
            Trade Stocks
          </button>
          <button className="btn-outline">
            Deposit Funds
          </button>
        </div>
      </div>
      
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Performance</h2>
          <select className="text-xs bg-dark-100 border border-dark-100 rounded-md px-2 py-1">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div className="h-64">
          <StockChart />
        </div>
      </div>
      
      <div className="card overflow-hidden">
        <div className="p-4 bg-dark-300 border-b border-dark-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Holdings</h2>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2 md:mt-0">
              <div className="flex">
                <button 
                  onClick={() => setView('all')} 
                  className={cn(
                    "px-3 py-1 text-sm rounded-l-lg",
                    view === 'all' 
                      ? "bg-primary-700 text-white" 
                      : "bg-dark-200 text-gray-400 hover:bg-dark-100"
                  )}
                >
                  All
                </button>
                <button 
                  onClick={() => setView('gainers')} 
                  className={cn(
                    "px-3 py-1 text-sm",
                    view === 'gainers' 
                      ? "bg-success-700 text-white" 
                      : "bg-dark-200 text-gray-400 hover:bg-dark-100"
                  )}
                >
                  Gainers
                </button>
                <button 
                  onClick={() => setView('losers')} 
                  className={cn(
                    "px-3 py-1 text-sm rounded-r-lg",
                    view === 'losers' 
                      ? "bg-error-700 text-white" 
                      : "bg-dark-200 text-gray-400 hover:bg-dark-100"
                  )}
                >
                  Losers
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks..."
                  className="input pl-9 py-1 text-sm"
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-300">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {filteredStocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-dark-300 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-gray-400">{stock.sector}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">{stock.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">{stock.shares}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">${stock.price.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={cn(
                      "text-sm flex items-center",
                      stock.change > 0 ? "text-success-500" : "text-error-500"
                    )}>
                      {stock.change > 0 ? (
                        <TrendingUp size={16} className="mr-1" />
                      ) : (
                        <TrendingDown size={16} className="mr-1" />
                      )}
                      {stock.change > 0 ? '+' : ''}{stock.change}%
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">${stock.value.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button className="text-primary-500 hover:text-primary-400 px-2 py-1 text-sm">
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-success-900 flex items-center justify-center text-success-500 mr-3">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Bought 5 NVDA</p>
                  <p className="text-xs text-gray-400">Jun 10, 2023</p>
                </div>
              </div>
              <p className="text-sm font-medium">$4,623.95</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-error-900 flex items-center justify-center text-error-500 mr-3">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Sold 10 TSLA</p>
                  <p className="text-xs text-gray-400">Jun 5, 2023</p>
                </div>
              </div>
              <p className="text-sm font-medium">$2,485.00</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-success-900 flex items-center justify-center text-success-500 mr-3">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Bought 20 JPM</p>
                  <p className="text-xs text-gray-400">Jun 3, 2023</p>
                </div>
              </div>
              <p className="text-sm font-medium">$3,667.60</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-4">Recommended Trades</h2>
          <div className="space-y-4">
            <div className="p-3 bg-dark-300 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium flex items-center">
                    Buy NVDA
                    <span className="ml-2 badge-success">Strong Buy</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Analyst consensus: Outperform
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$924.79</p>
                  <p className="text-xs text-success-500">+3.42% today</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="text-xs px-2 py-1 bg-dark-200 text-gray-300 rounded-md hover:bg-dark-100 transition-colors">
                  View Analysis <ArrowRight size={12} className="inline ml-1" />
                </button>
              </div>
            </div>
            
            <div className="p-3 bg-dark-300 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium flex items-center">
                    Sell AMZN
                    <span className="ml-2 badge-warning">Consider Sell</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Technical indicator: Resistance level reached
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$178.15</p>
                  <p className="text-xs text-error-500">-0.83% today</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="text-xs px-2 py-1 bg-dark-200 text-gray-300 rounded-md hover:bg-dark-100 transition-colors">
                  View Analysis <ArrowRight size={12} className="inline ml-1" />
                </button>
              </div>
            </div>
            
            <div className="p-3 bg-dark-300 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium flex items-center">
                    Buy XOM
                    <span className="ml-2 badge-success">Energy Sector Pick</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Dividend yield: 3.2%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$112.85</p>
                  <p className="text-xs text-error-500">-0.63% today</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="text-xs px-2 py-1 bg-dark-200 text-gray-300 rounded-md hover:bg-dark-100 transition-colors">
                  View Analysis <ArrowRight size={12} className="inline ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;