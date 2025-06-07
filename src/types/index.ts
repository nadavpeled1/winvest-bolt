export interface User {
  id: string;
  name: string;
  profileImage: string;
  cash: number;
  portfolioValue: number;
  portfolioChange: number;
}

export interface Participant {
  id: string;
  name: string;
  profileImage: string;
  title: string;
  portfolioValue: number;
  performanceChange: number;
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  entryFee: number;
  prizePool: number;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  participants: Participant[];
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  shares: number;
  value: number;
  sector: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  risk: string;
  timeRemaining: string;
  sector: string;
  percentageRequired?: number;
  sectorsRequired?: number;
}

export interface Portfolio {
  totalValue: number;
  cash: number;
  stocks: Stock[];
  performanceToday: number;
  performanceOverall: number;
}

export interface Activity {
  id: string;
  type: 'buy' | 'sell' | 'challenge' | 'mockery';
  timestamp: Date;
  details: any;
}