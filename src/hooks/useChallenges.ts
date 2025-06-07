import { useState, useEffect } from 'react';
import { Challenge } from '../types';

const mockChallenges: Challenge[] = [
  {
    id: 'tech-investment',
    title: 'Tech Sector Challenge',
    description: 'Allocate at least 25% of your portfolio to technology stocks in the next 8 hours.',
    reward: '+10% returns on tech stocks',
    risk: 'Tech sector underperformance',
    timeRemaining: '8 hours',
    sector: 'Technology',
    percentageRequired: 25
  },
  {
    id: 'diversify-challenge',
    title: 'Diversification Challenge',
    description: 'Hold stocks from at least 6 different sectors within the next 2 days.',
    reward: '+5% overall portfolio bonus',
    risk: 'Missing sector-specific gains',
    timeRemaining: '2 days',
    sector: 'Mixed',
    sectorsRequired: 6
  },
  {
    id: 'energy-shift',
    title: 'Energy Sector Shift',
    description: 'Move at least 20% of your portfolio into renewable energy stocks.',
    reward: '+15% returns on energy stocks',
    risk: 'Energy market volatility',
    timeRemaining: '12 hours',
    sector: 'Energy',
    percentageRequired: 20
  }
];

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  // Simulate random challenge popup
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * challenges.length);
    const timeout = setTimeout(() => {
      setActiveChallenge(challenges[randomIndex]);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [challenges]);

  const acceptChallenge = (challengeId: string) => {
    setActiveChallenge(null);
    // Here you would implement the logic for accepting a challenge
  };

  const declineChallenge = (challengeId: string) => {
    setActiveChallenge(null);
    // Here you would implement the logic for declining a challenge
  };

  return {
    challenges,
    activeChallenge,
    acceptChallenge,
    declineChallenge
  };
};