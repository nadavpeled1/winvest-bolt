import React from 'react';
import { ArrowUp, ArrowDown, Loader2, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface LeaderboardEntry {
  id: string;
  username: string;
  totalValue: number;
  cash: number;
  stockValue: number;
  rank: number;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  limit?: number;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entries, loading = false, limit = 5 }) => {
  const { user } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No leaderboard data available</p>
      </div>
    );
  }
  
  const displayEntries = entries.slice(0, limit);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    }
  };
  
  return (
    <div className="space-y-3">
      {displayEntries.map((entry, index) => {
        const isUser = entry.id === user?.id;
        
        return (
          <div 
            key={entry.id}
            className={cn(
              "flex items-center p-3 rounded-lg transition-all",
              isUser ? "bg-primary-900/40 border border-primary-800" : "bg-dark-300",
              "hover:bg-dark-200 cursor-pointer animate-slide-up"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-center w-8 h-8 mr-3">
              {getRankIcon(entry.rank)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.username}`}
                  alt={entry.username}
                  className={cn(
                    "w-8 h-8 rounded-full object-cover",
                    isUser && "border-2 border-primary-500"
                  )}
                />
                <div className="ml-2">
                  <p className="text-sm font-medium flex items-center">
                    {entry.username}
                    {isUser && (
                      <span className="ml-2 text-xs bg-primary-900 text-primary-400 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    Cash: ${entry.cash.toLocaleString()} | Stocks: ${entry.stockValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold text-success-500">
                ${entry.totalValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Total Value</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaderboardCard;