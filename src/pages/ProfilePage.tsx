import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, TrendingUp, Clock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import TradeForm from '../components/trading/TradeForm';

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

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { profile: currentProfile, holdings: currentHoldings, loading: currentLoading } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [holdingsData, setHoldingsData] = useState<HoldingData[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (isOwnProfile) {
        // Use current user's data
        setProfileData(currentProfile);
        setHoldingsData(currentHoldings);
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
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, user?.id, currentProfile, currentHoldings, currentLoading, isOwnProfile]);

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

  const totalHoldingsValue = holdingsData.reduce((total, holding) => total + holding.amount, 0);

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
                <span className="text-sm">Holdings Count</span>
              </div>
              <p className="text-xl font-bold">{holdingsData.length}</p>
            </div>
          </div>
        </div>

        {/* Holdings */}
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Stock Holdings</h3>
          {holdingsData.length > 0 ? (
            <div className="space-y-4">
              {holdingsData.map((holding) => (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-3 bg-dark-300 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{holding.stock_symbol}</p>
                    <p className="text-sm text-gray-400">{holding.amount} shares</p>
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