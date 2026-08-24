import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { HeartPulse } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center animate-bounce shadow-lg shadow-sky-500/20">
          <HeartPulse className="w-7 h-7 text-white" />
        </div>
        <p className="text-xs text-sky-400 font-semibold tracking-wider animate-pulse">Initializing MedCare AI Suite...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {!user ? (
          authView === 'LOGIN' ? (
            <LoginPage onSwitchToRegister={() => setAuthView('REGISTER')} />
          ) : (
            <RegisterPage onSwitchToLogin={() => setAuthView('LOGIN')} />
          )
        ) : user.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : user.role === 'DOCTOR' ? (
          <DoctorDashboard />
        ) : (
          <PatientDashboard />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} MedCare AI Healthcare Appointment & Follow-up Platform.</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>LLM Pre & Post Visit Engine</span>
            <span>•</span>
            <span>Google Calendar Sync</span>
            <span>•</span>
            <span>Concurrency Lock Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
