import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const PortfolioSummary: React.FC = () => {
  const portfolioSectors = [
    { name: 'Technology', allocation: 32, change: 2.4 },
    { name: 'Energy', allocation: 24, change: -1.2 },
    { name: 'Healthcare', allocation: 18, change: 0.8 },
    { name: 'Finance', allocation: 14, change: 1.5 },
    { name: 'Consumer', allocation: 12, change: -0.5 },
  ];
  
  return (
    <div className="space-y-3">
      {portfolioSectors.map((sector) => (
        <div key={sector.name} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">{sector.name}</p>
              <p className="text-sm font-medium">{sector.allocation}%</p>
            </div>
            <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
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
            <span className="ml-1">{Math.abs(sector.change)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioSummary;