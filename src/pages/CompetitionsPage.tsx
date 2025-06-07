import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, Users, DollarSign } from 'lucide-react';
import { useCompetition } from '../contexts/CompetitionContext';
import { formatCurrency } from '../lib/utils';

const CompetitionsPage: React.FC = () => {
  const { competitions } = useCompetition();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitions</h1>
          <p className="mt-1 text-gray-400">Join or create fantasy investing leagues</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary">Create Competition</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((competition) => (
          <div key={competition.id} className="card overflow-hidden hover:border-primary-600 transition-colors">
            <div className="p-4 bg-dark-300">
              <h3 className="text-lg font-semibold text-white">{competition.name}</h3>
              <p className="mt-1 text-sm text-gray-400 line-clamp-2">{competition.description}</p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <DollarSign size={16} className="text-primary-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-400">Entry Fee</p>
                    <p className="text-sm font-medium">${competition.entryFee}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <TrendingUp size={16} className="text-accent-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-400">Prize Pool</p>
                    <p className="text-sm font-medium">${competition.prizePool}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users size={16} className="text-secondary-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-400">Participants</p>
                    <p className="text-sm font-medium">{competition.participants.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar size={16} className="text-warning-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-400">Time Left</p>
                    <p className="text-sm font-medium">{Math.floor(competition.daysRemaining)} days</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <Link 
                  to={`/leaderboard/${competition.id}`}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  View Leaderboard
                </Link>
                <Link 
                  to={`/competitions/entry/${competition.id}`}
                  className="btn-accent"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add "Browse More" card */}
        <div className="card p-6 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-700 bg-transparent">
          <div className="w-12 h-12 rounded-full bg-dark-300 flex items-center justify-center mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Browse More Competitions</h3>
          <p className="text-sm text-gray-400 mb-4">
            Discover more fantasy investing leagues that match your interests and risk tolerance.
          </p>
          <button className="btn-outline">
            Explore All
          </button>
        </div>
      </div>
      
      <div className="card p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">How Competitions Work</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 mb-3">
              1
            </div>
            <h3 className="font-semibold">Join a Competition</h3>
            <p className="text-sm text-gray-400">
              Pay the entry fee to join a fantasy investing league with friends or strangers.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 mb-3">
              2
            </div>
            <h3 className="font-semibold">Build Your Portfolio</h3>
            <p className="text-sm text-gray-400">
              Use virtual cash to create a fantasy portfolio that competes with others.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 mb-3">
              3
            </div>
            <h3 className="font-semibold">Win Prizes</h3>
            <p className="text-sm text-gray-400">
              Top performers win real money from the prize pool at the end of the competition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionsPage;