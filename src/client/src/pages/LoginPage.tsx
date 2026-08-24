import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your Healthcare Portal</p>
        </div>

        {/* Quick Demo Credentials Switcher */}
        <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 mb-6">
          <p className="text-[11px] font-semibold text-slate-300 mb-2 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> One-Click Demo Personas:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <button
              onClick={() => quickDemoLogin('PATIENT')}
              className="py-1.5 px-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-xl text-[11px] font-semibold transition-all border border-sky-500/30"
            >
              Patient
            </button>
            <button
              onClick={() => quickDemoLogin('DOCTOR')}
              className="py-1.5 px-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-xl text-[11px] font-semibold transition-all border border-teal-500/30"
            >
              Doctor
            </button>
            <button
              onClick={() => quickDemoLogin('ADMIN')}
              className="py-1.5 px-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl text-[11px] font-semibold transition-all border border-indigo-500/30"
            >
              Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900/90 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-sky-400 font-bold hover:underline">
            Register Patient Account
          </button>
        </div>

      </div>
    </div>
  );
};
