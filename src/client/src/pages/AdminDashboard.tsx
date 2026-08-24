import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { DoctorCard, Doctor } from '../components/DoctorCard';
import { SlotPicker, Slot } from '../components/SlotPicker';
import { SymptomFormModal } from '../components/SymptomFormModal';
import { Shield, Users, Stethoscope, Calendar, Mail, AlertTriangle, Plus, RefreshCw, CheckCircle2, Clock, DollarSign, Award, X } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const [doctorLeaves, setDoctorLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Doctor Booking Modal state
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [bookingSlot, setBookingSlot] = useState<{ date: string; slot: Slot; holdId: string } | null>(null);
  const [showSymptomModal, setShowSymptomModal] = useState<boolean>(false);

  // New Doctor Form Modal state
  const [showAddDoctorModal, setShowAddDoctorModal] = useState<boolean>(false);
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('doctor123');
  const [docSpec, setDocSpec] = useState('Cardiology');
  const [docStart, setDocStart] = useState('09:00');
  const [docEnd, setDocEnd] = useState('17:00');
  const [docDuration, setDocDuration] = useState('30');
  const [docFee, setDocFee] = useState('150');
  const [docBio, setDocBio] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, docRes, notifRes, leaveRes] = await Promise.all([
        apiRequest<{ stats: any }>('/admin/stats'),
        apiRequest<{ doctors: Doctor[] }>('/doctors'),
        apiRequest<{ logs: any[] }>('/admin/notifications'),
        apiRequest<{ leaves: any[] }>('/admin/leaves'),
      ]);

      setStats(statsRes.stats);
      setDoctors(docRes.doctors);
      setNotificationLogs(notifRes.logs);
      setDoctorLeaves(leaveRes.leaves);
    } catch (err) {
      console.error('Failed fetching admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDoc(true);
    setErrorMsg(null);

    try {
      await apiRequest('/auth/register', 'POST', {
        name: docName,
        email: docEmail,
        password: docPassword,
        role: 'DOCTOR',
        specialization: docSpec,
        workingHoursStart: docStart,
        workingHoursEnd: docEnd,
        slotDurationMinutes: Number(docDuration),
        consultationFee: Number(docFee),
        bio: docBio,
      });

      setShowAddDoctorModal(false);
      fetchAdminData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create doctor profile');
    } finally {
      setSubmittingDoc(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-400" /> Admin Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">System design, doctor scheduling controls, & notification audit logs.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddDoctorModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-sky-400 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Doctor Profile
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" /> Active Doctors
            </p>
            <p className="text-xl font-black text-slate-100 mt-1">{stats.totalDoctors}</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-400" /> Registered Patients
            </p>
            <p className="text-xl font-black text-slate-100 mt-1">{stats.totalPatients}</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Total Bookings
            </p>
            <p className="text-xl font-black text-slate-100 mt-1">{stats.totalAppointments}</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
            </p>
            <p className="text-xl font-black text-emerald-400 mt-1">{stats.completedAppointments}</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Active Leaves
            </p>
            <p className="text-xl font-black text-amber-400 mt-1">{stats.activeLeaves}</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-purple-400" /> Notifications Sent
            </p>
            <p className="text-xl font-black text-purple-300 mt-1">{stats.totalNotifications}</p>
          </div>
        </div>
      )}

      {/* Main Admin Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Doctor Profiles Management (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" /> Doctor Roster & Schedules ({doctors.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onSelectDoctor={(doc) => setSelectedDoctorForBooking(doc)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Notification Logs & Doctor Leave Log (1 col) */}
        <div className="space-y-6">
          
          {/* Notification Audit Log */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" /> Notification Audit Log
            </h3>

            {notificationLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No notifications logged yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notificationLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate max-w-[180px]">{log.recipientEmail}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{log.subject}</p>
                    <p className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Leave Conflict Tracker */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Doctor Leave History ({doctorLeaves.length})
            </h3>

            {doctorLeaves.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No leaves recorded across doctors.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {doctorLeaves.map((leave) => (
                  <div key={leave.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Dr. {leave.doctor?.user?.name}</span>
                      <span className="text-amber-400 font-mono font-bold">{leave.leaveDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Reason: {leave.reason || 'Leave'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Add New Doctor Profile Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-400" /> Create Doctor Profile
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Doctor Full Name</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Dr. Alexander Vance"
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={docEmail}
                    onChange={(e) => setDocEmail(e.target.value)}
                    placeholder="dr.vance@clinic.com"
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    value={docSpec}
                    onChange={(e) => setDocSpec(e.target.value)}
                    placeholder="e.g. Cardiology"
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    required
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={docStart}
                    onChange={(e) => setDocStart(e.target.value)}
                    placeholder="09:00"
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={docEnd}
                    onChange={(e) => setDocEnd(e.target.value)}
                    placeholder="17:00"
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slot Duration (m)</label>
                  <input
                    type="number"
                    required
                    value={docDuration}
                    onChange={(e) => setDocDuration(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Doctor Bio</label>
                <textarea
                  rows={2}
                  value={docBio}
                  onChange={(e) => setDocBio(e.target.value)}
                  placeholder="Medical background, certifications, and experience..."
                  className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDoc}
                  className="px-6 py-2 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400"
                >
                  {submittingDoc ? 'Creating...' : 'Save Doctor Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Doctor Slot & Booking Modal */}
      {selectedDoctorForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-700 p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-400" /> Dr. {selectedDoctorForBooking.user.name} Schedule & Slots
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDoctorForBooking.specialization} • ${selectedDoctorForBooking.consultationFee.toFixed(2)} / session</p>
              </div>
              <button
                onClick={() => setSelectedDoctorForBooking(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SlotPicker
              doctorId={selectedDoctorForBooking.id}
              doctorName={selectedDoctorForBooking.user.name}
              onSlotSelected={(date, slot, holdId) => {
                setBookingSlot({ date, slot, holdId });
                setShowSymptomModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Symptom Assessment Modal */}
      {showSymptomModal && bookingSlot && selectedDoctorForBooking && (
        <SymptomFormModal
          doctorId={selectedDoctorForBooking.id}
          doctorName={selectedDoctorForBooking.user.name}
          specialization={selectedDoctorForBooking.specialization}
          date={bookingSlot.date}
          startTime={bookingSlot.slot.startTime}
          endTime={bookingSlot.slot.endTime}
          onClose={() => setShowSymptomModal(false)}
          onSuccess={() => {
            setShowSymptomModal(false);
            setBookingSlot(null);
            setSelectedDoctorForBooking(null);
            fetchAdminData();
          }}
        />
      )}

    </div>
  );
};
