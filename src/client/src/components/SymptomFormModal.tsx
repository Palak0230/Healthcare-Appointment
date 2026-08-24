import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { UrgencyBadge } from './UrgencyBadge';
import { Stethoscope, Sparkles, CheckCircle2, AlertCircle, X, HelpCircle, FileText } from 'lucide-react';

interface SymptomFormModalProps {
  doctorName: string;
  specialization: string;
  date: string;
  startTime: string;
  endTime: string;
  doctorId: string;
  onClose: () => void;
  onSuccess: (appointment: any) => void;
}

export const SymptomFormModal: React.FC<SymptomFormModalProps> = ({
  doctorName,
  specialization,
  date,
  startTime,
  endTime,
  doctorId,
  onClose,
  onSuccess,
}) => {
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || symptoms.trim().length < 10) {
      setErrorMsg('Please describe your symptoms in at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiRequest('/appointments/book', 'POST', {
        doctorId,
        date,
        startTime,
        endTime,
        symptoms: symptoms.trim(),
      });

      onSuccess(res.appointment);
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking failed. Slot may have expired or been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Pre-Visit Symptom Assessment</h3>
              <p className="text-xs text-sky-400 font-medium">Dr. {doctorName} • {specialization}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Appointment Details Pill */}
        <div className="px-6 py-3 bg-sky-500/10 border-b border-sky-500/20 text-xs font-semibold text-sky-300 flex items-center justify-between">
          <span>📅 Date: <strong>{date}</strong></span>
          <span>⏰ Time Slot: <strong>{startTime} - {endTime}</strong></span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-400" />
              Describe your symptoms & reason for visit <span className="text-rose-400">*</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Our AI engine will analyze your input to generate a pre-visit summary, urgency score, and suggested questions for Dr. {doctorName}.
            </p>
            <textarea
              rows={4}
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Experiencing persistent dull headache behind left eye for 2 days, mild nausea, exacerbated by bright light..."
              className="w-full bg-slate-900/90 text-slate-100 text-xs p-3.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all leading-relaxed"
            />
          </div>

          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> What happens next?
            </h4>
            <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
              <li>AI categorizes symptom urgency level (Low / Medium / High) for the physician.</li>
              <li>Chief complaint summary is recorded in doctor's portal queue.</li>
              <li>Email confirmation and Google Calendar event invitation generated automatically.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  Analyzing Symptoms & Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Submit Symptom Form
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
