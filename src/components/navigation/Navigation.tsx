import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Settings,
  Loader2,
  LogOut
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface NavigationProps {
  isMobileMenuOpen?: boolean;
  onMenuItemClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isMobileMenuOpen, onMenuItemClick }) => {
  const { profile, loading } = useUser();
  const { signOut } = useAuth();

  const navItems = [
    { name: 'Profile', path: '/profile', icon: <BarChart3 size={20} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Users size={20} /> },
  ];

  if (loading) {
    return (
      <nav className="hidden md:flex flex-col w-64 bg-dark-400 border-r border-dark-100 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </nav>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-col w-64 bg-dark-400 border-r border-dark-100">
        <div className="flex items-center justify-center h-16 border-b border-dark-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Winvest
          </h1>
        </div>

        <div className="flex flex-col flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-900/50 text-primary-400'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-dark-300'
                  )
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto">
            <div className="pt-4 border-t border-dark-100">
              <button
                onClick={signOut}
                className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:text-gray-100 hover:bg-dark-300"
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </button>
            </div>
            
            <div className="flex items-center mt-4 p-3 bg-dark-300 rounded-lg">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
                alt={profile.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-200">{profile.username}</p>
                <p className="text-xs text-gray-400">${profile.cash.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={onMenuItemClick}
          />
          
          {/* Mobile Menu */}
          <nav className="fixed top-0 left-0 h-full w-64 bg-dark-400 border-r border-dark-100 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-center h-16 border-b border-dark-100">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Winvest
                </h1>
              </div>

              <div className="flex flex-col flex-1 p-4">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onMenuItemClick}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary-900/50 text-primary-400'
                            : 'text-gray-400 hover:text-gray-100 hover:bg-dark-300'
                        )
                      }
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  ))}
                </div>

                <div className="mt-auto">
                  <div className="pt-4 border-t border-dark-100">
                    <button
                      onClick={() => {
                        signOut();
                        onMenuItemClick?.();
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:text-gray-100 hover:bg-dark-300"
                    >
                      <LogOut size={20} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                  
                  <div className="flex items-center mt-4 p-3 bg-dark-300 rounded-lg">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
                      alt={profile.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-200">{profile.username}</p>
                      <p className="text-xs text-gray-400">${profile.cash.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navigation;