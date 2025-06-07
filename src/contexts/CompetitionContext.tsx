import React, { createContext, useContext, useState } from 'react';
import { Competition } from '../types';

interface CompetitionContextType {
  competitions: Competition[];
  activeCompetition: Competition | null;
  setActiveCompetition: (competitionId: string) => void;
  getCompetitionById: (id: string) => Competition | undefined;
}

const mockCompetitions: Competition[] = [
  {
    id: 'tech-titans',
    name: 'Tech Titans League',
    description: 'Compete in the most aggressive tech-focused investment league',
    entryFee: 100,
    prizePool: 1500,
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-07-01'),
    daysRemaining: 14.5,
    participants: [
      {
        id: 'user1',
        name: 'Alex Johnson',
        profileImage: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Tech Savage',
        portfolioValue: 127463,
        performanceChange: 2.3
      },
      {
        id: 'user2',
        name: 'Sarah Williams',
        profileImage: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Risk Taker',
        portfolioValue: 135782,
        performanceChange: 3.7
      },
      {
        id: 'monkey',
        name: 'The Monkey',
        profileImage: 'https://images.pexels.com/photos/1726398/pexels-photo-1726398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Oil Baron',
        portfolioValue: 124571,
        performanceChange: -1.2
      },
      {
        id: 'user3',
        name: 'Mike Peterson',
        profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Cautious Investor',
        portfolioValue: 118253,
        performanceChange: -0.8
      },
      {
        id: 'user4',
        name: 'Emily Chen',
        profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Market Wizard',
        portfolioValue: 142137,
        performanceChange: 5.2
      }
    ]
  },
  {
    id: 'global-investors',
    name: 'Global Investors Challenge',
    description: 'Invest in international markets and outperform your peers',
    entryFee: 50,
    prizePool: 750,
    startDate: new Date('2023-05-15'),
    endDate: new Date('2023-06-15'),
    daysRemaining: 7.2,
    participants: [
      {
        id: 'user1',
        name: 'Alex Johnson',
        profileImage: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Global Trader',
        portfolioValue: 98245,
        performanceChange: -1.5
      },
      {
        id: 'monkey',
        name: 'The Monkey',
        profileImage: 'https://images.pexels.com/photos/1726398/pexels-photo-1726398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Banana Investor',
        portfolioValue: 102381,
        performanceChange: 1.8
      },
      {
        id: 'user5',
        name: 'David Kim',
        profileImage: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Forex Master',
        portfolioValue: 107532,
        performanceChange: 3.2
      }
    ]
  }
];

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export const CompetitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [competitions] = useState<Competition[]>(mockCompetitions);
  const [activeCompetition, setActiveCompetitionState] = useState<Competition | null>(mockCompetitions[0]);

  const setActiveCompetition = (competitionId: string) => {
    const competition = competitions.find((c) => c.id === competitionId);
    setActiveCompetitionState(competition || null);
  };

  const getCompetitionById = (id: string) => {
    return competitions.find((c) => c.id === id);
  };

  return (
    <CompetitionContext.Provider
      value={{
        competitions,
        activeCompetition,
        setActiveCompetition,
        getCompetitionById
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = (): CompetitionContextType => {
  const context = useContext(CompetitionContext);
  if (context === undefined) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
};