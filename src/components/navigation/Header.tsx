import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, Loader2, X } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { profile, loading } = useUser();
  const { signOut } = useAuth();
  
  if (loading) {
    return (
      <header className="sticky top-0 z-10 flex items-center justify-center h-16 px-4 bg-dark-400 border-b border-dark-100">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </header>
    );
  }

  if (!profile) {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-dark-400 border-b border-dark-100">
      <div className="flex items-center md:hidden">
        <button 
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-dark-300"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent md:hidden">
          Winvest
        </h1>
      </div>
      
      <div className="hidden md:flex items-center">
        <h2 className="text-lg font-semibold text-white">Welcome back, {profile.username}!</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center md:hidden">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
            alt={profile.username}
            className="w-8 h-8 rounded-full"
          />
        </div>
        
        <div className="hidden md:flex items-center">
          <button 
            onClick={signOut}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-300"
          >
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
              alt={profile.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-gray-200">{profile.username}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;