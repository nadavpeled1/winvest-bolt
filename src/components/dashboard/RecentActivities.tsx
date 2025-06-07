import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const RecentActivities: React.FC = () => {
  const activities = [
    { 
      id: 1, 
      type: 'buy', 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      amount: 10, 
      price: 182.63, 
      time: '2h ago' 
    },
    { 
      id: 2, 
      type: 'challenge', 
      description: 'Completed "Tech Guru" challenge', 
      reward: '+5% bonus', 
      time: '5h ago' 
    },
    { 
      id: 3, 
      type: 'sell', 
      symbol: 'TSLA', 
      name: 'Tesla, Inc.', 
      amount: 5, 
      price: 248.50, 
      time: '1d ago' 
    },
    { 
      id: 4, 
      type: 'mockery', 
      from: 'The Monkey', 
      message: 'Even bananas have better returns than your NVDA trade!', 
      time: '1d ago' 
    },
    { 
      id: 5, 
      type: 'buy', 
      symbol: 'AMZN', 
      name: 'Amazon.com Inc.', 
      amount: 8, 
      price: 178.75, 
      time: '2d ago' 
    },
  ];
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            activity.type === 'buy' && "bg-success-900 text-success-500",
            activity.type === 'sell' && "bg-error-900 text-error-500",
            activity.type === 'challenge' && "bg-primary-900 text-primary-500",
            activity.type === 'mockery' && "bg-warning-900 text-warning-500",
          )}>
            {activity.type === 'buy' && <TrendingUp size={18} />}
            {activity.type === 'sell' && <TrendingDown size={18} />}
            {activity.type === 'challenge' && <span className="text-lg">🏆</span>}
            {activity.type === 'mockery' && <span className="text-lg">🐒</span>}
          </div>
          
          <div className="ml-3 flex-1">
            {activity.type === 'buy' && (
              <>
                <p className="text-sm font-medium">
                  Bought {activity.amount} {activity.symbol}
                </p>
                <p className="text-xs text-gray-400">
                  {activity.name} at ${activity.price}
                </p>
              </>
            )}
            
            {activity.type === 'sell' && (
              <>
                <p className="text-sm font-medium">
                  Sold {activity.amount} {activity.symbol}
                </p>
                <p className="text-xs text-gray-400">
                  {activity.name} at ${activity.price}
                </p>
              </>
            )}
            
            {activity.type === 'challenge' && (
              <>
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-success-500">{activity.reward}</p>
              </>
            )}
            
            {activity.type === 'mockery' && (
              <>
                <p className="text-sm font-medium">Mockery from {activity.from}</p>
                <p className="text-xs text-gray-400 italic">"{activity.message}"</p>
              </>
            )}
          </div>
          
          <div className="flex items-center text-xs text-gray-400 ml-2">
            <Clock size={12} className="mr-1" />
            {activity.time}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;