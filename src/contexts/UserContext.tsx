import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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

interface UserContextType {
  profile: UserProfile | null;
  holdings: Holding[];
  loading: boolean;
  fetchUserData: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserData = async () => {
    if (!user) {
      setProfile(null);
      setHoldings([]);
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
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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

  return (
    <UserContext.Provider value={{ profile, holdings, loading, fetchUserData, updateProfile }}>
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