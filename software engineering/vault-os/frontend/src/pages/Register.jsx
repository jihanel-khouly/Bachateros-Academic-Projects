import { useState } from 'react';
import { authAPI } from '../api';
import { Loader2 } from 'lucide-react';

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(email, username, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onRegisterSuccess(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-container">
      <div className="w-full max-w-md px-6">
        <div className="red-divider mb-12" />

        <h1 className="text-brutalist-xl text-white mb-2">CREATE VAULT</h1>
        <p className="text-gray-400 mb-8 text-sm uppercase tracking-wider">
          Register for secure credential management
        </p>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-bold uppercase mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-brutalist w-full"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold uppercase mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="input-brutalist w-full"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="input-brutalist w-full"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold uppercase mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="input-brutalist w-full"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-brutalist w-full flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'REGISTER'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-red-500 hover:text-red-400 font-bold uppercase tracking-wider"
            >
              Login
            </button>
          </p>
        </div>

        <div className="red-divider mt-12" />
      </div>
    </div>
  );
}
