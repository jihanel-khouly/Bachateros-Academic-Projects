import { useState, useEffect } from 'react';
import { masterPasswordAPI } from '../api';
import MasterPasswordSetup from '../components/MasterPasswordSetup';
import CredentialsVault from '../components/CredentialsVault';
import { LogOut, Loader2, ShieldAlert } from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const [masterPasswordSet, setMasterPasswordSet] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkMasterPasswordStatus();
  }, []);

  const checkMasterPasswordStatus = async () => {
    try {
      // بنحاول نكلم السيرفر
      const response = await masterPasswordAPI.verify('CHECK_STATUS');
      
      // لو السيرفر رد بـ success، يبقى فيه باسورد فعلاً
      if (response.data && response.data.verified) {
        setMasterPasswordSet(true);
      } else {
        setMasterPasswordSet(false);
      }
    } catch (err) {
      // أهم جزء: لو السيرفر رد بـ 401 (Unauthorized) يبقى الباسورد موجود بس غلط
      if (err.response && err.response.status === 401) {
        setMasterPasswordSet(true);
      } 
      // في أي حالة تانية (404، 400، أو حتى لو السيرفر واقع)
      // هنوديك لشاشة الـ SETUP عشان تقدر تسجل من جديد
      else {
        console.log("Status: No master password found or server error. Redirecting to setup.");
        setMasterPasswordSet(false);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMasterPasswordSetup = () => {
    setMasterPasswordSet(true);
    // بعد ما يسجل بنعمل فحص تاني للتأكد
    checkMasterPasswordStatus();
  };

  const handleMasterPasswordSubmit = async (password) => {
    setError('');
    try {
      const response = await masterPasswordAPI.verify(password);
      if (response.data.verified) {
        setMasterPassword(password);
      } else {
        setError('Invalid master password');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
          <p className="text-zinc-500 mt-4 uppercase text-xs tracking-widest font-bold">Initializing Vault.OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter italic">VAULT.OS</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
              Active Session: <span className="text-red-500 font-bold">{user.username}</span>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest border border-zinc-800 px-4 py-2 hover:bg-zinc-900"
          >
            <LogOut className="h-4 w-4 group-hover:text-red-500 transition-colors" />
            Terminal Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {!masterPasswordSet ? (
          // هنا هيفتح صفحة الـ Setup اللي أنت عاوزها
          <MasterPasswordSetup onSuccess={handleMasterPasswordSetup} />
        ) : !masterPassword ? (
          // هنا صفحة الـ Unlock لو الباسورد موجود
          <div className="max-w-md mx-auto">
            <div className="bg-zinc-900 border-2 border-zinc-800 p-8 shadow-[10px_10px_0px_0px_rgba(220,38,38,1)]">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="text-red-600 h-6 w-6" />
                <h2 className="text-xl font-black uppercase tracking-tight">Access Restricted</h2>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleMasterPasswordSubmit(e.target.password.value);
              }} className="space-y-6">
                {error && (
                  <div className="bg-red-950/50 border border-red-500/50 text-red-500 p-4 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                    SYSTEM ERROR: {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em]">Master Key</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="ENTER DECRYPTION KEY"
                    className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-red-600 outline-none transition-all font-mono placeholder:text-zinc-800"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-white text-black hover:bg-red-600 hover:text-white font-black py-4 uppercase text-xs tracking-[0.2em] transition-all duration-300">
                  Verify Identity
                </button>
              </form>
            </div>
          </div>
        ) : (
          <CredentialsVault masterPassword={masterPassword} />
        )}
      </main>
    </div>
  );
}