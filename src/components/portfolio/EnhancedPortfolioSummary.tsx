import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getUserPortfolioValue, getUserPortfolioPositions, PortfolioValue, PortfolioPosition } from '../../lib/portfolioTracking';
import { cn } from '../../lib/utils';

const EnhancedPortfolioSummary: React.FC = () => {
  const { profile } = useUser();
  const [portfolioValue, setPortfolioValue] = useState<PortfolioValue | null>(null);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolioData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const [valueData, positionsData] = await Promise.all([
        getUserPortfolioValue(profile.id),
        getUserPortfolioPositions(profile.id)
      ]);
      
      setPortfolioValue(valueData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolioData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-2">Loading portfolio...</p>
      </div>
    );
  }

  if (!portfolioValue || positions.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No portfolio data available</p>
        <p className="text-sm mt-1">Start trading to see your portfolio breakdown</p>
      </div>
    );
  }

  // Calculate sector allocation based on positions
  const sectorAllocations = positions.reduce((acc, position) => {
    // Simple sector mapping - in production, you'd have a more comprehensive mapping
    const sector = getSector(position.stock_symbol);
    if (!acc[sector]) {
      acc[sector] = {
        name: sector,
        value: 0,
        allocation: 0,
        positions: 0
      };
    }
    acc[sector].value += position.total_invested;
    acc[sector].positions += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; allocation: number; positions: number }>);

  // Calculate allocation percentages
  Object.values(sectorAllocations).forEach(sector => {
    sector.allocation = portfolioValue.total_portfolio_value > 0 
      ? (sector.value / portfolioValue.total_portfolio_value) * 100 
      : 0;
  });

  const sortedSectors = Object.values(sectorAllocations)
    .sort((a, b) => b.allocation - a.allocation);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Portfolio Value</p>
              <p className="text-xl font-bold">${portfolioValue.total_portfolio_value.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success-500" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Cash Balance</p>
              <p className="text-xl font-bold">${portfolioValue.cash_balance.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Net Worth</p>
              <p className="text-xl font-bold">${portfolioValue.total_net_worth.toLocaleString()}</p>
            </div>
            <PieChart className="w-8 h-8 text-accent-500" />
          </div>
        </div>
      </div>

      {/* Sector Allocation */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sector Allocation</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors disabled:opacity-50"
            title="Refresh portfolio"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
        </div>
        
        <div className="space-y-4">
          {sortedSectors.map((sector) => (
            <div key={sector.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{sector.name}</p>
                  <p className="text-xs text-gray-400">{sector.positions} position{sector.positions !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{sector.allocation.toFixed(1)}%</p>
                  <p className="text-xs text-gray-400">${sector.value.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-300"
                  style={{ width: `${sector.allocation}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Holdings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Top Holdings</h3>
        <div className="space-y-3">
          {positions.slice(0, 5).map((position) => (
            <div key={position.id} className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
              <div>
                <p className="font-medium">{position.stock_symbol}</p>
                <p className="text-sm text-gray-400">{position.total_quantity} shares</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${position.total_invested.toLocaleString()}</p>
                <p className="text-sm text-gray-400">
                  Avg: ${position.average_cost_basis.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">{positions.length}</p>
          <p className="text-sm text-gray-400">Holdings</p>
        </div>
        
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">{sortedSectors.length}</p>
          <p className="text-sm text-gray-400">Sectors</p>
        </div>
        
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">
            {portfolioValue.total_portfolio_value > 0 
              ? ((portfolioValue.cash_balance / portfolioValue.total_net_worth) * 100).toFixed(0)
              : 0}%
          </p>
          <p className="text-sm text-gray-400">Cash</p>
        </div>
        
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">
            {Math.min(positions.length * 10, 100)}
          </p>
          <p className="text-sm text-gray-400">Diversity Score</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to map stock symbols to sectors
const getSector = (symbol: string): string => {
  const sectorMap: { [key: string]: string } = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOGL': 'Technology',
    'META': 'Technology',
    'NVDA': 'Technology',
    'AMZN': 'Consumer Cyclical',
    'TSLA': 'Automotive',
    'JPM': 'Financial Services',
    'BAC': 'Financial Services',
    'V': 'Financial Services',
    'MA': 'Financial Services',
    'XOM': 'Energy',
    'CVX': 'Energy',
    'JNJ': 'Healthcare',
    'PFE': 'Healthcare',
    'UNH': 'Healthcare',
    'PG': 'Consumer Defensive',
    'KO': 'Consumer Defensive',
    'WMT': 'Consumer Defensive',
  };
  return sectorMap[symbol] || 'Other';
};

export default EnhancedPortfolioSummary;