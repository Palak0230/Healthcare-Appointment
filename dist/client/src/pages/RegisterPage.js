import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Mail, Lock, User as UserIcon, Phone, ArrowRight } from 'lucide-react';
export const RegisterPage = ({ onSwitchToLogin }) => {
    const { registerUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        try {
            await registerUser({ name, email, password, phone, role: 'PATIENT' });
        }
        catch (err) {
            setErrorMsg(err.message || 'Registration failed.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-[calc(100vh-4rem)] flex items-center justify-center p-4", children: _jsxs("div", { className: "glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20", children: _jsx(HeartPulse, { className: "w-7 h-7 text-white" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-100", children: "Create Account" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Register for Patient Portal access" })] }), errorMsg && (_jsx("div", { className: "mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs", children: errorMsg })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1.5", children: "Full Name" }), _jsxs("div", { className: "relative", children: [_jsx(UserIcon, { className: "w-4 h-4 text-slate-500 absolute left-3.5 top-3" }), _jsx("input", { type: "text", required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "Jane Doe", className: "w-full bg-slate-900/90 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1.5", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "w-4 h-4 text-slate-500 absolute left-3.5 top-3" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "jane@example.com", className: "w-full bg-slate-900/90 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1.5", children: "Phone Number" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "w-4 h-4 text-slate-500 absolute left-3.5 top-3" }), _jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "+1 555-0199", className: "w-full bg-slate-900/90 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1.5", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "w-4 h-4 text-slate-500 absolute left-3.5 top-3" }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full bg-slate-900/90 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500" })] })] }), _jsxs("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2", children: [loading ? 'Creating Account...' : 'Register Patient', _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "mt-6 text-center text-xs text-slate-400", children: ["Already have an account?", ' ', _jsx("button", { onClick: onSwitchToLogin, className: "text-sky-400 font-bold hover:underline", children: "Sign In" })] })] }) }));
};
