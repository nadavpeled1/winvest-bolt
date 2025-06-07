import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, TrendingUp, Clock, RefreshCw, BarChart3, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  getUserPortfolioValue, 
  getUserPortfolioPositions, 
  getUserTransactionHistory,
  PortfolioValue,
  PortfolioPosition,
  PortfolioTransaction 
} from '../lib/portfolioTracking';
import EnhancedTradeForm from '../components/trading/EnhancedTradeForm';
import EnhancedPortfolioSummary from '../components/portfolio/EnhancedPortfolioSummary';
import { cn } from '../lib/utils';

interface ProfileData {
  id: string;
  username: string;
  cash: number;
  created_at: string;
}

const EnhancedProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [portfolioValue, setPortfolioValue] = useState<PortfolioValue | null>(null);
  const [portfolioPositions, setPortfolioPositions] = useState<PortfolioPosition[]>([]);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetUserId) return;

      try {
        setLoading(true);

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (profileError) throw profileError;

        setProfileData(profile);

        // Fetch portfolio data
        const [valueData, positionsData, transactionData] = await Promise.all([
          getUserPortfolioValue(targetUserId),
          getUserPortfolioPositions(targetUserId),
          getUserTransactionHistory(targetUserId, 10)
        ]);

        setPortfolioValue(valueData);
        setPortfolioPositions(positionsData);
        setTransactions(transactionData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUserId]);

  const handleRefresh = async () => {
    if (!targetUserId) return;

    setRefreshing(true);
    try {
      const [valueData, positionsData, transactionData] = await Promise.all([
        getUserPortfolioValue(targetUserId),
        getUserPortfolioPositions(targetUserId),
        getUserTransactionHistory(targetUserId, 10)
      ]);

      setPortfolioValue(valueData);
      setPortfolioPositions(positionsData);
      setTransactions(transactionData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profileData || !portfolioValue) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.username}`}
            alt={profileData.username}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{profileData.username}</h1>
            <p className="text-gray-400">
              Member since {new Date(profileData.created_at).toLocaleDateString()}
            </p>
            {isOwnProfile && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-900 text-primary-400 rounded-full">
                Your Profile
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-3 rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center text-primary-500 mb-3">
            <Wallet className="w-6 h-6 mr-2" />
            <span className="text-sm font-medium">Cash Balance</span>
          </div>
          <p className="text-2xl font-bold">${portfolioValue.cash_balance.toLocaleString()}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center text-success-500 mb-3">
            <TrendingUp className="w-6 h-6 mr-2" />
            <span className="text-sm font-medium">Portfolio Value</span>
          </div>
          <p className="text-2xl font-bold">${portfolioValue.total_portfolio_value.toLocaleString()}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center text-accent-500 mb-3">
            <DollarSign className="w-6 h-6 mr-2" />
            <span className="text-sm font-medium">Total Net Worth</span>
          </div>
          <p className="text-2xl font-bold">${portfolioValue.total_net_worth.toLocaleString()}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center text-secondary-500 mb-3">
            <BarChart3 className="w-6 h-6 mr-2" />
            <span className="text-sm font-medium">Holdings</span>
          </div>
          <p className="text-2xl font-bold">{portfolioPositions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Summary */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Portfolio Summary</h2>
            <EnhancedPortfolioSummary />
          </div>
        </div>

        {/* Holdings & Transactions */}
        <div className="space-y-6">
          {/* Current Holdings */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Current Holdings</h3>
            {portfolioPositions.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {portfolioPositions.map((position) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-3 bg-dark-300 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{position.stock_symbol}</p>
                      <p className="text-sm text-gray-400">{position.total_quantity} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${position.total_invested.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">
                        Avg: ${position.average_cost_basis.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No holdings</p>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
            {transactions.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-dark-300 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {transaction.transaction_type === 'buy' ? 'Bought' : 'Sold'} {transaction.quantity} {transaction.stock_symbol}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-medium",
                        transaction.transaction_type === 'buy' ? "text-error-500" : "text-success-500"
                      )}>
                        {transaction.transaction_type === 'buy' ? '-' : '+'}${transaction.total_value.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">
                        ${transaction.price_per_share.toFixed(2)}/share
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No transactions</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Trading Form - Only show on own profile */}
      {isOwnProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedTradeForm />
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Portfolio Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-dark-300 rounded-lg">
                <h4 className="font-medium mb-2">Diversification Score</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-dark-100 rounded-full h-2 mr-3">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                      style={{ width: `${Math.min(portfolioPositions.length * 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {Math.min(portfolioPositions.length * 10, 100)}/100
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Based on number of different holdings
                </p>
              </div>

              <div className="p-4 bg-dark-300 rounded-lg">
                <h4 className="font-medium mb-2">Cash Allocation</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-dark-100 rounded-full h-2 mr-3">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ 
                        width: `${portfolioValue.total_net_worth > 0 
                          ? (portfolioValue.cash_balance / portfolioValue.total_net_worth) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {portfolioValue.total_net_worth > 0 
                      ? ((portfolioValue.cash_balance / portfolioValue.total_net_worth) * 100).toFixed(0)
                      : 0}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Percentage of total net worth in cash
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProfilePage;