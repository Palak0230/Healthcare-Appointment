import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { DoctorCard } from '../components/DoctorCard';
import { SlotPicker } from '../components/SlotPicker';
import { SymptomFormModal } from '../components/SymptomFormModal';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { Search, Calendar, Stethoscope, Pill, FileText, CalendarCheck } from 'lucide-react';
export const PatientDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    // Booking modal state
    const [bookingSlot, setBookingSlot] = useState(null);
    const [showSymptomModal, setShowSymptomModal] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [activeTab, setActiveTab] = useState('BOOK');
    const fetchDoctors = async () => {
        setLoadingDoctors(true);
        try {
            let url = '/doctors';
            const params = new URLSearchParams();
            if (selectedSpecialization !== 'ALL')
                params.append('specialization', selectedSpecialization);
            if (searchQuery)
                params.append('search', searchQuery);
            if (params.toString())
                url += `?${params.toString()}`;
            const res = await apiRequest(url);
            setDoctors(res.doctors);
        }
        catch (err) {
            console.error('Failed fetching doctors:', err);
        }
        finally {
            setLoadingDoctors(false);
        }
    };
    const fetchAppointments = async () => {
        setLoadingAppointments(true);
        try {
            const res = await apiRequest('/appointments');
            setAppointments(res.appointments);
        }
        catch (err) {
            console.error('Failed fetching appointments:', err);
        }
        finally {
            setLoadingAppointments(false);
        }
    };
    useEffect(() => {
        fetchDoctors();
    }, [selectedSpecialization, searchQuery]);
    useEffect(() => {
        fetchAppointments();
    }, []);
    const handleSelectSlot = (date, slot, holdId) => {
        setBookingSlot({ date, slot, holdId });
        setShowSymptomModal(true);
    };
    const handleBookingSuccess = (newAppointment) => {
        setShowSymptomModal(false);
        setBookingSlot(null);
        setSelectedDoctor(null);
        fetchAppointments();
        setActiveTab('MY_APPOINTMENTS');
    };
    const handleCancelAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?'))
            return;
        try {
            await apiRequest(`/appointments/${id}/cancel`, 'POST', { reason: 'Cancelled by patient' });
            fetchAppointments();
        }
        catch (err) {
            alert(err.message || 'Failed to cancel appointment');
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-extrabold text-slate-100 flex items-center gap-2", children: [_jsx(Stethoscope, { className: "w-7 h-7 text-sky-400" }), " Patient Care Portal"] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Book doctor appointments, view AI pre-visit insights, & access post-visit medication schedules." })] }), _jsxs("div", { className: "flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800", children: [_jsxs("button", { onClick: () => setActiveTab('BOOK'), className: `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'BOOK'
                                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                    : 'text-slate-400 hover:text-slate-200'}`, children: [_jsx(Calendar, { className: "w-4 h-4" }), " Book Specialist"] }), _jsxs("button", { onClick: () => setActiveTab('MY_APPOINTMENTS'), className: `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${activeTab === 'MY_APPOINTMENTS'
                                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                    : 'text-slate-400 hover:text-slate-200'}`, children: [_jsx(CalendarCheck, { className: "w-4 h-4" }), " My Appointments", appointments.length > 0 && (_jsx("span", { className: "ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-sky-400 text-slate-950 font-extrabold", children: appointments.length }))] })] })] }), activeTab === 'BOOK' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between", children: [_jsxs("div", { className: "relative w-full md:w-80", children: [_jsx(Search, { className: "w-4 h-4 text-slate-500 absolute left-3.5 top-3" }), _jsx("input", { type: "text", placeholder: "Search doctors by name...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-slate-900/90 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500" })] }), _jsx("div", { className: "flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0", children: ['ALL', 'Cardiology', 'Dermatology', 'Neurology', 'General Medicine'].map((spec) => (_jsx("button", { onClick: () => setSelectedSpecialization(spec), className: `px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${selectedSpecialization === spec
                                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'}`, children: spec }, spec))) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: `space-y-4 ${selectedDoctor ? 'lg:col-span-1' : 'lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 space-y-0'}`, children: loadingDoctors ? (_jsx("div", { className: "col-span-full text-center py-12 text-slate-400 text-xs animate-pulse", children: "Loading available clinic doctors..." })) : doctors.length === 0 ? (_jsx("div", { className: "col-span-full glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs", children: "No doctors found matching your filter criteria." })) : (doctors.map((doctor) => (_jsx(DoctorCard, { doctor: doctor, isSelected: selectedDoctor?.id === doctor.id, onSelectDoctor: (doc) => setSelectedDoctor(doc) }, doctor.id)))) }), selectedDoctor && (_jsx("div", { id: "slot-picker-container", className: "lg:col-span-2 scroll-mt-24", children: _jsx(SlotPicker, { doctorId: selectedDoctor.id, doctorName: selectedDoctor.user.name, onSlotSelected: handleSelectSlot }) }))] })] })), activeTab === 'MY_APPOINTMENTS' && (_jsx("div", { className: "space-y-6", children: loadingAppointments ? (_jsx("div", { className: "text-center py-12 text-slate-400 text-xs animate-pulse", children: "Loading your appointment history & AI care plans..." })) : appointments.length === 0 ? (_jsxs("div", { className: "glass-panel p-12 text-center rounded-3xl border border-slate-800 text-slate-400 text-xs space-y-3", children: [_jsx(Calendar, { className: "w-10 h-10 text-slate-600 mx-auto" }), _jsx("p", { className: "font-semibold", children: "No appointments scheduled yet." }), _jsx("button", { onClick: () => setActiveTab('BOOK'), className: "px-4 py-2 bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md", children: "Book Your First Appointment" })] })) : (_jsx("div", { className: "space-y-4", children: appointments.map((app) => (_jsxs("div", { className: "glass-panel rounded-2xl p-6 border border-slate-800 space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 font-bold", children: _jsx(Stethoscope, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsxs("h3", { className: "text-base font-bold text-slate-100", children: ["Dr. ", app.doctor.user.name] }), _jsx("p", { className: "text-xs text-sky-400 font-medium", children: app.doctor.specialization })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [app.symptomSummary && (_jsx(UrgencyBadge, { level: app.symptomSummary.urgencyLevel })), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold border ${app.status === 'COMPLETED'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                    : app.status === 'CANCELLED'
                                                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                                        : 'bg-sky-500/20 text-sky-400 border-sky-500/30'}`, children: app.status }), app.status === 'BOOKED' && (_jsx("button", { onClick: () => handleCancelAppointment(app.id), className: "px-3 py-1 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all", children: "Cancel" }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300", children: [_jsxs("div", { className: "bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2", children: [_jsxs("p", { className: "font-bold text-slate-200 flex items-center gap-1.5", children: [_jsx(Calendar, { className: "w-4 h-4 text-sky-400" }), " Date & Time:"] }), _jsxs("p", { className: "text-slate-300 font-medium", children: [app.date, " from ", app.startTime, " to ", app.endTime] }), app.symptomSummary && (_jsxs("div", { className: "mt-3 pt-3 border-t border-slate-800", children: [_jsx("p", { className: "font-bold text-slate-200 mb-1", children: "Pre-Visit AI Symptom Summary:" }), _jsxs("p", { className: "text-slate-400 italic", children: ["\"", app.symptomSummary.chiefComplaint, "\""] })] }))] }), app.postVisitSummary ? (_jsxs("div", { className: "bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 space-y-2", children: [_jsxs("p", { className: "font-bold text-emerald-300 flex items-center gap-1.5", children: [_jsx(FileText, { className: "w-4 h-4 text-emerald-400" }), " Post-Visit Doctor Care Summary:"] }), _jsx("p", { className: "text-slate-200 leading-relaxed", children: app.postVisitSummary.patientFriendlySummary }), app.postVisitSummary.prescription && (_jsxs("div", { className: "mt-2 pt-2 border-t border-emerald-500/20", children: [_jsxs("p", { className: "font-bold text-emerald-300 flex items-center gap-1", children: [_jsx(Pill, { className: "w-3.5 h-3.5" }), " Prescribed Schedule:"] }), _jsx("p", { className: "text-slate-300 font-mono mt-0.5", children: app.postVisitSummary.prescription })] }))] })) : (_jsx("div", { className: "bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex items-center justify-center text-slate-500 text-xs italic", children: "Post-visit notes and prescription will appear here after your consultation." }))] })] }, app.id))) })) })), showSymptomModal && bookingSlot && selectedDoctor && (_jsx(SymptomFormModal, { doctorId: selectedDoctor.id, doctorName: selectedDoctor.user.name, specialization: selectedDoctor.specialization, date: bookingSlot.date, startTime: bookingSlot.slot.startTime, endTime: bookingSlot.slot.endTime, onClose: () => setShowSymptomModal(false), onSuccess: handleBookingSuccess }))] }));
};
