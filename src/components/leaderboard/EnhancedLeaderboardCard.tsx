import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, RefreshCw, Crown, Medal, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getLeaderboardWithPortfolioValues, LeaderboardEntry } from '../../lib/portfolioTracking';
import { cn } from '../../lib/utils';

interface EnhancedLeaderboardCardProps {
  limit?: number;
  showRefresh?: boolean;
  autoRefresh?: boolean;
}

const EnhancedLeaderboardCard: React.FC<EnhancedLeaderboardCardProps> = ({ 
  limit = 10, 
  showRefresh = true,
  autoRefresh = false 
}) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboardWithPortfolioValues();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No leaderboard data available</p>
      </div>
    );
  }
  
  const displayEntries = leaderboard.slice(0, limit);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-500 to-gray-400 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-700 to-amber-600 text-white';
    return 'bg-dark-300 text-gray-400';
  };
  
  return (
    <div className="space-y-4">
      {showRefresh && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Leaderboard</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors disabled:opacity-50"
            title="Refresh leaderboard"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
        </div>
      )}

      <div className="space-y-3">
        {displayEntries.map((entry, index) => {
          const isUser = entry.user_id === user?.id;
          const rank = entry.rank_position;
          
          return (
            <div 
              key={entry.user_id}
              className={cn(
                "flex items-center p-4 rounded-lg transition-all duration-300 hover:scale-[1.02]",
                isUser 
                  ? "bg-gradient-to-r from-primary-900/40 to-primary-800/40 border border-primary-700 shadow-lg" 
                  : "bg-dark-300 hover:bg-dark-200",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Rank */}
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full mr-4",
                getRankBadge(rank)
              )}>
                {getRankIcon(rank)}
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center">
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.username}`}
                    alt={entry.username}
                    className={cn(
                      "w-10 h-10 rounded-full object-cover mr-3",
                      isUser && "border-2 border-primary-500"
                    )}
                  />
                  <div>
                    <p className="font-medium flex items-center">
                      {entry.username}
                      {isUser && (
                        <span className="ml-2 text-xs bg-primary-900 text-primary-400 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      {rank <= 3 && (
                        <span className="ml-2 text-xs bg-accent-900 text-accent-400 px-2 py-0.5 rounded-full">
                          Top {rank}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 space-x-4">
                      <span>Cash: ${entry.cash_balance.toLocaleString()}</span>
                      <span>Portfolio: ${entry.portfolio_value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Total Value */}
              <div className="text-right">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                  <p className="text-lg font-bold text-success-500">
                    ${entry.total_net_worth.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-400">Total Net Worth</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-100">
        <div className="text-center">
          <p className="text-lg font-bold">{leaderboard.length}</p>
          <p className="text-xs text-gray-400">Total Players</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">
            ${Math.round(leaderboard.reduce((sum, entry) => sum + entry.total_net_worth, 0) / leaderboard.length).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Avg Net Worth</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">
            ${leaderboard[0]?.total_net_worth.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-gray-400">Top Player</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLeaderboardCard;