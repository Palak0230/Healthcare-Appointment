import React from 'react';
import { User, Calendar, Clock, DollarSign, Award, ChevronRight } from 'lucide-react';

export interface Doctor {
  id: string; // Profile ID
  specialization: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  slotDurationMinutes: number;
  bio?: string;
  consultationFee: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface DoctorCardProps {
  doctor: Doctor;
  onSelectDoctor: (doctor: Doctor) => void;
  isSelected?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelectDoctor, isSelected }) => {
  const handleSelect = () => {
    onSelectDoctor(doctor);
    setTimeout(() => {
      document.getElementById('slot-picker-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  return (
    <div
      onClick={handleSelect}
      className={`glass-panel glass-panel-hover rounded-2xl p-6 relative transition-all cursor-pointer border ${
        isSelected
          ? 'border-sky-500 bg-sky-950/40 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-sky-500/20">
            {doctor.user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {doctor.user.name}
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mt-1">
              <Award className="w-3.5 h-3.5" /> {doctor.specialization}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-emerald-400 flex items-center justify-end">
            <DollarSign className="w-4 h-4" />{doctor.consultationFee.toFixed(2)}
          </div>
          <span className="text-xs text-slate-400">per consultation</span>
        </div>
      </div>

      {doctor.bio && (
        <p className="text-xs text-slate-300 mt-4 line-clamp-2 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
          {doctor.bio}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            {doctor.workingHoursStart} - {doctor.workingHoursEnd}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {doctor.slotDurationMinutes} mins / slot
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
            isSelected
              ? 'bg-sky-500 text-white shadow-sky-500/30'
              : 'bg-slate-800 text-sky-400 hover:bg-sky-500 hover:text-white border border-slate-700/60'
          }`}
        >
          {isSelected ? 'Selected' : 'Book Appointment'}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
