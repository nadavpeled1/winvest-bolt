import React, { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Calendar, BarChart } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useCompetition } from '../contexts/CompetitionContext';
import { cn } from '../lib/utils';
import StockChart from '../components/charts/StockChart';

const MonkeyPage: React.FC = () => {
  const { user } = useUser();
  const { competitions } = useCompetition();
  const [showInsult, setShowInsult] = useState(false);
  
  // Find all instances of the monkey in competitions
  const monkeyStats = competitions.map(comp => {
    const monkey = comp.participants.find(p => p.id === 'monkey');
    if (!monkey) return null;
    
    const userParticipant = comp.participants.find(p => p.id === user.id);
    const isBeatingUser = userParticipant ? monkey.portfolioValue > userParticipant.portfolioValue : false;
    
    return {
      competitionId: comp.id,
      competitionName: comp.name,
      portfolioValue: monkey.portfolioValue,
      performanceChange: monkey.performanceChange,
      isBeatingUser,
      title: monkey.title
    };
  }).filter(Boolean);
  
  // Calculate overall stats
  const winCount = monkeyStats.filter(stat => stat?.isBeatingUser).length;
  const lossCount = monkeyStats.length - winCount;
  const winPercentage = (winCount / monkeyStats.length) * 100;
  
  const insults = [
    "Even a banana-picking primate like me is outperforming your portfolio!",
    "Did you learn investing from a trash panda?",
    "My dart board strategy is beating your 'expertise'!",
    "Just barely outperforming you. Did you try turning your strategy on?",
    "Enjoy your temporary lead. I'm just warming up!",
    "Statistically speaking, your slight outperformance is just dumb luck."
  ];
  
  const randomInsult = insults[Math.floor(Math.random() * insults.length)];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          <img 
            src="https://images.pexels.com/photos/1726398/pexels-photo-1726398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="The Monkey" 
            className="w-32 h-32 rounded-xl object-cover border-4 border-warning-500"
          />
          
          {showInsult && (
            <div className="absolute -top-12 right-0 max-w-64 bg-dark-400 p-3 rounded-lg shadow-lg border border-warning-800 animate-slide-up">
              <p className="text-warning-400 text-sm">{randomInsult} 🍌</p>
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-dark-400 border-r border-b border-warning-800 transform rotate-45"></div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">The Monkey</h1>
            <button 
              onClick={() => setShowInsult(!showInsult)}
              className="ml-2 text-xs px-2 py-1 bg-warning-900 text-warning-400 rounded-md hover:bg-warning-800 transition-colors"
            >
              {showInsult ? 'Hide Mockery' : 'Get Mocked'}
            </button>
          </div>
          <p className="mt-1 text-gray-400">
            The S&P 500 benchmark competitor who will never stop mocking you
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge-warning">Oil Baron</span>
            <span className="badge-primary">Index Follower</span>
            <span className="badge-secondary">Dart Thrower</span>
            <span className="badge-accent">Professional Mocker</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 text-right">
          <div className="text-sm text-gray-400">Win/Loss vs. You</div>
          <div className="text-2xl font-bold">
            <span className="text-success-500">{winCount}</span>
            <span className="text-gray-500"> / </span>
            <span className="text-error-500">{lossCount}</span>
          </div>
          <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-warning-500 rounded-full"
              style={{ width: `${winPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400">
            Beating you in {winPercentage.toFixed(0)}% of competitions
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 bg-gradient-to-br from-dark-200 to-warning-900/20">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-warning-900 flex items-center justify-center text-warning-400 mr-4">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-warning-300">Overall Rank</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold mr-1">#4</p>
                <p className="text-sm text-gray-400">of all investors</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card p-4 bg-gradient-to-br from-dark-200 to-primary-900/20">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 mr-4">
              <BarChart size={24} />
            </div>
            <div>
              <p className="text-sm text-primary-300">Strategy</p>
              <div className="flex items-baseline">
                <p className="text-xl font-bold mr-1">S&P 500 Index</p>
              </div>
              <p className="text-xs text-gray-400">Low-cost, passive approach</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 bg-gradient-to-br from-dark-200 to-accent-900/20">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-accent-900 flex items-center justify-center text-accent-400 mr-4">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-accent-300">Joined</p>
              <div className="flex items-baseline">
                <p className="text-xl font-bold mr-1">Always Here</p>
              </div>
              <p className="text-xs text-gray-400">A permanent competitor</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">The Monkey's Performance</h2>
          <select className="text-xs bg-dark-100 border border-dark-100 rounded-md px-2 py-1">
            <option>vs. S&P 500</option>
            <option>vs. You</option>
            <option>vs. All Users</option>
          </select>
        </div>
        <div className="h-64">
          <StockChart />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">The Monkey in Competitions</h2>
            <span className="badge-warning">
              {monkeyStats.length} Active
            </span>
          </div>
          <div className="space-y-3">
            {monkeyStats.map((stat, index) => (
              <div 
                key={stat?.competitionId}
                className={cn(
                  "p-3 rounded-lg flex items-center justify-between",
                  stat?.isBeatingUser ? "bg-success-900/20" : "bg-error-900/20"
                )}
              >
                <div>
                  <h3 className="font-medium">{stat?.competitionName}</h3>
                  <p className="text-xs text-gray-400">
                    Title: {stat?.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${stat?.portfolioValue.toLocaleString()}</p>
                  <p className={cn(
                    "text-xs flex items-center justify-end",
                    (stat?.performanceChange || 0) > 0 ? "text-success-500" : "text-error-500"
                  )}>
                    {(stat?.performanceChange || 0) > 0 ? (
                      <TrendingUp size={12} className="mr-0.5" />
                    ) : (
                      <TrendingDown size={12} className="mr-0.5" />
                    )}
                    {Math.abs(stat?.performanceChange || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-4">Monkey Talk</h2>
          <div className="space-y-4">
            <div className="p-4 bg-dark-300 rounded-lg relative">
              <div className="flex items-center mb-2">
                <img 
                  src="https://images.pexels.com/photos/1726398/pexels-photo-1726398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="The Monkey" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-warning-500"
                />
                <span className="ml-2 font-medium">The Monkey</span>
                <span className="ml-2 text-xs text-gray-400">2h ago</span>
              </div>
              <p className="text-sm text-gray-300 italic">
                "Just bought some tech stocks with my eyes closed. Still outperforming 70% of humans. Maybe try using your opposable thumbs for something useful? 🍌"
              </p>
              <div className="mt-2 flex justify-end">
                <button className="text-xs text-primary-400 hover:text-primary-300">
                  Like
                </button>
                <button className="text-xs text-primary-400 hover:text-primary-300 ml-2">
                  Reply
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-dark-300 rounded-lg relative">
              <div className="flex items-center mb-2">
                <img 
                  src="https://images.pexels.com/photos/1726398/pexels-photo-1726398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="The Monkey" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-warning-500"
                />
                <span className="ml-2 font-medium">The Monkey</span>
                <span className="ml-2 text-xs text-gray-400">1d ago</span>
              </div>
              <p className="text-sm text-gray-300 italic">
                "Just saw @{user.name} panic sell during a minor dip. And humans think they're the evolved species? My banana portfolio is up 3% this week. 🍌📈"
              </p>
              <div className="mt-2 flex justify-end">
                <button className="text-xs text-primary-400 hover:text-primary-300">
                  Like
                </button>
                <button className="text-xs text-primary-400 hover:text-primary-300 ml-2">
                  Reply
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-dark-300 rounded-lg relative">
              <div className="flex items-center mb-2">
                <img 
                  src="https://images.pexels.com/photos/1726398/pexels-photo-1726398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="The Monkey" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-warning-500"
                />
                <span className="ml-2 font-medium">The Monkey</span>
                <span className="ml-2 text-xs text-gray-400">2d ago</span>
              </div>
              <p className="text-sm text-gray-300 italic">
                "Breaking: Scientists discover that reading investment reports is less effective than throwing darts at stock listings. In related news, I'm up 5% this month. 🎯🐒"
              </p>
              <div className="mt-2 flex justify-end">
                <button className="text-xs text-primary-400 hover:text-primary-300">
                  Like
                </button>
                <button className="text-xs text-primary-400 hover:text-primary-300 ml-2">
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Monkey's Investment Philosophy</h2>
        <div className="text-sm text-gray-300 space-y-4">
          <p>
            The Monkey represents a passive index investment strategy, tracking the S&P 500. While seemingly simple, this approach often outperforms many active traders due to market efficiency and lower fees.
          </p>
          <p>
            The Monkey serves as both a benchmark and a humorous reminder that investing doesn't have to be complicated. If a monkey can beat you, maybe it's time to rethink your strategy!
          </p>
          <p className="italic border-l-4 border-warning-600 pl-4">
            "The greatest enemy of a good investment plan is the desire to constantly tinker with it. I just hold and eat bananas." - The Monkey
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonkeyPage;