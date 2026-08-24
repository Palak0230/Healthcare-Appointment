import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
export const UrgencyBadge = ({ level }) => {
    switch (level) {
        case 'HIGH':
            return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 pulse-red", children: [_jsx(AlertTriangle, { className: "w-3.5 h-3.5" }), " High Urgency"] }));
        case 'MEDIUM':
            return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30", children: [_jsx(AlertCircle, { className: "w-3.5 h-3.5" }), " Medium Urgency"] }));
        case 'LOW':
        default:
            return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", children: [_jsx(CheckCircle, { className: "w-3.5 h-3.5" }), " Routine / Low"] }));
    }
};
