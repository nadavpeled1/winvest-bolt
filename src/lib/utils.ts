import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function calculatePercentageChange(current: number, previous: number): number {
  return ((current - previous) / previous) * 100;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockery(performanceChange: number, isBeatingMonkey: boolean): string {
  const mockeries = {
    losingBadly: [
      "Even a banana-picking primate like me is outperforming your portfolio!",
      "Did you learn investing from a trash panda?",
      "My dart board strategy is beating your 'expertise'!",
    ],
    losingSlightly: [
      "You're almost keeping up with a monkey. Almost.",
      "One banana away from beating you!",
      "Just barely outperforming you. Did you try turning your strategy on?",
    ],
    winningSlightly: [
      "You're barely ahead. I'm just taking a banana break!",
      "Enjoy your temporary lead. I'm just warming up!",
      "Statistically speaking, your slight outperformance is just dumb luck.",
    ],
    winningBig: [
      "Impressive! You're actually beating a monkey. Low bar, huh?",
      "Not bad for a human! Maybe you should manage my banana fund.",
      "You're crushing it! But remember, I'm still just a monkey with a dart board.",
    ],
  };

  if (!isBeatingMonkey) {
    if (performanceChange < -3) {
      return mockeries.losingBadly[getRandomInt(0, mockeries.losingBadly.length - 1)];
    } else {
      return mockeries.losingSlightly[getRandomInt(0, mockeries.losingSlightly.length - 1)];
    }
  } else {
    if (performanceChange > 3) {
      return mockeries.winningBig[getRandomInt(0, mockeries.winningBig.length - 1)];
    } else {
      return mockeries.winningSlightly[getRandomInt(0, mockeries.winningSlightly.length - 1)];
    }
  }
}