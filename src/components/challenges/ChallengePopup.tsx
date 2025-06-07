import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Challenge } from '../../types';

interface ChallengePopupProps {
  challenge: Challenge;
}

const ChallengePopup: React.FC<ChallengePopupProps> = ({ challenge }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
      <div className="relative max-w-md w-full mx-4 animate-scale-in">
        <div className="bg-dark-200 rounded-xl border-2 border-accent-600 overflow-hidden shadow-xl">
          <div className="p-4 bg-dark-300 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center">
              <span className="mr-2 text-accent-500">⚡</span>
              Bold Challenge
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-dark-100"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">{challenge.title}</h2>
            <p className="text-gray-400 mb-4">{challenge.description}</p>
            
            <div className="mb-6 flex items-center text-warning-500 text-sm">
              <Clock size={16} className="mr-2" />
              <span>Time remaining: {challenge.timeRemaining}</span>
            </div>
            
            <div className="bg-dark-300 rounded-lg p-3 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Reward:</span>
                <span className="text-success-500 text-sm font-medium">{challenge.reward}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risk:</span>
                <span className="text-error-500 text-sm font-medium">{challenge.risk}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-dark-100 text-gray-300 hover:bg-dark-400 transition-colors"
              >
                Decline
              </button>
              <button className="btn-accent">
                Accept Challenge
              </button>
            </div>
            
            <p className="mt-4 text-xs text-center text-gray-500 italic">
              Declining this challenge may trigger mockery from The Monkey...
            </p>
          </div>
        </div>
        
        <div className={cn(
          "absolute -bottom-16 right-6 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0"
        )}>
          <div className="relative">
            <div className="absolute -top-10 right-0 bg-dark-400 p-2 rounded-lg text-sm max-w-48 border border-warning-800">
              <p className="text-warning-400">Scared of a challenge? 🍌</p>
            </div>
            <img 
              src="https://images.pexels.com/photos/1726398/pexels-photo-1726398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="The Monkey" 
              className="w-16 h-16 object-cover rounded-full border-2 border-warning-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePopup;