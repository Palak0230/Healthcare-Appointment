import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { PostVisitModal } from '../components/PostVisitModal';
import { Stethoscope, Calendar, User, FileText, CheckCircle2, Plus, Trash2, HelpCircle, Sparkles } from 'lucide-react';
export const DoctorDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    // Leave Form state
    const [leaveDate, setLeaveDate] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [submittingLeave, setSubmittingLeave] = useState(false);
    const [leaveAlert, setLeaveAlert] = useState(null);
    // Post Visit Modal state
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const fetchDoctorData = async () => {
        setLoading(true);
        try {
            const [appRes, doctorRes] = await Promise.all([
                apiRequest('/appointments'),
                user?.doctorProfile?.id ? apiRequest(`/doctors/${user.doctorProfile.id}`) : Promise.resolve({ doctor: null }),
            ]);
            setAppointments(appRes.appointments);
            if (doctorRes.doctor && doctorRes.doctor.leaves) {
                setLeaves(doctorRes.doctor.leaves);
            }
        }
        catch (err) {
            console.error('Failed fetching doctor data:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchDoctorData();
    }, [user]);
    const handleAddLeave = async (e) => {
        e.preventDefault();
        if (!leaveDate || !user?.doctorProfile?.id)
            return;
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
        }
        catch (err) {
            setLeaveAlert(err.message || 'Failed to record leave');
        }
        finally {
            setSubmittingLeave(false);
        }
    };
    const handleRemoveLeave = async (leaveId) => {
        try {
            await apiRequest(`/doctors/leave/${leaveId}`, 'DELETE');
            fetchDoctorData();
        }
        catch (err) {
            alert(err.message || 'Failed to remove leave');
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsxs("div", { className: "glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-500/20", children: _jsx(Stethoscope, { className: "w-8 h-8" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-extrabold text-slate-100", children: user?.name }), _jsx("p", { className: "text-xs text-teal-400 font-semibold", children: user?.doctorProfile?.specialization || 'Physician Specialist' }), _jsxs("p", { className: "text-xs text-slate-400 mt-1", children: ["Working Hours: ", user?.doctorProfile?.workingHoursStart, " - ", user?.doctorProfile?.workingHoursEnd, " (", user?.doctorProfile?.slotDurationMinutes, "m slots)"] })] })] }), _jsxs("div", { className: "flex items-center space-x-3 text-center", children: [_jsxs("div", { className: "bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800", children: [_jsx("p", { className: "text-xs text-slate-400 font-medium", children: "Appointments" }), _jsx("p", { className: "text-lg font-extrabold text-slate-100", children: appointments.length })] }), _jsxs("div", { className: "bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800", children: [_jsx("p", { className: "text-xs text-slate-400 font-medium", children: "Scheduled Leaves" }), _jsx("p", { className: "text-lg font-extrabold text-amber-400", children: leaves.length })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-lg font-bold text-slate-100 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-teal-400" }), " Patient Consultation Queue"] }), _jsx("span", { className: "text-xs text-slate-400", children: "Ordered by date & AI urgency score" })] }), loading ? (_jsx("div", { className: "text-center py-12 text-slate-400 text-xs animate-pulse", children: "Loading doctor schedule..." })) : appointments.length === 0 ? (_jsx("div", { className: "glass-panel p-12 text-center rounded-3xl border border-slate-800 text-slate-400 text-xs", children: "No appointments scheduled." })) : (_jsx("div", { className: "space-y-6", children: appointments.map((app) => {
                                    const suggestedQs = app.symptomSummary?.suggestedQuestions
                                        ? JSON.parse(app.symptomSummary.suggestedQuestions)
                                        : [];
                                    return (_jsxs("div", { className: "glass-panel rounded-2xl p-6 border border-slate-800 space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 font-bold", children: _jsx(User, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-slate-100", children: app.patient.name }), _jsxs("p", { className: "text-xs text-slate-400", children: [app.patient.email, " \u2022 ", app.patient.phone || 'No phone'] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [app.symptomSummary && (_jsx(UrgencyBadge, { level: app.symptomSummary.urgencyLevel })), _jsxs("span", { className: "text-xs font-semibold px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700", children: [app.date, " @ ", app.startTime] }), app.status === 'BOOKED' && (_jsxs("button", { onClick: () => setSelectedAppointment(app), className: "px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-md hover:from-teal-400 hover:to-emerald-500 transition-all flex items-center gap-1.5", children: [_jsx(FileText, { className: "w-4 h-4" }), " Log Post-Visit Notes"] })), app.status === 'COMPLETED' && (_jsxs("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " Completed"] }))] })] }), app.symptomSummary && (_jsxs("div", { className: "bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "font-bold text-sky-400 flex items-center gap-1.5", children: [_jsx(Sparkles, { className: "w-4 h-4 text-amber-400" }), " Pre-Visit AI Symptom Summary"] }), _jsx("span", { className: "text-slate-500 text-[11px]", children: "Auto-generated before visit" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold text-slate-200", children: "Chief Complaint:" }), _jsx("p", { className: "text-xs text-slate-300 mt-0.5", children: app.symptomSummary.chiefComplaint })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold text-slate-200", children: "Raw Patient Intake Symptoms:" }), _jsxs("p", { className: "text-xs text-slate-400 italic mt-0.5", children: ["\"", app.symptomSummary.rawSymptoms, "\""] })] }), suggestedQs.length > 0 && (_jsxs("div", { className: "pt-2 border-t border-slate-800", children: [_jsxs("p", { className: "text-xs font-bold text-amber-400 flex items-center gap-1 mb-1", children: [_jsx(HelpCircle, { className: "w-3.5 h-3.5" }), " AI Suggested Diagnostic Questions:"] }), _jsx("ul", { className: "text-xs text-slate-300 space-y-1 list-disc list-inside", children: suggestedQs.map((q, idx) => (_jsx("li", { children: q }, idx))) })] }))] })), app.postVisitSummary && (_jsxs("div", { className: "bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-xs space-y-2", children: [_jsx("p", { className: "font-bold text-emerald-300", children: "Submitted Post-Visit Summary & Prescription:" }), _jsx("p", { className: "text-slate-300", children: app.postVisitSummary.patientFriendlySummary }), _jsxs("p", { className: "text-slate-400 font-mono", children: ["Prescription: ", app.postVisitSummary.prescription] })] }))] }, app.id));
                                }) }))] }), _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "glass-panel p-6 rounded-3xl border border-slate-800 space-y-4", children: [_jsxs("h3", { className: "text-base font-bold text-slate-100 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-amber-400" }), " Schedule Doctor Leave"] }), _jsxs("p", { className: "text-xs text-slate-400 leading-relaxed", children: ["Mark date as leave. ", _jsx("strong", { children: "System automatically cancels existing bookings on that date and dispatches email cancellation alerts to affected patients." })] }), leaveAlert && (_jsx("div", { className: "p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs", children: leaveAlert })), _jsxs("form", { onSubmit: handleAddLeave, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1", children: "Leave Date" }), _jsx("input", { type: "date", required: true, min: new Date().toISOString().split('T')[0], value: leaveDate, onChange: (e) => setLeaveDate(e.target.value), className: "w-full bg-slate-900/90 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1", children: "Reason" }), _jsx("input", { type: "text", placeholder: "e.g. Vacation, Medical Conference", value: leaveReason, onChange: (e) => setLeaveReason(e.target.value), className: "w-full bg-slate-900/90 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500" })] }), _jsxs("button", { type: "submit", disabled: submittingLeave, className: "w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5", children: [_jsx(Plus, { className: "w-4 h-4" }), " Mark Leave & Notify Patients"] })] }), _jsxs("div", { className: "pt-4 border-t border-slate-800", children: [_jsxs("h4", { className: "text-xs font-bold text-slate-300 mb-3", children: ["Your Scheduled Leaves (", leaves.length, ")"] }), leaves.length === 0 ? (_jsx("p", { className: "text-xs text-slate-500 italic", children: "No scheduled leaves." })) : (_jsx("div", { className: "space-y-2", children: leaves.map((leave) => (_jsxs("div", { className: "p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs", children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold text-slate-200", children: leave.leaveDate }), _jsx("p", { className: "text-[11px] text-slate-400", children: leave.reason || 'No reason specified' })] }), _jsx("button", { onClick: () => handleRemoveLeave(leave.id), className: "p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, leave.id))) }))] })] }) })] }), selectedAppointment && (_jsx(PostVisitModal, { appointmentId: selectedAppointment.id, patientName: selectedAppointment.patient.name, symptoms: selectedAppointment.symptomSummary?.rawSymptoms || '', onClose: () => setSelectedAppointment(null), onSuccess: () => {
                    setSelectedAppointment(null);
                    fetchDoctorData();
                } }))] }));
};
