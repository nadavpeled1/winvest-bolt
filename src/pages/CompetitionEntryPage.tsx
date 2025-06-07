import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, Calendar, DollarSign, Info } from 'lucide-react';
import { useCompetition } from '../contexts/CompetitionContext';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

const CompetitionEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCompetitionById } = useCompetition();
  const { user } = useUser();
  
  const [entryFee, setEntryFee] = useState(50);
  const [inviteFriends, setInviteFriends] = useState('');
  
  const competition = getCompetitionById(id || '');
  
  if (!competition) {
    return <div>Competition not found</div>;
  }
  
  const handleEntryFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntryFee(parseInt(e.target.value));
  };
  
  const handleJoinCompetition = () => {
    // Here we would handle the logic for joining the competition
    navigate(`/leaderboard/${competition.id}`);
  };
  
  const possibleFees = [50, 100, 200, 500];
  const estimatedReturns = entryFee * 3.5; // Simple calculation for demonstration
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card overflow-hidden">
        <div className="p-6 bg-dark-300">
          <h1 className="text-2xl font-bold text-white">{competition.name}</h1>
          <p className="mt-1 text-gray-400">{competition.description}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Competition Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center text-primary-500 mr-3">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-gray-400">
                      {competition.startDate.toLocaleDateString()} - {competition.endDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center text-accent-500 mr-3">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Participants</p>
                    <p className="text-sm text-gray-400">
                      {competition.participants.length} registered (including The Monkey 🐒)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center text-warning-500 mr-3">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Prize Structure</p>
                    <p className="text-sm text-gray-400">
                      1st: 70%, 2nd: 20%, 3rd: 10% of pool
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center text-success-500 mr-3">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Starting Capital</p>
                    <p className="text-sm text-gray-400">
                      $100,000 virtual dollars
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-dark-300 rounded-lg border border-dark-100">
                <div className="flex items-start">
                  <Info size={18} className="text-primary-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">The Monkey Always Competes</p>
                    <p className="text-sm text-gray-400">
                      Every competition includes "The Monkey" - an AI competitor that follows the S&P 500 index and will mock you mercilessly if you underperform!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Join Competition</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Entry Fee</label>
                  <div className="grid grid-cols-4 gap-2">
                    {possibleFees.map((fee) => (
                      <button
                        key={fee}
                        onClick={() => setEntryFee(fee)}
                        className={cn(
                          "py-2 rounded-lg text-center transition-colors",
                          entryFee === fee
                            ? "bg-primary-600 text-white"
                            : "bg-dark-300 text-gray-400 hover:bg-dark-200"
                        )}
                      >
                        ${fee}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Amount</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={entryFee}
                      onChange={handleEntryFeeChange}
                      className="input pl-8"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Invite Friends (Optional)</label>
                  <input
                    type="text"
                    value={inviteFriends}
                    onChange={(e) => setInviteFriends(e.target.value)}
                    placeholder="Enter email addresses, separated by commas"
                    className="input"
                  />
                </div>
                
                <div className="p-4 bg-dark-300 rounded-lg border border-dark-100">
                  <h3 className="text-sm font-medium mb-2">Estimated Returns</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Entry Fee:</span>
                    <span className="text-sm font-medium">${entryFee}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-400">Potential Winnings:</span>
                    <span className="text-sm font-medium text-success-500">
                      Up to ${estimatedReturns}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    *Actual returns depend on final number of participants
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={handleJoinCompetition}
                    className="btn-primary w-full"
                  >
                    Join Competition for ${entryFee}
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-400">
                    Your current balance: ${user.cash}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionEntryPage;