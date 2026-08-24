import prisma from '../config/db.js';
import { generateDoctorSlots } from '../utils/slotUtils.js';
import { sendEmailNotification } from '../services/emailService.js';
import { deleteGoogleCalendarEvent } from '../services/calendarService.js';
export async function getDoctors(req, res) {
    try {
        const specialization = req.query.specialization;
        const search = req.query.search;
        const whereClause = {};
        if (specialization && specialization !== 'ALL') {
            whereClause.specialization = specialization;
        }
        if (search) {
            whereClause.user = {
                name: {
                    contains: search,
                },
            };
        }
        const doctors = await prisma.doctorProfile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                leaves: true,
            }
        });
        return res.json({ doctors });
    }
    catch (err) {
        console.error('getDoctors error:', err);
        return res.status(500).json({ error: 'Failed to fetch doctor list' });
    }
}
export async function getDoctorById(req, res) {
    try {
        const id = req.params.id;
        const doctor = await prisma.doctorProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                leaves: true,
            }
        });
        if (!doctor)
            return res.status(404).json({ error: 'Doctor not found' });
        return res.json({ doctor });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch doctor details' });
    }
}
export async function getDoctorSlots(req, res) {
    try {
        const id = req.params.id; // Doctor Profile ID
        const date = req.query.date; // YYYY-MM-DD
        if (!date) {
            return res.status(400).json({ error: 'Query parameter "date" (YYYY-MM-DD) is required' });
        }
        const doctor = await prisma.doctorProfile.findUnique({
            where: { id },
            include: { leaves: true }
        });
        if (!doctor)
            return res.status(404).json({ error: 'Doctor not found' });
        // Check if doctor is on leave on this date
        const isOnLeave = doctor.leaves.some((l) => l.leaveDate === date);
        if (isOnLeave) {
            return res.json({
                date,
                isOnLeave: true,
                slots: [],
                message: 'Doctor is on leave on this date.'
            });
        }
        // Generate total theoretical slots
        const allSlots = generateDoctorSlots(doctor.workingHoursStart, doctor.workingHoursEnd, doctor.slotDurationMinutes);
        // Fetch existing booked or active appointments for this doctor on this date
        const existingAppointments = await prisma.appointment.findMany({
            where: {
                doctorId: id,
                date: date,
                status: { in: ['BOOKED', 'COMPLETED'] },
            }
        });
        // Fetch active slot holds (expiresAt > now)
        const activeHolds = await prisma.slotHold.findMany({
            where: {
                doctorId: id,
                date: date,
                expiresAt: { gt: new Date() }
            }
        });
        const slotsWithAvailability = allSlots.map(slot => {
            const isBooked = existingAppointments.some(app => app.startTime === slot.startTime);
            const isHeld = activeHolds.some(h => h.startTime === slot.startTime);
            let available = true;
            let reason = 'Available';
            if (isBooked) {
                available = false;
                reason = 'Booked';
            }
            else if (isHeld) {
                available = false;
                reason = 'Held by another patient';
            }
            return {
                ...slot,
                available,
                reason
            };
        });
        return res.json({
            date,
            isOnLeave: false,
            slotDurationMinutes: doctor.slotDurationMinutes,
            slots: slotsWithAvailability
        });
    }
    catch (err) {
        console.error('getDoctorSlots error:', err);
        return res.status(500).json({ error: 'Failed to compute slot availability' });
    }
}
/**
 * Mark Doctor on Leave & Notify Affected Patients
 */
export async function addDoctorLeave(req, res) {
    try {
        const { doctorId, leaveDate, reason } = req.body;
        if (!doctorId || !leaveDate) {
            return res.status(400).json({ error: 'doctorId and leaveDate (YYYY-MM-DD) are required' });
        }
        if (req.user?.role !== 'ADMIN') {
            if (req.user?.role === 'DOCTOR' && req.user?.doctorProfileId !== doctorId) {
                return res.status(403).json({ error: 'Unauthorized to set leave for another doctor' });
            }
        }
        const doctor = await prisma.doctorProfile.findUnique({
            where: { id: doctorId },
            include: { user: true }
        });
        if (!doctor)
            return res.status(404).json({ error: 'Doctor profile not found' });
        const leave = await prisma.doctorLeave.upsert({
            where: {
                doctorId_leaveDate: { doctorId, leaveDate }
            },
            create: {
                doctorId,
                leaveDate,
                reason: reason || 'Scheduled leave'
            },
            update: {
                reason: reason || 'Scheduled leave'
            }
        });
        const affectedAppointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                date: leaveDate,
                status: 'BOOKED',
            },
            include: {
                patient: true,
            }
        });
        for (const app of affectedAppointments) {
            await prisma.appointment.update({
                where: { id: app.id },
                data: {
                    status: 'CANCELLED',
                    cancellationReason: `Doctor ${doctor.user.name} is on leave on ${leaveDate}.`
                }
            });
            if (app.googleCalendarEventId) {
                await deleteGoogleCalendarEvent(app.googleCalendarEventId);
            }
            const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px;">
        <h2 style="color: #dc2626;">⚠️ Important: Appointment Cancellation Notice</h2>
        <p>Dear <strong>${app.patient.name}</strong>,</p>
        <p>We regret to inform you that your appointment with <strong>Dr. ${doctor.user.name}</strong> scheduled for <strong>${app.date} at ${app.startTime}</strong> has been cancelled due to doctor unavailability/leave.</p>
        <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0;">
          <p style="margin: 0;"><strong>Reason:</strong> Doctor on leave (${reason || 'Unscheduled emergency leave'})</p>
        </div>
        <p>Please log in to your patient portal to select an alternative date or book with another specialist.</p>
      </div>
      `;
            await sendEmailNotification(app.patient.email, 'DOCTOR_LEAVE_ALERT', `Cancelled: Appointment with Dr. ${doctor.user.name} on ${leaveDate}`, htmlContent);
        }
        return res.json({
            message: `Doctor marked on leave for ${leaveDate}. ${affectedAppointments.length} patient(s) notified.`,
            leave,
            affectedCount: affectedAppointments.length
        });
    }
    catch (err) {
        console.error('addDoctorLeave error:', err);
        return res.status(500).json({ error: 'Failed to process doctor leave' });
    }
}
export async function removeDoctorLeave(req, res) {
    try {
        const id = req.params.id;
        await prisma.doctorLeave.delete({ where: { id } });
        return res.json({ message: 'Leave removed successfully' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to remove leave' });
    }
}
export async function updateDoctorProfile(req, res) {
    try {
        const id = req.params.id;
        const { specialization, workingHoursStart, workingHoursEnd, slotDurationMinutes, bio, consultationFee } = req.body;
        const updated = await prisma.doctorProfile.update({
            where: { id },
            data: {
                specialization: specialization || undefined,
                workingHoursStart: workingHoursStart || undefined,
                workingHoursEnd: workingHoursEnd || undefined,
                slotDurationMinutes: slotDurationMinutes ? Number(slotDurationMinutes) : undefined,
                bio: bio || undefined,
                consultationFee: consultationFee ? Number(consultationFee) : undefined,
            },
            include: { user: true }
        });
        return res.json({ doctor: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to update doctor profile' });
    }
}
