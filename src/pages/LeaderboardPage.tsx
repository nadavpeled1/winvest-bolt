import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardUser {
  id: string;
  username: string;
  cash: number;
}

const LeaderboardPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, cash')
          .order('cash', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      <div className="card overflow-hidden">
        <div className="p-4 bg-dark-300 border-b border-dark-100">
          <h2 className="text-lg font-semibold">Top Players</h2>
        </div>

        <div className="divide-y divide-dark-100">
          {users.map((user, index) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className="flex items-center p-4 hover:bg-dark-300 transition-colors"
            >
              <div className="w-8 text-center">
                {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 mx-auto" />}
                {index === 1 && <Trophy className="w-5 h-5 text-gray-400 mx-auto" />}
                {index === 2 && <Trophy className="w-5 h-5 text-amber-700 mx-auto" />}
                {index > 2 && <span className="text-gray-400">{index + 1}</span>}
              </div>

              <div className="flex-1 ml-4">
                <div className="flex items-center">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="ml-3 font-medium">
                    {user.username}
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs bg-primary-900 text-primary-400 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">${user.cash.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;