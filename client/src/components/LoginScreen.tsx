import { useState } from 'react';
import { authApi } from '../api/auth';
import { User } from '../types';

interface Props {
  onLogin: (token: string, user: User) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [isSignup, setIsSignup] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'provider'>('patient');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isSignup
        ? await authApi.signup(username, email, password, userType)
        : await authApi.login(username, password, userType);

      onLogin(response.token, response.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div id="login-screen" className="max-w-md mx-auto px-4 py-8">
        <header className="bg-gradient-to-r from-primary via-purple-500 to-secondary rounded-2xl p-6 mb-8 text-center shadow-lg">
          <h1 id="app-title-login" className="text-3xl font-bold text-white mb-2">
            MindTrack
          </h1>
          <p id="tagline-login" className="text-white text-sm italic opacity-95">
            Your Mental Health Journey
          </p>
        </header>

        <div id="login-card" className="bg-surface rounded-2xl shadow-xl p-8">
          <h2 id="login-form-title" className="text-2xl font-bold text-center mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-center text-gray-600 mb-6">Select your account type</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              id="patient-type-btn"
              type="button"
              onClick={() => setUserType('patient')}
              className={`user-type-btn p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                userType === 'patient'
                  ? 'bg-primary border-primary text-white scale-105'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              <div className="text-3xl">👤</div>
              <div className="font-semibold">Patient</div>
            </button>
            <button
              id="provider-type-btn"
              type="button"
              onClick={() => setUserType('provider')}
              className={`user-type-btn p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                userType === 'provider'
                  ? 'bg-primary border-primary text-white scale-105'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              <div className="text-3xl">👨‍⚕️</div>
              <div className="font-semibold">Provider</div>
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
              {error}
            </div>
          )}

          <form id={isSignup ? 'signup-form' : 'login-form'} onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="login-username" className="block mb-2 font-semibold text-sm">
                Username
              </label>
              <input
                type="text"
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            {isSignup && (
              <div className="mb-4">
                <label htmlFor="signup-email" className="block mb-2 font-semibold text-sm">
                  Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter email"
                  required
                  autoComplete="email"
                />
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="login-password" className="block mb-2 font-semibold text-sm">
                Password
              </label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={isSignup ? 'Choose password' : 'Enter password'}
                required
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              type="submit"
              id={isSignup ? 'signup-btn' : 'login-btn'}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>

            <button
              type="button"
              id={isSignup ? 'login-toggle' : 'signup-toggle'}
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="w-full mt-3 border-2 border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
            >
              {isSignup ? 'Back to Sign In' : 'Create New Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
