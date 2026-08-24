import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, LogOut, Shield, HeartPulse, Sparkles, Database } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickDemoLogin, seedData } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold gradient-text tracking-tight">MedCare AI</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Healthcare Suite
            </span>
          </div>
        </div>

        {/* Quick Demo Role Switcher Pill Bar */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
          <span className="text-xs text-slate-400 font-medium px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Demo Persona:
          </span>
          <button
            onClick={() => quickDemoLogin('PATIENT')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              user?.role === 'PATIENT'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Patient (John)
          </button>
          <button
            onClick={() => quickDemoLogin('DOCTOR')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              user?.role === 'DOCTOR'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Doctor (Dr. Smith)
          </button>
          <button
            onClick={() => quickDemoLogin('ADMIN')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Admin Portal
          </button>
          <button
            onClick={seedData}
            title="Reset & Seed Database"
            className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 transition-all flex items-center gap-1"
          >
            <Database className="w-3.5 h-3.5" /> Seed DB
          </button>
        </div>

        {/* User Account & Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                <p className="text-xs text-sky-400 capitalize font-medium flex items-center justify-end gap-1">
                  {user.role === 'ADMIN' && <Shield className="w-3 h-3 text-indigo-400" />}
                  {user.role === 'DOCTOR' && <Stethoscope className="w-3 h-3 text-teal-400" />}
                  {user.role === 'PATIENT' && <User className="w-3 h-3 text-sky-400" />}
                  {user.role.toLowerCase()}
                </p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 border border-slate-700/50 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => quickDemoLogin('PATIENT')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-500 text-white hover:bg-sky-400 shadow-md shadow-sky-500/20 transition-all"
              >
                Explore Demo
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
