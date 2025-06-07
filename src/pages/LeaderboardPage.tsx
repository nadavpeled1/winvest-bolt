import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, RefreshCw, Clock, DollarSign, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getLeaderboard, 
  updateStockPricesCache, 
  canUpdatePrices, 
  getTimeUntilNextUpdate,
  getLastPriceUpdateTime,
  LeaderboardEntry 
} from '../lib/leaderboard';
import { cn } from '../lib/utils';

const LeaderboardPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard();
      setLeaderboard(data);
      
      const lastUpdate = await getLastPriceUpdateTime();
      setLastUpdateTime(lastUpdate);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrices = async () => {
    if (!canUpdatePrices()) {
      const timeLeft = getTimeUntilNextUpdate();
      const minutes = Math.ceil(timeLeft / (60 * 1000));
      alert(`Please wait ${minutes} minutes before updating prices again.`);
      return;
    }

    try {
      setUpdating(true);
      await updateStockPricesCache();
      await fetchLeaderboard();
    } catch (error) {
      console.error('Error updating prices:', error);
      alert('Failed to update stock prices. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Update cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = getTimeUntilNextUpdate();
      setCooldownTime(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCooldownTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-400 mt-1">Rankings based on total portfolio value</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4 md:mt-0">
          {lastUpdateTime && (
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              Last updated: {new Date(lastUpdateTime).toLocaleString()}
            </div>
          )}
          
          <button
            onClick={handleUpdatePrices}
            disabled={updating || cooldownTime > 0}
            className={cn(
              "flex items-center px-4 py-2 rounded-lg font-medium transition-colors",
              updating || cooldownTime > 0
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", updating && "animate-spin")} />
            {updating ? 'Updating...' : cooldownTime > 0 ? `Wait ${formatCooldownTime(cooldownTime)}` : 'Update Portfolio Values'}
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="card p-6 text-center order-1">
            <div className="flex justify-center mb-4">
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[1].username}`}
              alt={leaderboard[1].username}
              className="w-16 h-16 rounded-full mx-auto mb-3"
            />
            <h3 className="font-bold text-lg">{leaderboard[1].username}</h3>
            <p className="text-2xl font-bold text-gray-400 mt-2">${leaderboard[1].totalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">2nd Place</p>
          </div>

          {/* 1st Place */}
          <div className="card p-6 text-center order-2 border-2 border-yellow-500 bg-gradient-to-b from-yellow-900/20 to-transparent">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[0].username}`}
              alt={leaderboard[0].username}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-yellow-500"
            />
            <h3 className="font-bold text-xl">{leaderboard[0].username}</h3>
            <p className="text-3xl font-bold text-yellow-500 mt-2">${leaderboard[0].totalValue.toLocaleString()}</p>
            <p className="text-sm text-yellow-400">Champion</p>
          </div>

          {/* 3rd Place */}
          <div className="card p-6 text-center order-3">
            <div className="flex justify-center mb-4">
              <Trophy className="w-12 h-12 text-amber-700" />
            </div>
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[2].username}`}
              alt={leaderboard[2].username}
              className="w-16 h-16 rounded-full mx-auto mb-3"
            />
            <h3 className="font-bold text-lg">{leaderboard[2].username}</h3>
            <p className="text-2xl font-bold text-amber-700 mt-2">${leaderboard[2].totalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">3rd Place</p>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card overflow-hidden">
        <div className="p-4 bg-dark-300 border-b border-dark-100">
          <h2 className="text-lg font-semibold">Complete Rankings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-300 border-b border-dark-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cash Balance
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock Holdings
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {leaderboard.map((entry) => (
                <tr
                  key={entry.id}
                  className={cn(
                    "hover:bg-dark-300 transition-colors",
                    entry.id === currentUser?.id && "bg-primary-900/20 border-l-4 border-primary-500"
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.username}`}
                        alt={entry.username}
                        className={cn(
                          "w-10 h-10 rounded-full",
                          entry.id === currentUser?.id && "border-2 border-primary-500"
                        )}
                      />
                      <div className="ml-3">
                        <p className="font-medium text-white">
                          {entry.username}
                          {entry.id === currentUser?.id && (
                            <span className="ml-2 text-xs bg-primary-900 text-primary-400 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end">
                      <DollarSign className="w-4 h-4 text-success-500 mr-1" />
                      <span className="text-lg font-bold text-success-500">
                        ${entry.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end">
                      <Wallet className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="font-medium">
                        ${entry.cash.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end">
                      <TrendingUp className="w-4 h-4 text-primary-500 mr-1" />
                      <span className="font-medium">
                        ${entry.stockValue.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link
                      to={`/profile/${entry.id}`}
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 mr-4">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Players</p>
              <p className="text-2xl font-bold">{leaderboard.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-success-900 flex items-center justify-center text-success-400 mr-4">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Market Value</p>
              <p className="text-2xl font-bold">
                ${leaderboard.reduce((sum, entry) => sum + entry.totalValue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-accent-900 flex items-center justify-center text-accent-400 mr-4">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Average Portfolio</p>
              <p className="text-2xl font-bold">
                ${leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalValue, 0) / leaderboard.length).toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;