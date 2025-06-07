import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Award } from 'lucide-react';

import LeaderboardCard from '../components/leaderboard/LeaderboardCard';
import PortfolioSummary from '../components/portfolio/PortfolioSummary';
import RecentActivities from '../components/dashboard/RecentActivities';
import StockChart from '../components/charts/StockChart';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useUser } from '../contexts/UserContext';

const DashboardPage: React.FC = () => {
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard(true); // Auto-refresh every 5 minutes
  const { profile, portfolioValue } = useUser();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
              <p className="text-sm font-medium text-gray-400">Your Rank</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold">
                  {profile ? (
                    leaderboard.find(entry => entry.id === profile.id)?.rank || 'N/A'
                  ) : 'N/A'}
                </p>
                <Award className="text-primary-500" size={24} />
              </div>
              <div className="mt-2 flex items-center text-primary-500 text-sm">
                <span className="ml-1">of {leaderboard.length} players</span>
              </div>
            </div>
            
            <div className="card p-4">
              <p className="text-sm font-medium text-gray-400">Portfolio Value</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold">${portfolioValue.toLocaleString()}</p>
                <TrendingUp className="text-success-500" size={24} />
              </div>
              <div className="mt-2 flex items-center text-success-500 text-sm">
                <ArrowUpRight size={16} />
                <span className="ml-1">Stocks only</span>
              </div>
            </div>
            
            <div className="card p-4">
              <p className="text-sm font-medium text-gray-400">Total Value</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold">
                  ${profile ? (profile.cash + portfolioValue).toLocaleString() : '0'}
                </p>
                <span className="text-2xl">💰</span>
              </div>
              <div className="mt-2 flex items-center text-accent-500 text-sm">
                <span className="ml-1">Cash + Stocks</span>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Portfolio Performance</h2>
              <select className="text-xs bg-dark-100 border border-dark-100 rounded-md px-2 py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-64">
              <StockChart />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Activities</h2>
              <Link to="/profile" className="text-xs text-primary-400 hover:text-primary-300">
                View all
              </Link>
            </div>
            <RecentActivities />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Current Challenges</h2>
              <span className="badge-accent">2 Active</span>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-dark-300 rounded-lg border border-accent-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Invest in Tech Stocks</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Allocate 25% to tech sector
                    </p>
                  </div>
                  <span className="badge-warning">8h left</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-400">Reward: +10% bonus</span>
                  <button className="text-xs px-2 py-1 bg-accent-600 text-white rounded-md">
                    Accept
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-dark-300 rounded-lg border border-secondary-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Diversify Portfolio</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Hold at least 6 different sectors
                    </p>
                  </div>
                  <span className="badge-primary">2d left</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-400">Progress: 4/6</span>
                  <span className="text-xs text-success-400">In progress</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Portfolio Summary</h2>
              <Link to="/profile" className="text-xs text-primary-400 hover:text-primary-300">
                Manage
              </Link>
            </div>
            <PortfolioSummary />
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Top Players</h2>
              <Link 
                to="/leaderboard" 
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                View all
              </Link>
            </div>
            <LeaderboardCard 
              entries={leaderboard} 
              loading={leaderboardLoading}
              limit={5} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;