import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { DoctorCard, Doctor } from '../components/DoctorCard';
import { SlotPicker, Slot } from '../components/SlotPicker';
import { SymptomFormModal } from '../components/SymptomFormModal';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { Search, Calendar, Stethoscope, Clock, Pill, CheckCircle2, XCircle, AlertCircle, FileText, CalendarCheck } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Booking modal state
  const [bookingSlot, setBookingSlot] = useState<{ date: string; slot: Slot; holdId: string } | null>(null);
  const [showSymptomModal, setShowSymptomModal] = useState<boolean>(false);
  
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'BOOK' | 'MY_APPOINTMENTS'>('BOOK');

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      let url = '/doctors';
      const params = new URLSearchParams();
      if (selectedSpecialization !== 'ALL') params.append('specialization', selectedSpecialization);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await apiRequest<{ doctors: Doctor[] }>(url);
      setDoctors(res.doctors);
    } catch (err) {
      console.error('Failed fetching doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await apiRequest<{ appointments: any[] }>('/appointments');
      setAppointments(res.appointments);
    } catch (err) {
      console.error('Failed fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization, searchQuery]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSelectSlot = (date: string, slot: Slot, holdId: string) => {
    setBookingSlot({ date, slot, holdId });
    setShowSymptomModal(true);
  };

  const handleBookingSuccess = (newAppointment: any) => {
    setShowSymptomModal(false);
    setBookingSlot(null);
    setSelectedDoctor(null);
    fetchAppointments();
    setActiveTab('MY_APPOINTMENTS');
  };

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await apiRequest(`/appointments/${id}/cancel`, 'POST', { reason: 'Cancelled by patient' });
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-sky-400" /> Patient Care Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">Book doctor appointments, view AI pre-visit insights, & access post-visit medication schedules.</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('BOOK')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'BOOK'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" /> Book Specialist
          </button>
          <button
            onClick={() => setActiveTab('MY_APPOINTMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'MY_APPOINTMENTS'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" /> My Appointments
            {appointments.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-sky-400 text-slate-950 font-extrabold">
                {appointments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: BOOK SPECIALIST */}
      {activeTab === 'BOOK' && (
        <div className="space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['ALL', 'Cardiology', 'Dermatology', 'Neurology', 'General Medicine'].map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedSpecialization === spec
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid & Slot Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Doctors List (1 or 2 Cols) */}
            <div className={`space-y-4 ${selectedDoctor ? 'lg:col-span-1' : 'lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 space-y-0'}`}>
              {loadingDoctors ? (
                <div className="col-span-full text-center py-12 text-slate-400 text-xs animate-pulse">
                  Loading available clinic doctors...
                </div>
              ) : doctors.length === 0 ? (
                <div className="col-span-full glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No doctors found matching your filter criteria.
                </div>
              ) : (
                doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSelected={selectedDoctor?.id === doctor.id}
                    onSelectDoctor={(doc) => setSelectedDoctor(doc)}
                  />
                ))
              )}
            </div>

            {/* Interactive Slot Picker Panel */}
            {selectedDoctor && (
              <div id="slot-picker-container" className="lg:col-span-2 scroll-mt-24">
                <SlotPicker
                  doctorId={selectedDoctor.id}
                  doctorName={selectedDoctor.user.name}
                  onSlotSelected={handleSelectSlot}
                />
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: MY APPOINTMENTS */}
      {activeTab === 'MY_APPOINTMENTS' && (
        <div className="space-y-6">
          {loadingAppointments ? (
            <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
              Loading your appointment history & AI care plans...
            </div>
          ) : appointments.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 text-slate-400 text-xs space-y-3">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-semibold">No appointments scheduled yet.</p>
              <button
                onClick={() => setActiveTab('BOOK')}
                className="px-4 py-2 bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 font-bold">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">Dr. {app.doctor.user.name}</h3>
                        <p className="text-xs text-sky-400 font-medium">{app.doctor.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {app.symptomSummary && (
                        <UrgencyBadge level={app.symptomSummary.urgencyLevel} />
                      )}

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        app.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : app.status === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                      }`}>
                        {app.status}
                      </span>

                      {app.status === 'BOOKED' && (
                        <button
                          onClick={() => handleCancelAppointment(app.id)}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <p className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-sky-400" /> Date & Time:
                      </p>
                      <p className="text-slate-300 font-medium">{app.date} from {app.startTime} to {app.endTime}</p>
                      
                      {app.symptomSummary && (
                        <div className="mt-3 pt-3 border-t border-slate-800">
                          <p className="font-bold text-slate-200 mb-1">Pre-Visit AI Symptom Summary:</p>
                          <p className="text-slate-400 italic">"{app.symptomSummary.chiefComplaint}"</p>
                        </div>
                      )}
                    </div>

                    {/* Post Visit Summary & Medication Reminders */}
                    {app.postVisitSummary ? (
                      <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                        <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-400" /> Post-Visit Doctor Care Summary:
                        </p>
                        <p className="text-slate-200 leading-relaxed">{app.postVisitSummary.patientFriendlySummary}</p>
                        
                        {app.postVisitSummary.prescription && (
                          <div className="mt-2 pt-2 border-t border-emerald-500/20">
                            <p className="font-bold text-emerald-300 flex items-center gap-1">
                              <Pill className="w-3.5 h-3.5" /> Prescribed Schedule:
                            </p>
                            <p className="text-slate-300 font-mono mt-0.5">{app.postVisitSummary.prescription}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex items-center justify-center text-slate-500 text-xs italic">
                        Post-visit notes and prescription will appear here after your consultation.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Symptom Intake Modal */}
      {showSymptomModal && bookingSlot && selectedDoctor && (
        <SymptomFormModal
          doctorId={selectedDoctor.id}
          doctorName={selectedDoctor.user.name}
          specialization={selectedDoctor.specialization}
          date={bookingSlot.date}
          startTime={bookingSlot.slot.startTime}
          endTime={bookingSlot.slot.endTime}
          onClose={() => setShowSymptomModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

    </div>
  );
};
