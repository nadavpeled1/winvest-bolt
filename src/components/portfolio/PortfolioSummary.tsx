import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';

interface SectorAllocation {
  name: string;
  allocation: number;
  value: number;
  change: number;
}

const PortfolioSummary: React.FC = () => {
  const { holdingsWithPrices, portfolioValue, refreshPrices } = useUser();
  const [sectorAllocations, setSectorAllocations] = useState<SectorAllocation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Map stock symbols to sectors (simplified mapping)
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

  useEffect(() => {
    if (holdingsWithPrices.length > 0 && portfolioValue > 0) {
      // Group holdings by sector
      const sectorMap = new Map<string, { value: number; change: number }>();
      
      holdingsWithPrices.forEach(holding => {
        const sector = getSector(holding.stock_symbol);
        const existing = sectorMap.get(sector) || { value: 0, change: 0 };
        
        sectorMap.set(sector, {
          value: existing.value + holding.current_value,
          change: existing.change + (holding.changePercent || 0) * (holding.current_value / portfolioValue)
        });
      });

      // Convert to array and calculate allocations
      const sectors: SectorAllocation[] = Array.from(sectorMap.entries()).map(([name, data]) => ({
        name,
        allocation: (data.value / portfolioValue) * 100,
        value: data.value,
        change: data.change
      })).sort((a, b) => b.allocation - a.allocation);

      setSectorAllocations(sectors);
    } else {
      setSectorAllocations([]);
    }
  }, [holdingsWithPrices, portfolioValue]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPrices();
    setRefreshing(false);
  };

  if (sectorAllocations.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No portfolio data available</p>
        <p className="text-sm mt-1">Start trading to see your portfolio breakdown</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">Sector Allocation</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 rounded hover:bg-dark-300 transition-colors disabled:opacity-50"
          title="Refresh prices"
        >
          <RefreshCw className={cn("w-4 h-4 text-gray-400", refreshing && "animate-spin")} />
        </button>
      </div>
      
      {sectorAllocations.map((sector) => (
        <div key={sector.name} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">{sector.name}</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">{sector.allocation.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">${sector.value.toFixed(0)}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  sector.change > 0 ? "bg-success-500" : "bg-error-500"
                )}
                style={{ width: `${sector.allocation}%` }}
              ></div>
            </div>
          </div>
          
          <div className={cn(
            "ml-4 flex items-center text-sm",
            sector.change > 0 ? "text-success-500" : "text-error-500"
          )}>
            {sector.change > 0 ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span className="ml-1">{Math.abs(sector.change).toFixed(1)}%</span>
          </div>
        </div>
      ))}
      
      <div className="pt-2 border-t border-dark-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Total Portfolio Value</span>
          <span className="font-medium">${portfolioValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;