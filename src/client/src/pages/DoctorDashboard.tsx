import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { PostVisitModal } from '../components/PostVisitModal';
import { Stethoscope, Calendar, Clock, User, AlertTriangle, FileText, CheckCircle2, Plus, Trash2, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Leave Form state
  const [leaveDate, setLeaveDate] = useState<string>('');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [submittingLeave, setSubmittingLeave] = useState<boolean>(false);
  const [leaveAlert, setLeaveAlert] = useState<string | null>(null);

  // Post Visit Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [appRes, doctorRes] = await Promise.all([
        apiRequest<{ appointments: any[] }>('/appointments'),
        user?.doctorProfile?.id ? apiRequest<{ doctor: any }>(`/doctors/${user.doctorProfile.id}`) : Promise.resolve({ doctor: null }),
      ]);

      setAppointments(appRes.appointments);
      if (doctorRes.doctor && doctorRes.doctor.leaves) {
        setLeaves(doctorRes.doctor.leaves);
      }
    } catch (err) {
      console.error('Failed fetching doctor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate || !user?.doctorProfile?.id) return;
    setSubmittingLeave(true);
    setLeaveAlert(null);

    try {
      const res = await apiRequest('/doctors/leave', 'POST', {
        doctorId: user.doctorProfile.id,
        leaveDate,
        reason: leaveReason,
      });

      setLeaveAlert(res.message);
      setLeaveDate('');
      setLeaveReason('');
      fetchDoctorData();
    } catch (err: any) {
      setLeaveAlert(err.message || 'Failed to record leave');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleRemoveLeave = async (leaveId: string) => {
    try {
      await apiRequest(`/doctors/leave/${leaveId}`, 'DELETE');
      fetchDoctorData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove leave');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Doctor Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-500/20">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">{user?.name}</h1>
            <p className="text-xs text-teal-400 font-semibold">{user?.doctorProfile?.specialization || 'Physician Specialist'}</p>
            <p className="text-xs text-slate-400 mt-1">
              Working Hours: {user?.doctorProfile?.workingHoursStart} - {user?.doctorProfile?.workingHoursEnd} ({user?.doctorProfile?.slotDurationMinutes}m slots)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-center">
          <div className="bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Appointments</p>
            <p className="text-lg font-extrabold text-slate-100">{appointments.length}</p>
          </div>
          <div className="bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Scheduled Leaves</p>
            <p className="text-lg font-extrabold text-amber-400">{leaves.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Patient Appointment Queue & AI Summaries (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" /> Patient Consultation Queue
            </h2>
            <span className="text-xs text-slate-400">Ordered by date & AI urgency score</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
              Loading doctor schedule...
            </div>
          ) : appointments.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 text-slate-400 text-xs">
              No appointments scheduled.
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((app) => {
                const suggestedQs: string[] = app.symptomSummary?.suggestedQuestions
                  ? JSON.parse(app.symptomSummary.suggestedQuestions)
                  : [];

                return (
                  <div key={app.id} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                    
                    {/* Patient Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 font-bold">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-100">{app.patient.name}</h3>
                          <p className="text-xs text-slate-400">{app.patient.email} • {app.patient.phone || 'No phone'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {app.symptomSummary && (
                          <UrgencyBadge level={app.symptomSummary.urgencyLevel} />
                        )}

                        <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                          {app.date} @ {app.startTime}
                        </span>

                        {app.status === 'BOOKED' && (
                          <button
                            onClick={() => setSelectedAppointment(app)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-md hover:from-teal-400 hover:to-emerald-500 transition-all flex items-center gap-1.5"
                          >
                            <FileText className="w-4 h-4" /> Log Post-Visit Notes
                          </button>
                        )}

                        {app.status === 'COMPLETED' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pre-Visit AI Symptom Summary Card */}
                    {app.symptomSummary && (
                      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-sky-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" /> Pre-Visit AI Symptom Summary
                          </span>
                          <span className="text-slate-500 text-[11px]">Auto-generated before visit</span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-200">Chief Complaint:</p>
                          <p className="text-xs text-slate-300 mt-0.5">{app.symptomSummary.chiefComplaint}</p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-200">Raw Patient Intake Symptoms:</p>
                          <p className="text-xs text-slate-400 italic mt-0.5">"{app.symptomSummary.rawSymptoms}"</p>
                        </div>

                        {suggestedQs.length > 0 && (
                          <div className="pt-2 border-t border-slate-800">
                            <p className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                              <HelpCircle className="w-3.5 h-3.5" /> AI Suggested Diagnostic Questions:
                            </p>
                            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                              {suggestedQs.map((q, idx) => (
                                <li key={idx}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Post Visit Summary if Completed */}
                    {app.postVisitSummary && (
                      <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-xs space-y-2">
                        <p className="font-bold text-emerald-300">Submitted Post-Visit Summary & Prescription:</p>
                        <p className="text-slate-300">{app.postVisitSummary.patientFriendlySummary}</p>
                        <p className="text-slate-400 font-mono">Prescription: {app.postVisitSummary.prescription}</p>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Manage Doctor Leaves (1 col) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" /> Schedule Doctor Leave
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mark date as leave. <strong>System automatically cancels existing bookings on that date and dispatches email cancellation alerts to affected patients.</strong>
            </p>

            {leaveAlert && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                {leaveAlert}
              </div>
            )}

            <form onSubmit={handleAddLeave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Leave Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full bg-slate-900/90 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Vacation, Medical Conference"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full bg-slate-900/90 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLeave}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Mark Leave & Notify Patients
              </button>
            </form>

            {/* Scheduled Leaves List */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-3">Your Scheduled Leaves ({leaves.length})</h4>
              {leaves.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No scheduled leaves.</p>
              ) : (
                <div className="space-y-2">
                  {leaves.map((leave) => (
                    <div key={leave.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{leave.leaveDate}</p>
                        <p className="text-[11px] text-slate-400">{leave.reason || 'No reason specified'}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveLeave(leave.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Post Visit Modal */}
      {selectedAppointment && (
        <PostVisitModal
          appointmentId={selectedAppointment.id}
          patientName={selectedAppointment.patient.name}
          symptoms={selectedAppointment.symptomSummary?.rawSymptoms || ''}
          onClose={() => setSelectedAppointment(null)}
          onSuccess={() => {
            setSelectedAppointment(null);
            fetchDoctorData();
          }}
        />
      )}

    </div>
  );
};
