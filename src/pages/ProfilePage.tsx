import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getHoldingsWithPrices } from '../lib/marketstack';
import TradeForm from '../components/trading/TradeForm';
import { cn } from '../lib/utils';

interface ProfileData {
  id: string;
  username: string;
  cash: number;
  created_at: string;
}

interface HoldingData {
  id: string;
  stock_symbol: string;
  amount: number;
}

interface HoldingWithPrice extends HoldingData {
  current_price: number;
  current_value: number;
  name: string;
  change?: number;
  changePercent?: number;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { 
    profile: currentProfile, 
    holdings: currentHoldings, 
    holdingsWithPrices: currentHoldingsWithPrices,
    portfolioValue: currentPortfolioValue,
    loading: currentLoading,
    refreshPrices
  } = useUser();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [holdingsData, setHoldingsData] = useState<HoldingData[]>([]);
  const [holdingsWithPrices, setHoldingsWithPrices] = useState<HoldingWithPrice[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (isOwnProfile) {
        // Use current user's data
        setProfileData(currentProfile);
        setHoldingsData(currentHoldings);
        setHoldingsWithPrices(currentHoldingsWithPrices);
        setPortfolioValue(currentPortfolioValue);
        setLoading(currentLoading);
        return;
      }

      // Fetch other user's data
      try {
        setLoading(true);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        const { data: holdings, error: holdingsError } = await supabase
          .from('holdings')
          .select('*')
          .eq('user_id', userId);

        if (holdingsError) throw holdingsError;

        setProfileData(profile);
        setHoldingsData(holdings || []);

        // Get holdings with current prices for other users
        if (holdings && holdings.length > 0) {
          const holdingsWithCurrentPrices = await getHoldingsWithPrices(holdings);
          setHoldingsWithPrices(holdingsWithCurrentPrices);
          
          const totalValue = holdingsWithCurrentPrices.reduce((sum, holding) => sum + holding.current_value, 0);
          setPortfolioValue(totalValue);
        } else {
          setHoldingsWithPrices([]);
          setPortfolioValue(0);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, user?.id, currentProfile, currentHoldings, currentHoldingsWithPrices, currentPortfolioValue, currentLoading, isOwnProfile]);

  const handleRefreshPrices = async () => {
    if (isOwnProfile) {
      setRefreshing(true);
      await refreshPrices();
      setRefreshing(false);
    } else if (holdingsData.length > 0) {
      setRefreshing(true);
      try {
        const holdingsWithCurrentPrices = await getHoldingsWithPrices(holdingsData);
        setHoldingsWithPrices(holdingsWithCurrentPrices);
        
        const totalValue = holdingsWithCurrentPrices.reduce((sum, holding) => sum + holding.current_value, 0);
        setPortfolioValue(totalValue);
      } catch (error) {
        console.error('Error refreshing prices:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profileData) {
    return <div>User not found</div>;
  }

  const totalValue = profileData.cash + portfolioValue;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="card p-6">
          <div className="flex items-center space-x-4">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.username}`}
              alt={profileData.username}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-xl font-bold">{profileData.username}</h2>
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

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-dark-300 rounded-lg">
              <div className="flex items-center text-primary-500 mb-2">
                <Wallet className="w-5 h-5 mr-2" />
                <span className="text-sm">Cash Balance</span>
              </div>
              <p className="text-xl font-bold">${profileData.cash.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-dark-300 rounded-lg">
              <div className="flex items-center text-success-500 mb-2">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="text-sm">Portfolio Value</span>
              </div>
              <p className="text-xl font-bold">${portfolioValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-dark-300 rounded-lg">
            <div className="flex items-center text-accent-500 mb-2">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm">Total Value</span>
            </div>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Holdings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Stock Holdings</h3>
            <button
              onClick={handleRefreshPrices}
              disabled={refreshing}
              className="p-2 rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors disabled:opacity-50"
              title="Refresh prices"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </button>
          </div>
          
          {holdingsWithPrices.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {holdingsWithPrices.map((holding) => (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-3 bg-dark-300 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{holding.stock_symbol}</p>
                    <p className="text-sm text-gray-400">{holding.name}</p>
                    <p className="text-xs text-gray-500">{holding.amount} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${holding.current_value.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">${holding.current_price.toFixed(2)}/share</p>
                    {holding.changePercent !== undefined && (
                      <p className={cn(
                        "text-xs",
                        holding.changePercent >= 0 ? "text-success-500" : "text-error-500"
                      )}>
                        {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No stocks in portfolio</p>
          )}
        </div>
      </div>
      
      {/* Only show trade form on current user's profile */}
      {isOwnProfile && <TradeForm />}
    </div>
  );
};

export default ProfilePage;