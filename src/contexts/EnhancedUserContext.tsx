import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { 
  getUserPortfolioValue, 
  getUserPortfolioPositions, 
  getPortfolioSummary,
  PortfolioValue,
  PortfolioPosition 
} from '../lib/portfolioTracking';

interface UserProfile {
  id: string;
  username: string;
  cash: number;
  created_at: string;
}

interface Holding {
  id: string;
  stock_symbol: string;
  amount: number;
}

interface EnhancedUserContextType {
  profile: UserProfile | null;
  holdings: Holding[];
  portfolioValue: PortfolioValue | null;
  portfolioPositions: PortfolioPosition[];
  loading: boolean;
  fetchUserData: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshPortfolio: () => Promise<void>;
}

const EnhancedUserContext = createContext<EnhancedUserContextType | undefined>(undefined);

export const EnhancedUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<PortfolioValue | null>(null);
  const [portfolioPositions, setPortfolioPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserData = async () => {
    if (!user) {
      setProfile(null);
      setHoldings([]);
      setPortfolioValue(null);
      setPortfolioPositions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username,
            cash: 10000.00
          })
          .select()
          .single();

        if (createError) throw createError;
        profileData = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      // Fetch legacy holdings for compatibility
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id);

      if (holdingsError) throw holdingsError;

      setProfile(profileData);
      setHoldings(holdingsData || []);

      // Fetch enhanced portfolio data
      await refreshPortfolio();
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPortfolio = async () => {
    if (!user) return;

    try {
      const [valueData, positionsData] = await Promise.all([
        getUserPortfolioValue(user.id),
        getUserPortfolioPositions(user.id)
      ]);
      
      setPortfolioValue(valueData);
      setPortfolioPositions(positionsData);
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Auto-refresh portfolio every 5 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshPortfolio, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <EnhancedUserContext.Provider value={{ 
      profile, 
      holdings, 
      portfolioValue,
      portfolioPositions,
      loading, 
      fetchUserData, 
      updateProfile,
      refreshPortfolio
    }}>
      {children}
    </EnhancedUserContext.Provider>
  );
};

export const useEnhancedUser = (): EnhancedUserContextType => {
  const context = useContext(EnhancedUserContext);
  if (context === undefined) {
    throw new Error('useEnhancedUser must be used within an EnhancedUserProvider');
  }
  return context;
};