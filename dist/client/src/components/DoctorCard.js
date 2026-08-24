import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar, Clock, DollarSign, Award, ChevronRight } from 'lucide-react';
export const DoctorCard = ({ doctor, onSelectDoctor, isSelected }) => {
    const handleSelect = () => {
        onSelectDoctor(doctor);
        setTimeout(() => {
            document.getElementById('slot-picker-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    };
    return (_jsxs("div", { onClick: handleSelect, className: `glass-panel glass-panel-hover rounded-2xl p-6 relative transition-all cursor-pointer border ${isSelected
            ? 'border-sky-500 bg-sky-950/40 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
            : 'border-slate-800 hover:border-slate-700'}`, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-sky-500/20", children: doctor.user.name.split(' ').map(n => n[0]).join('') }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-slate-100 flex items-center gap-2", children: doctor.user.name }), _jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mt-1", children: [_jsx(Award, { className: "w-3.5 h-3.5" }), " ", doctor.specialization] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-bold text-emerald-400 flex items-center justify-end", children: [_jsx(DollarSign, { className: "w-4 h-4" }), doctor.consultationFee.toFixed(2)] }), _jsx("span", { className: "text-xs text-slate-400", children: "per consultation" })] })] }), doctor.bio && (_jsx("p", { className: "text-xs text-slate-300 mt-4 line-clamp-2 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800", children: doctor.bio })), _jsxs("div", { className: "mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-sky-400" }), doctor.workingHoursStart, " - ", doctor.workingHoursEnd] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-indigo-400" }), doctor.slotDurationMinutes, " mins / slot"] })] }), _jsxs("button", { onClick: (e) => {
                            e.stopPropagation();
                            handleSelect();
                        }, className: `px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${isSelected
                            ? 'bg-sky-500 text-white shadow-sky-500/30'
                            : 'bg-slate-800 text-sky-400 hover:bg-sky-500 hover:text-white border border-slate-700/60'}`, children: [isSelected ? 'Selected' : 'Book Appointment', _jsx(ChevronRight, { className: "w-3.5 h-3.5" })] })] })] }));
};
