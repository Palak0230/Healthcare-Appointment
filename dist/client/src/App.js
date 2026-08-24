import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { HeartPulse } from 'lucide-react';
export const AppContent = () => {
    const { user, loading } = useAuth();
    const [authView, setAuthView] = useState('LOGIN');
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 space-y-4", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center animate-bounce shadow-lg shadow-sky-500/20", children: _jsx(HeartPulse, { className: "w-7 h-7 text-white" }) }), _jsx("p", { className: "text-xs text-sky-400 font-semibold tracking-wider animate-pulse", children: "Initializing MedCare AI Suite..." })] }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white", children: [_jsx(Navbar, {}), _jsx("main", { className: "flex-1", children: !user ? (authView === 'LOGIN' ? (_jsx(LoginPage, { onSwitchToRegister: () => setAuthView('REGISTER') })) : (_jsx(RegisterPage, { onSwitchToLogin: () => setAuthView('LOGIN') }))) : user.role === 'ADMIN' ? (_jsx(AdminDashboard, {})) : user.role === 'DOCTOR' ? (_jsx(DoctorDashboard, {})) : (_jsx(PatientDashboard, {})) }), _jsx("footer", { className: "border-t border-slate-800/80 py-6 text-center text-xs text-slate-500", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " MedCare AI Healthcare Appointment & Follow-up Platform."] }), _jsxs("div", { className: "flex items-center space-x-4 text-slate-400", children: [_jsx("span", { children: "LLM Pre & Post Visit Engine" }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: "Google Calendar Sync" }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: "Concurrency Lock Engine" })] })] }) })] }));
};
export const App = () => {
    return _jsx(AppContent, {});
};
export default App;
