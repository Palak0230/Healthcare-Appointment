import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { DoctorCard } from '../components/DoctorCard';
import { SlotPicker } from '../components/SlotPicker';
import { SymptomFormModal } from '../components/SymptomFormModal';
import { Shield, Users, Stethoscope, Calendar, Mail, AlertTriangle, Plus, RefreshCw, CheckCircle2, X } from 'lucide-react';
export const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [notificationLogs, setNotificationLogs] = useState([]);
    const [doctorLeaves, setDoctorLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    // Doctor Booking Modal state
    const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [showSymptomModal, setShowSymptomModal] = useState(false);
    // New Doctor Form Modal state
    const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
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
    const [errorMsg, setErrorMsg] = useState(null);
    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [statsRes, docRes, notifRes, leaveRes] = await Promise.all([
                apiRequest('/admin/stats'),
                apiRequest('/doctors'),
                apiRequest('/admin/notifications'),
                apiRequest('/admin/leaves'),
            ]);
            setStats(statsRes.stats);
            setDoctors(docRes.doctors);
            setNotificationLogs(notifRes.logs);
            setDoctorLeaves(leaveRes.leaves);
        }
        catch (err) {
            console.error('Failed fetching admin metrics:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAdminData();
    }, []);
    const handleCreateDoctor = async (e) => {
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
        }
        catch (err) {
            setErrorMsg(err.message || 'Failed to create doctor profile');
        }
        finally {
            setSubmittingDoc(false);
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-extrabold text-slate-100 flex items-center gap-2", children: [_jsx(Shield, { className: "w-7 h-7 text-indigo-400" }), " Admin Command Center"] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "System design, doctor scheduling controls, & notification audit logs." })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: fetchAdminData, className: "p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all", title: "Refresh Metrics", children: _jsx(RefreshCw, { className: "w-4 h-4" }) }), _jsxs("button", { onClick: () => setShowAddDoctorModal(true), className: "px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-sky-400 transition-all flex items-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add New Doctor Profile"] })] })] }), stats && (_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4", children: [_jsxs("div", { className: "glass-panel p-4 rounded-2xl border border-slate-800", children: [_jsxs("p", { className: "text-[11px] font-semibold text-slate-400 flex items-center gap-1", children: [_jsx(Stethoscope, { className: "w-3.5 h-3.5 text-teal-400" }), " Active Doctors"] }), _jsx("p", { className: "text-xl font-black text-slate-100 mt-1", children: stats.totalDoctors })] }), _jsxs("div", { className: "glass-panel p-4 rounded-2xl border border-slate-800", children: [_jsxs("p", { className: "text-[11px] font-semibold text-slate-400 flex items-center gap-1", children: [_jsx(Users, { className: "w-3.5 h-3.5 text-sky-400" }), " Registered Patients"] }), _jsx("p", { className: "text-xl font-black text-slate-100 mt-1", children: stats.totalPatients })] }), _jsxs("div", { className: "glass-panel p-4 rounded-2xl border border-slate-800", children: [_jsxs("p", { className: "text-[11px] font-semibold text-slate-400 flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-indigo-400" }), " Total Bookings"] }), _jsx("p", { className: "text-xl font-black text-slate-100 mt-1", children: stats.totalAppointments })] }), _jsxs("div", { className: "glass-panel p-4 rounded-2xl border border-slate-800", children: [_jsxs("p", { className: "text-[11px] font-semibold text-slate-400 flex items-center gap-1", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-400" }), " Completed"] }), _jsx("p", { className: "text-xl font-black text-emerald-400 mt-1", children: stats.completedAppointments })] }), _jsxs("div", { className: "glass-panel p-4 rounded-2xl border border-slate-800", children: [_jsxs("p", { className: "text-[11px] font-semibold text-slate-400 flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-amber-400" }), " Active Leaves"] }), _jsx("p", { className: "text-xl font-black text-amber-400 mt-1", children: stats.activeLeaves })] }), _jsxs("div", { className: "glass-panel p-4 rounded-2xl border border-slate-800", children: [_jsxs("p", { className: "text-[11px] font-semibold text-slate-400 flex items-center gap-1", children: [_jsx(Mail, { className: "w-3.5 h-3.5 text-purple-400" }), " Notifications Sent"] }), _jsx("p", { className: "text-xl font-black text-purple-300 mt-1", children: stats.totalNotifications })] })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("h2", { className: "text-lg font-bold text-slate-100 flex items-center gap-2", children: [_jsx(Stethoscope, { className: "w-5 h-5 text-teal-400" }), " Doctor Roster & Schedules (", doctors.length, ")"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: doctors.map((doctor) => (_jsx(DoctorCard, { doctor: doctor, onSelectDoctor: (doc) => setSelectedDoctorForBooking(doc) }, doctor.id))) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "glass-panel p-6 rounded-3xl border border-slate-800 space-y-4", children: [_jsxs("h3", { className: "text-base font-bold text-slate-100 flex items-center gap-2", children: [_jsx(Mail, { className: "w-5 h-5 text-purple-400" }), " Notification Audit Log"] }), notificationLogs.length === 0 ? (_jsx("p", { className: "text-xs text-slate-500 italic", children: "No notifications logged yet." })) : (_jsx("div", { className: "space-y-2.5 max-h-80 overflow-y-auto pr-1", children: notificationLogs.slice(0, 10).map((log) => (_jsxs("div", { className: "p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-bold text-slate-200 truncate max-w-[180px]", children: log.recipientEmail }), _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`, children: log.status })] }), _jsx("p", { className: "text-[11px] text-slate-400 truncate", children: log.subject }), _jsx("p", { className: "text-[10px] text-slate-500", children: new Date(log.createdAt).toLocaleString() })] }, log.id))) }))] }), _jsxs("div", { className: "glass-panel p-6 rounded-3xl border border-slate-800 space-y-4", children: [_jsxs("h3", { className: "text-base font-bold text-slate-100 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-amber-400" }), " Doctor Leave History (", doctorLeaves.length, ")"] }), doctorLeaves.length === 0 ? (_jsx("p", { className: "text-xs text-slate-500 italic", children: "No leaves recorded across doctors." })) : (_jsx("div", { className: "space-y-2 max-h-60 overflow-y-auto", children: doctorLeaves.map((leave) => (_jsxs("div", { className: "p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "font-bold text-slate-200", children: ["Dr. ", leave.doctor?.user?.name] }), _jsx("span", { className: "text-amber-400 font-mono font-bold", children: leave.leaveDate })] }), _jsxs("p", { className: "text-[11px] text-slate-400 mt-1", children: ["Reason: ", leave.reason || 'Leave'] })] }, leave.id))) }))] })] })] }), showAddDoctorModal && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4", children: _jsxs("div", { className: "glass-panel w-full max-w-lg rounded-3xl border border-slate-700 p-6 space-y-4 shadow-2xl", children: [_jsxs("h3", { className: "text-lg font-bold text-slate-100 flex items-center gap-2", children: [_jsx(Stethoscope, { className: "w-5 h-5 text-indigo-400" }), " Create Doctor Profile"] }), errorMsg && (_jsx("div", { className: "p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs", children: errorMsg })), _jsxs("form", { onSubmit: handleCreateDoctor, className: "space-y-3 text-xs", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Doctor Full Name" }), _jsx("input", { type: "text", required: true, value: docName, onChange: (e) => setDocName(e.target.value), placeholder: "Dr. Alexander Vance", className: "w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Email" }), _jsx("input", { type: "email", required: true, value: docEmail, onChange: (e) => setDocEmail(e.target.value), placeholder: "dr.vance@clinic.com", className: "w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Specialization" }), _jsx("input", { type: "text", required: true, value: docSpec, onChange: (e) => setDocSpec(e.target.value), placeholder: "e.g. Cardiology", className: "w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Consultation Fee ($)" }), _jsx("input", { type: "number", required: true, value: docFee, onChange: (e) => setDocFee(e.target.value), className: "w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700" })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Start Time" }), _jsx("input", { type: "text", required: true, value: docStart, onChange: (e) => setDocStart(e.target.value), placeholder: "09:00", className: "w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "End Time" }), _jsx("input", { type: "text", required: true, value: docEnd, onChange: (e) => setDocEnd(e.target.value), placeholder: "17:00", className: "w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Slot Duration (m)" }), _jsx("input", { type: "number", required: true, value: docDuration, onChange: (e) => setDocDuration(e.target.value), className: "w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-300 font-semibold mb-1", children: "Doctor Bio" }), _jsx("textarea", { rows: 2, value: docBio, onChange: (e) => setDocBio(e.target.value), placeholder: "Medical background, certifications, and experience...", className: "w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700" })] }), _jsxs("div", { className: "pt-3 border-t border-slate-800 flex items-center justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: () => setShowAddDoctorModal(false), className: "px-4 py-2 rounded-xl text-slate-400 hover:text-white", children: "Cancel" }), _jsx("button", { type: "submit", disabled: submittingDoc, className: "px-6 py-2 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400", children: submittingDoc ? 'Creating...' : 'Save Doctor Profile' })] })] })] }) })), selectedDoctorForBooking && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4", children: _jsxs("div", { className: "glass-panel w-full max-w-3xl rounded-3xl border border-slate-700 p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-bold text-slate-100 flex items-center gap-2", children: [_jsx(Stethoscope, { className: "w-5 h-5 text-sky-400" }), " Dr. ", selectedDoctorForBooking.user.name, " Schedule & Slots"] }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [selectedDoctorForBooking.specialization, " \u2022 $", selectedDoctorForBooking.consultationFee.toFixed(2), " / session"] })] }), _jsx("button", { onClick: () => setSelectedDoctorForBooking(null), className: "p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx(SlotPicker, { doctorId: selectedDoctorForBooking.id, doctorName: selectedDoctorForBooking.user.name, onSlotSelected: (date, slot, holdId) => {
                                setBookingSlot({ date, slot, holdId });
                                setShowSymptomModal(true);
                            } })] }) })), showSymptomModal && bookingSlot && selectedDoctorForBooking && (_jsx(SymptomFormModal, { doctorId: selectedDoctorForBooking.id, doctorName: selectedDoctorForBooking.user.name, specialization: selectedDoctorForBooking.specialization, date: bookingSlot.date, startTime: bookingSlot.slot.startTime, endTime: bookingSlot.slot.endTime, onClose: () => setShowSymptomModal(false), onSuccess: () => {
                    setShowSymptomModal(false);
                    setBookingSlot(null);
                    setSelectedDoctorForBooking(null);
                    fetchAdminData();
                } }))] }));
};
