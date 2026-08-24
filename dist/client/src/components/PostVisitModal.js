import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { apiRequest } from '../services/api';
import { Stethoscope, Sparkles, CheckCircle2, AlertCircle, X, Pill, FileText } from 'lucide-react';
export const PostVisitModal = ({ appointmentId, patientName, symptoms, onClose, onSuccess, }) => {
    const [rawNotes, setRawNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rawNotes.trim() || !prescription.trim()) {
            setErrorMsg('Please complete both clinical notes and prescription details.');
            return;
        }
        setSubmitting(true);
        setErrorMsg(null);
        try {
            await apiRequest(`/appointments/${appointmentId}/post-visit`, 'POST', {
                rawNotes: rawNotes.trim(),
                prescription: prescription.trim(),
            });
            onSuccess();
        }
        catch (err) {
            setErrorMsg(err.message || 'Failed to submit post-visit report.');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4", children: _jsxs("div", { className: "glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "px-6 py-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white", children: _jsx(Stethoscope, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-slate-100", children: "Submit Clinical Notes & Prescription" }), _jsxs("p", { className: "text-xs text-teal-400 font-medium", children: ["Patient: ", patientName] })] })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "px-6 py-3 bg-slate-800/60 border-b border-slate-800 text-xs text-slate-300", children: [_jsx("strong", { children: "Reported Pre-visit Symptoms:" }), " \"", symptoms, "\""] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-5 overflow-y-auto flex-1", children: [errorMsg && (_jsxs("div", { className: "p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), errorMsg] })), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5", children: [_jsx(FileText, { className: "w-4 h-4 text-teal-400" }), " Clinical Diagnosis & Physician Notes ", _jsx("span", { className: "text-rose-400", children: "*" })] }), _jsx("textarea", { rows: 3, required: true, value: rawNotes, onChange: (e) => setRawNotes(e.target.value), placeholder: "e.g. Acute tension headache secondary to cervical muscle spasm. Normal cranial nerve exam...", className: "w-full bg-slate-900/90 text-slate-100 text-xs p-3.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5", children: [_jsx(Pill, { className: "w-4 h-4 text-sky-400" }), " Prescribed Medications & Dosages ", _jsx("span", { className: "text-rose-400", children: "*" })] }), _jsx("textarea", { rows: 3, required: true, value: prescription, onChange: (e) => setPrescription(e.target.value), placeholder: "e.g. Ibuprofen 400mg twice daily with food for 5 days. Muscle relaxant 10mg at bedtime...", className: "w-full bg-slate-900/90 text-slate-100 text-xs p-3.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" })] }), _jsxs("div", { className: "bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-2", children: [_jsxs("h4", { className: "text-xs font-bold text-slate-200 flex items-center gap-1.5", children: [_jsx(Sparkles, { className: "w-4 h-4 text-amber-400" }), " AI Patient Conversion Pipeline"] }), _jsx("p", { className: "text-[11px] text-slate-300", children: "Upon submission, LLM will automatically convert your clinical observations into a clear, patient-friendly summary, generate medication reminder schedules, and email the patient." })] }), _jsxs("div", { className: "pt-3 border-t border-slate-800 flex items-center justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all", children: "Cancel" }), _jsx("button", { type: "submit", disabled: submitting, className: "px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs hover:from-teal-400 hover:to-emerald-500 shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 disabled:opacity-50", children: submitting ? (_jsxs(_Fragment, { children: [_jsx(Sparkles, { className: "w-4 h-4 animate-spin text-amber-300" }), "Generating AI Patient Summary..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "Complete Consultation & Send Summary"] })) })] })] })] }) }));
};
