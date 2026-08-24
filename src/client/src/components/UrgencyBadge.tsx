import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface UrgencyBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ level }) => {
  switch (level) {
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 pulse-red">
          <AlertTriangle className="w-3.5 h-3.5" /> High Urgency
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-3.5 h-3.5" /> Medium Urgency
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle className="w-3.5 h-3.5" /> Routine / Low
        </span>
      );
  }
};
