import { useState } from 'react';
import { masterPasswordAPI } from '../api';
import { Loader2 } from 'lucide-react';

export default function MasterPasswordSetup({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

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
      await masterPasswordAPI.setup(password);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set master password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-brutalist max-w-md mx-auto">
      <div className="red-divider mb-6" />

      <h2 className="text-brutalist-md text-white mb-2">SECURE YOUR VAULT</h2>
      <p className="text-gray-400 text-sm mb-6 uppercase tracking-wider">
        Set a master password to protect your credentials
      </p>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white text-sm font-bold uppercase mb-2">
            Master Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            className="input-brutalist w-full"
            disabled={isLoading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label className="block text-white text-sm font-bold uppercase mb-2">
            Confirm Password
          </label>
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
              Setting up...
            </>
          ) : (
            'SET MASTER PASSWORD'
          )}
        </button>
      </form>

      <div className="red-divider mt-6" />
    </div>
  );
}
