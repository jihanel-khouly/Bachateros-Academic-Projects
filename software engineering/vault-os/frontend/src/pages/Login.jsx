import { useState } from 'react';
import { authAPI } from '../api';
import { Loader2 } from 'lucide-react';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // 1. تخزين البيانات في الـ LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 2. تحديث حالة التطبيق الأساسية
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }

      // 3. الحل الجذري: توجيه يدوي مع ريفرش لضمان نظافة الـ State
      // ده هيمنع ظهور شاشة الـ Unlock القديمة لو الداتا اتمسحت
      window.location.href = '/dashboard';

    } catch (err) {
      console.error("Login attempt failed:", err);
      setError(err.response?.data?.error || 'Invalid credentials or server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-container min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
        <div className="red-divider mb-12" />

        <h1 className="text-brutalist-xl text-white mb-2 tracking-tighter">VAULT ACCESS</h1>
        <p className="text-gray-500 mb-8 text-xs uppercase tracking-[0.3em] font-bold">
          Secure Credential Management System
        </p>

        {error && (
          <div className="bg-red-950/30 border-l-4 border-red-600 text-red-500 px-4 py-3 mb-6 text-xs font-black uppercase tracking-widest animate-shake">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-zinc-500 text-[10px] font-black uppercase mb-2 tracking-widest group-focus-within:text-red-500 transition-colors">
              Identity Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-brutalist w-full bg-zinc-900/50 border-zinc-800 focus:border-red-600 transition-all text-white placeholder:text-zinc-700"
              disabled={isLoading}
              required
            />
          </div>

          <div className="group">
            <label className="block text-zinc-500 text-[10px] font-black uppercase mb-2 tracking-widest group-focus-within:text-red-500 transition-colors">
              Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-brutalist w-full bg-zinc-900/50 border-zinc-800 focus:border-red-600 transition-all text-white placeholder:text-zinc-700"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-brutalist w-full flex items-center justify-center py-4 bg-white text-black hover:bg-red-600 hover:text-white transition-all duration-300 font-black tracking-widest text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AUTHENTICATING...
              </>
            ) : (
              'AUTHORIZE ACCESS'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
            New operator?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-red-500 hover:text-white transition-colors ml-1 underline decoration-2 underline-offset-4"
            >
              Initialize Account
            </button>
          </p>
        </div>

        <div className="red-divider mt-12" />
      </div>
    </div>
  );
}