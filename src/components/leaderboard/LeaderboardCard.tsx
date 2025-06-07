import React from 'react';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useCompetition } from '../../contexts/CompetitionContext';
import { cn } from '../../lib/utils';

interface LeaderboardCardProps {
  limit?: number;
  competitionId: string;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ limit = 10, competitionId }) => {
  const { user, loading } = useUser();
  const { getCompetitionById } = useCompetition();
  const competition = getCompetitionById(competitionId);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user || !competition) {
    return null;
  }
  
  const topParticipants = competition.participants.slice(0, limit);
  
  return (
    <div className="space-y-3">
      {topParticipants.map((participant, index) => {
        const isUser = participant.id === user.id;
        const isMonkey = participant.id === 'monkey';
        const isPositiveChange = participant.performanceChange > 0;
        
        return (
          <div 
            key={participant.id}
            className={cn(
              "flex items-center p-3 rounded-lg transition-all",
              isUser ? "bg-primary-900/40 border border-primary-800" : "bg-dark-300",
              isMonkey && "border border-warning-800",
              "hover:bg-dark-200 cursor-pointer animate-slide-up"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-dark-100 text-sm font-semibold">
              {index + 1}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <img 
                  src={participant.profileImage} 
                  alt={participant.name}
                  className={cn(
                    "w-8 h-8 rounded-full object-cover",
                    isUser && "border-2 border-primary-500",
                    isMonkey && "border-2 border-warning-500"
                  )}
                />
                <div className="ml-2">
                  <p className="text-sm font-medium flex items-center">
                    {participant.name}
                    {isMonkey && (
                      <span className="ml-1 text-lg\" role="img\" aria-label="monkey">
                        🐒
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{participant.title}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold">${participant.portfolioValue.toLocaleString()}</p>
              <p className={cn(
                "text-xs flex items-center justify-end",
                isPositiveChange ? "text-success-500" : "text-error-500"
              )}>
                {isPositiveChange ? (
                  <ArrowUp size={12} className="mr-0.5" />
                ) : (
                  <ArrowDown size={12} className="mr-0.5" />
                )}
                {Math.abs(participant.performanceChange).toFixed(2)}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaderboardCard;