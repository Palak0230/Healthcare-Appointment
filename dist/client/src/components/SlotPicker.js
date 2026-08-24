import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Calendar, Clock, AlertCircle, Lock, CheckCircle2, Timer } from 'lucide-react';
export const SlotPicker = ({ doctorId, doctorName, onSlotSelected }) => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return tomorrow.toISOString().split('T')[0];
    });
    const [slots, setSlots] = useState([]);
    const [isOnLeave, setIsOnLeave] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [holdingSlot, setHoldingSlot] = useState(false);
    const [holdId, setHoldId] = useState(null);
    const [holdExpiresAt, setHoldExpiresAt] = useState(null);
    const [timerLeft, setTimerLeft] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);
    const fetchSlots = async (date) => {
        setLoading(true);
        setErrorMsg(null);
        setSelectedSlot(null);
        try {
            const res = await apiRequest(`/doctors/${doctorId}/slots?date=${date}`);
            setIsOnLeave(res.isOnLeave);
            setSlots(res.slots);
        }
        catch (err) {
            setErrorMsg(err.message || 'Failed to fetch doctor slots');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchSlots(selectedDate);
    }, [doctorId, selectedDate]);
    // Hold Timer Countdown
    useEffect(() => {
        if (!holdExpiresAt)
            return;
        const interval = setInterval(() => {
            const diff = Math.max(0, Math.floor((holdExpiresAt.getTime() - Date.now()) / 1000));
            setTimerLeft(diff);
            if (diff === 0) {
                setHoldId(null);
                setHoldExpiresAt(null);
                setSelectedSlot(null);
                setErrorMsg('Slot hold expired. Please re-select your preferred slot.');
                fetchSlots(selectedDate);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [holdExpiresAt, selectedDate]);
    const handleHoldSlot = async (slot) => {
        if (!slot.available)
            return;
        setHoldingSlot(true);
        setErrorMsg(null);
        try {
            const res = await apiRequest('/appointments/hold-slot', 'POST', {
                doctorId,
                date: selectedDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
            });
            setSelectedSlot(slot);
            setHoldId(res.holdId);
            setHoldExpiresAt(new Date(res.expiresAt));
            // Automatically proceed to symptom assessment modal
            onSlotSelected(selectedDate, slot, res.holdId);
        }
        catch (err) {
            setErrorMsg(err.message || 'Failed to hold slot');
            fetchSlots(selectedDate);
        }
        finally {
            setHoldingSlot(false);
        }
    };
    const handleProceedToSymptoms = () => {
        if (selectedSlot && holdId) {
            onSlotSelected(selectedDate, selectedSlot, holdId);
        }
    };
    return (_jsxs("div", { className: "glass-panel rounded-2xl p-6 border border-slate-800", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-bold text-slate-100 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-sky-400" }), " Choose Consultation Slot"] }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: ["Select a date and available time slot for Dr. ", doctorName] })] }), _jsxs("div", { className: "flex items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700/60", children: [_jsx("label", { className: "text-xs font-semibold text-slate-300 px-2", children: "Date:" }), _jsx("input", { type: "date", min: new Date().toISOString().split('T')[0], value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "bg-slate-800 text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 font-medium" })] })] }), holdId && holdExpiresAt && (_jsxs("div", { className: "mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Timer, { className: "w-5 h-5 text-amber-400 animate-pulse" }), _jsxs("div", { children: [_jsxs("p", { className: "text-xs font-bold text-amber-300", children: ["Slot ", selectedSlot?.startTime, " - ", selectedSlot?.endTime, " Temporarily Reserved!"] }), _jsx("p", { className: "text-xs text-slate-300", children: "Complete symptoms intake before the hold timer expires to confirm." })] })] }), _jsx("div", { className: "text-right", children: _jsxs("span", { className: "text-lg font-extrabold text-amber-400 font-mono", children: [Math.floor(timerLeft / 60), ":", (timerLeft % 60).toString().padStart(2, '0')] }) })] })), errorMsg && (_jsxs("div", { className: "mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), errorMsg] })), _jsx("div", { className: "mt-6", children: loading ? (_jsxs("div", { className: "py-12 text-center text-slate-400 text-xs animate-pulse flex flex-col items-center gap-2", children: [_jsx(Clock, { className: "w-6 h-6 text-sky-400 animate-spin" }), "Calculating live doctor slot availability..."] })) : isOnLeave ? (_jsxs("div", { className: "py-10 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6", children: [_jsx(AlertCircle, { className: "w-8 h-8 text-rose-400 mx-auto mb-2" }), _jsx("h4", { className: "text-sm font-bold text-rose-300", children: "Doctor on Leave" }), _jsxs("p", { className: "text-xs text-slate-400 mt-1", children: ["Dr. ", doctorName, " is unavailable on ", selectedDate, ". Please select another date."] })] })) : slots.length === 0 ? (_jsx("div", { className: "py-10 text-center text-slate-400 text-xs", children: "No working hours scheduled for this date." })) : (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400 mb-3 px-1", children: [_jsxs("span", { className: "font-semibold text-slate-300", children: ["Available Slots for ", selectedDate, ":"] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" }), " Available"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" }), " Reserved"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" }), " Booked"] })] })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3", children: slots.map((slot) => {
                                const isSelected = selectedSlot?.startTime === slot.startTime;
                                return (_jsxs("button", { disabled: !slot.available || holdingSlot, onClick: () => handleHoldSlot(slot), className: `py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all border ${isSelected
                                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-md shadow-amber-500/20'
                                        : slot.available
                                            ? 'bg-slate-800/80 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 border-slate-700/60'
                                            : 'bg-slate-900/60 text-slate-600 border-slate-800/80 cursor-not-allowed opacity-60'}`, children: [_jsxs("span", { className: "flex items-center gap-1", children: [isSelected ? (_jsx(CheckCircle2, { className: "w-3.5 h-3.5" })) : !slot.available ? (_jsx(Lock, { className: "w-3 h-3 text-slate-500" })) : (_jsx(Clock, { className: "w-3 h-3 text-emerald-400" })), slot.startTime] }), _jsx("span", { className: "text-[10px] opacity-75 mt-0.5", children: slot.endTime })] }, slot.startTime));
                            }) }), selectedSlot && holdId && (_jsx("div", { className: "mt-6 pt-4 border-t border-slate-800 flex items-center justify-end", children: _jsx("button", { onClick: handleProceedToSymptoms, className: "px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2", children: "Proceed to Symptom Assessment & Confirm" }) }))] })) })] }));
};
