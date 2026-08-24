import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Calendar, Clock, AlertCircle, Lock, CheckCircle2, Timer } from 'lucide-react';

export interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
}

interface SlotPickerProps {
  doctorId: string;
  doctorName: string;
  onSlotSelected: (date: string, slot: Slot, holdId: string) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({ doctorId, doctorName, onSlotSelected }) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isOnLeave, setIsOnLeave] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [holdingSlot, setHoldingSlot] = useState<boolean>(false);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [timerLeft, setTimerLeft] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSlots = async (date: string) => {
    setLoading(true);
    setErrorMsg(null);
    setSelectedSlot(null);
    try {
      const res = await apiRequest<{ date: string; isOnLeave: boolean; slots: Slot[] }>(
        `/doctors/${doctorId}/slots?date=${date}`
      );
      setIsOnLeave(res.isOnLeave);
      setSlots(res.slots);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch doctor slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [doctorId, selectedDate]);

  // Hold Timer Countdown
  useEffect(() => {
    if (!holdExpiresAt) return;
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

  const handleHoldSlot = async (slot: Slot) => {
    if (!slot.available) return;
    setHoldingSlot(true);
    setErrorMsg(null);

    try {
      const res = await apiRequest<{ holdId: string; expiresAt: string }>('/appointments/hold-slot', 'POST', {
        doctorId,
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });

      setSelectedSlot(slot);
      setHoldId(res.holdId);
      setHoldExpiresAt(new Date(res.expiresAt));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to hold slot');
      fetchSlots(selectedDate);
    } finally {
      setHoldingSlot(false);
    }
  };

  const handleProceedToSymptoms = () => {
    if (selectedSlot && holdId) {
      onSlotSelected(selectedDate, selectedSlot, holdId);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" /> Choose Consultation Slot
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Select a date and available time slot for Dr. {doctorName}</p>
        </div>

        {/* Date Input */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700/60">
          <label className="text-xs font-semibold text-slate-300 px-2">Date:</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-800 text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>
      </div>

      {/* Active Temporary Slot Hold Banner */}
      {holdId && holdExpiresAt && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-amber-300">
                Slot {selectedSlot?.startTime} - {selectedSlot?.endTime} Temporarily Reserved!
              </p>
              <p className="text-xs text-slate-300">Complete symptoms intake before the hold timer expires to confirm.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-amber-400 font-mono">
              {Math.floor(timerLeft / 60)}:{(timerLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Slots Body */}
      <div className="mt-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-sky-400 animate-spin" />
            Calculating live doctor slot availability...
          </div>
        ) : isOnLeave ? (
          <div className="py-10 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-rose-300">Doctor on Leave</h4>
            <p className="text-xs text-slate-400 mt-1">Dr. {doctorName} is unavailable on {selectedDate}. Please select another date.</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">No working hours scheduled for this date.</div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
              <span className="font-semibold text-slate-300">Available Slots for {selectedDate}:</span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Available</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Reserved</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span> Booked</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                return (
                  <button
                    key={slot.startTime}
                    disabled={!slot.available || holdingSlot}
                    onClick={() => handleHoldSlot(slot)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-md shadow-amber-500/20'
                        : slot.available
                        ? 'bg-slate-800/80 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 border-slate-700/60'
                        : 'bg-slate-900/60 text-slate-600 border-slate-800/80 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : !slot.available ? (
                        <Lock className="w-3 h-3 text-slate-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-emerald-400" />
                      )}
                      {slot.startTime}
                    </span>
                    <span className="text-[10px] opacity-75 mt-0.5">{slot.endTime}</span>
                  </button>
                );
              })}
            </div>

            {/* Confirm Hold Action */}
            {selectedSlot && holdId && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={handleProceedToSymptoms}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
                >
                  Proceed to Symptom Assessment & Confirm
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
