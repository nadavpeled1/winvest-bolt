import React, { useState } from 'react';
import { TrendingUp, Users, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        await signUp(email, password, username);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Winvest
            </h1>
            <p className="mt-2 text-gray-400">
              Fantasy investing with a competitive edge
            </p>
          </div>

          <div className="bg-dark-200 p-8 rounded-xl border border-dark-100">
            <div className="flex mb-6">
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  isLogin
                    ? 'text-white border-b-2 border-primary-500'
                    : 'text-gray-400 border-b border-dark-100'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  !isLogin
                    ? 'text-white border-b-2 border-primary-500'
                    : 'text-gray-400 border-b border-dark-100'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input mt-1"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input mt-1"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input mt-1"
                  required
                />
              </div>

              {error && (
                <div className="text-error-500 text-sm text-center">{error}</div>
              )}

              <button 
                type="submit" 
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Register')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-dark-400 p-8 items-center justify-center">
        <div className="max-w-lg space-y-8">
          <h2 className="text-2xl font-bold text-white">
            Experience the Future of Fantasy Investing
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary-900 flex items-center justify-center text-primary-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Real-Time Trading</h3>
                <p className="text-gray-400">
                  Experience the thrill of stock market trading with real-time data and zero financial risk.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-accent-900 flex items-center justify-center text-accent-400">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Competitive Leagues</h3>
                <p className="text-gray-400">
                  Join investment leagues, compete with friends, and win real prizes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-warning-900 flex items-center justify-center text-warning-400">
                <span className="text-2xl">🐒</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Beat the Monkey</h3>
                <p className="text-gray-400">
                  Challenge our AI competitor "The Monkey" and prove your investment skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;