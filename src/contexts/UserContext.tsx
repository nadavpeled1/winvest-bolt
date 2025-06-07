import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { calculatePortfolioValue, getHoldingsWithPrices } from '../lib/marketstack';

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

interface HoldingWithPrice extends Holding {
  current_price: number;
  current_value: number;
  name: string;
  change?: number;
  changePercent?: number;
}

interface UserContextType {
  profile: UserProfile | null;
  holdings: Holding[];
  holdingsWithPrices: HoldingWithPrice[];
  portfolioValue: number;
  loading: boolean;
  fetchUserData: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshPrices: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [holdingsWithPrices, setHoldingsWithPrices] = useState<HoldingWithPrice[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserData = async () => {
    if (!user) {
      setProfile(null);
      setHoldings([]);
      setHoldingsWithPrices([]);
      setPortfolioValue(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First, try to fetch the profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
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

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        profileData = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      // Fetch user holdings
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id);

      if (holdingsError) throw holdingsError;

      setProfile(profileData);
      setHoldings(holdingsData || []);

      // Calculate portfolio value and get holdings with current prices
      if (holdingsData && holdingsData.length > 0) {
        const [portfolioVal, holdingsWithCurrentPrices] = await Promise.all([
          calculatePortfolioValue(holdingsData),
          getHoldingsWithPrices(holdingsData)
        ]);
        
        setPortfolioValue(portfolioVal);
        setHoldingsWithPrices(holdingsWithCurrentPrices);
      } else {
        setPortfolioValue(0);
        setHoldingsWithPrices([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async () => {
    if (holdings.length > 0) {
      try {
        const [portfolioVal, holdingsWithCurrentPrices] = await Promise.all([
          calculatePortfolioValue(holdings),
          getHoldingsWithPrices(holdings)
        ]);
        
        setPortfolioValue(portfolioVal);
        setHoldingsWithPrices(holdingsWithCurrentPrices);
      } catch (error) {
        console.error('Error refreshing prices:', error);
      }
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

  // Refresh prices every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (holdings.length > 0) {
        refreshPrices();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [holdings]);

  return (
    <UserContext.Provider value={{ 
      profile, 
      holdings, 
      holdingsWithPrices,
      portfolioValue,
      loading, 
      fetchUserData, 
      updateProfile,
      refreshPrices
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};