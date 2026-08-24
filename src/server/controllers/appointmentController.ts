import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { generatePreVisitSummary, generatePostVisitSummary } from '../services/llmService.js';
import { sendEmailNotification } from '../services/emailService.js';
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from '../services/calendarService.js';

export async function holdSlot(req: AuthRequest, res: Response) {
  try {
    const { doctorId, date, startTime, endTime } = req.body;
    const patientId = req.user?.id;

    if (!patientId) return res.status(401).json({ error: 'Unauthenticated' });
    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'doctorId, date, startTime, endTime are required' });
    }

    const leave = await prisma.doctorLeave.findFirst({
      where: { doctorId, leaveDate: date }
    });
    if (leave) {
      return res.status(400).json({ error: 'Doctor is on leave on this date' });
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        startTime,
        status: { in: ['BOOKED', 'COMPLETED'] }
      }
    });
    if (existing) {
      return res.status(409).json({ error: 'This time slot has already been booked by another patient' });
    }

    const activeHold = await prisma.slotHold.findFirst({
      where: {
        doctorId,
        date,
        startTime,
        expiresAt: { gt: new Date() },
        patientId: { not: patientId }
      }
    });

    if (activeHold) {
      return res.status(409).json({ error: 'This slot is currently held by another patient. Please select another slot.' });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const hold = await prisma.slotHold.create({
      data: {
        doctorId,
        patientId,
        date,
        startTime,
        endTime,
        expiresAt,
      }
    });

    return res.json({
      message: 'Slot temporarily reserved for 5 minutes.',
      holdId: hold.id,
      expiresAt: hold.expiresAt
    });
  } catch (err) {
    console.error('holdSlot error:', err);
    return res.status(500).json({ error: 'Failed to hold slot' });
  }
}

export async function bookAppointment(req: AuthRequest, res: Response) {
  try {
    const patientId = req.user?.id;
    const { doctorId, date, startTime, endTime, symptoms } = req.body;

    if (!patientId) return res.status(401).json({ error: 'Unauthenticated' });
    if (!doctorId || !date || !startTime || !endTime || !symptoms) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const patient = await prisma.user.findUnique({ where: { id: patientId } });
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or Doctor profile not found' });
    }

    const onLeave = await prisma.doctorLeave.findFirst({
      where: { doctorId, leaveDate: date }
    });
    if (onLeave) {
      return res.status(400).json({ error: 'Doctor is on leave on this date' });
    }

    const appointmentResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.appointment.findFirst({
        where: {
          doctorId,
          date,
          startTime,
          status: { in: ['BOOKED', 'COMPLETED'] }
        }
      });

      if (existing) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      const appointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId,
          date,
          startTime,
          endTime,
          status: 'BOOKED',
        },
        include: {
          patient: true,
          doctor: { include: { user: true } }
        }
      });

      await tx.slotHold.deleteMany({
        where: { doctorId, date, startTime }
      });

      return appointment;
    });

    let preVisitSummaryData;
    try {
      preVisitSummaryData = await generatePreVisitSummary(symptoms);
    } catch (llmErr) {
      preVisitSummaryData = {
        urgencyLevel: 'MEDIUM' as const,
        chiefComplaint: symptoms.substring(0, 100),
        suggestedQuestions: ['What is the primary diagnosis?', 'Are there lifestyle recommendations?', 'When should I follow up?']
      };
    }

    const symptomSummary = await prisma.symptomSummary.create({
      data: {
        appointmentId: appointmentResult.id,
        rawSymptoms: symptoms,
        urgencyLevel: preVisitSummaryData.urgencyLevel,
        chiefComplaint: preVisitSummaryData.chiefComplaint,
        suggestedQuestions: JSON.stringify(preVisitSummaryData.suggestedQuestions),
      }
    });

    let googleCalId: string | null = null;
    try {
      const startDateTime = `${date}T${startTime}:00Z`;
      const endDateTime = `${date}T${endTime}:00Z`;

      googleCalId = await createGoogleCalendarEvent({
        summary: `Medical Appointment: ${patient.name} with Dr. ${doctor.user.name}`,
        description: `Chief Complaint: ${preVisitSummaryData.chiefComplaint}\nUrgency: ${preVisitSummaryData.urgencyLevel}\nSymptoms: ${symptoms}`,
        startDateTime,
        endDateTime,
        patientEmail: patient.email,
        doctorEmail: doctor.user.email,
      });

      await prisma.appointment.update({
        where: { id: appointmentResult.id },
        data: { googleCalendarEventId: googleCalId }
      });
    } catch (gcalErr) {
      console.warn('Google Calendar sync warning:', gcalErr);
    }

    const patientEmailBody = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0284c7;">✅ Appointment Confirmation</h2>
      <p>Dear <strong>${patient.name}</strong>,</p>
      <p>Your healthcare appointment has been successfully scheduled!</p>
      <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #0284c7; margin: 15px 0;">
        <p style="margin: 0;"><strong>Doctor:</strong> Dr. ${doctor.user.name} (${doctor.specialization})</p>
        <p style="margin: 5px 0 0 0;"><strong>Date & Time:</strong> ${date} at ${startTime} - ${endTime}</p>
        <p style="margin: 5px 0 0 0;"><strong>Chief Concern:</strong> ${preVisitSummaryData.chiefComplaint}</p>
        <p style="margin: 5px 0 0 0;"><strong>Urgency Level:</strong> ${preVisitSummaryData.urgencyLevel}</p>
      </div>
    </div>
    `;

    const doctorEmailBody = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0d9488;">🩺 New Appointment Booked</h2>
      <p>Dear <strong>Dr. ${doctor.user.name}</strong>,</p>
      <p>A new patient has booked an appointment in your schedule.</p>
      <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #0d9488; margin: 15px 0;">
        <p style="margin: 0;"><strong>Patient Name:</strong> ${patient.name} (${patient.email})</p>
        <p style="margin: 5px 0 0 0;"><strong>Slot:</strong> ${date} from ${startTime} to ${endTime}</p>
        <p style="margin: 5px 0 0 0;"><strong>Chief Complaint:</strong> ${preVisitSummaryData.chiefComplaint}</p>
      </div>
    </div>
    `;

    sendEmailNotification(patient.email, 'BOOKING_CONFIRMATION', `Appointment Confirmed with Dr. ${doctor.user.name}`, patientEmailBody);
    sendEmailNotification(doctor.user.email, 'BOOKING_CONFIRMATION', `New Patient Booking: ${patient.name}`, doctorEmailBody);

    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        ...appointmentResult,
        symptomSummary,
        googleCalendarEventId: googleCalId
      }
    });

  } catch (err: any) {
    if (err.message === 'SLOT_ALREADY_BOOKED') {
      return res.status(409).json({ error: 'This time slot was just booked by another user. Please select a different time.' });
    }
    console.error('bookAppointment error:', err);
    return res.status(500).json({ error: 'Failed to book appointment' });
  }
}

export async function getAppointments(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const doctorProfileId = req.user?.doctorProfileId;

    let whereClause: any = {};

    if (role === 'PATIENT') {
      whereClause.patientId = userId;
    } else if (role === 'DOCTOR') {
      whereClause.doctorId = doctorProfileId;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
        doctor: { include: { user: { select: { id: true, name: true, email: true } } } },
        symptomSummary: true,
        postVisitSummary: true,
        medicationReminders: true,
      },
      orderBy: { date: 'desc' }
    });

    return res.json({ appointments });
  } catch (err) {
    console.error('getAppointments error:', err);
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
}

export async function submitPostVisit(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { rawNotes, prescription } = req.body;

    if (!rawNotes || !prescription) {
      return res.status(400).json({ error: 'Clinical notes and prescription details are required' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      }
    });

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const aiSummary = await generatePostVisitSummary(rawNotes, prescription);

    const postVisitRecord = await prisma.postVisitSummary.upsert({
      where: { appointmentId: id },
      create: {
        appointmentId: id,
        rawNotes,
        prescription,
        patientFriendlySummary: aiSummary.patientFriendlySummary,
        medicationSchedule: JSON.stringify(aiSummary.medicationSchedule),
        followUpSteps: JSON.stringify(aiSummary.followUpSteps),
      },
      update: {
        rawNotes,
        prescription,
        patientFriendlySummary: aiSummary.patientFriendlySummary,
        medicationSchedule: JSON.stringify(aiSummary.medicationSchedule),
        followUpSteps: JSON.stringify(aiSummary.followUpSteps),
      }
    });

    await prisma.appointment.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    if (aiSummary.medicationSchedule && aiSummary.medicationSchedule.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      for (const item of aiSummary.medicationSchedule) {
        await prisma.medicationReminder.create({
          data: {
            appointmentId: id,
            patientId: appointment.patientId,
            medicationName: item.medication,
            dosage: item.dosage,
            frequency: item.frequency,
            timeOfDay: item.timing || '09:00, 21:00',
            startDate: today,
            endDate: endDate,
            active: true
          }
        });
      }
    }

    const emailBody = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
      <h2 style="color: #0d9488;">📋 Post-Visit Summary & Care Plan</h2>
      <p>Dear <strong>${appointment.patient.name}</strong>,</p>
      <p>Dr. <strong>${appointment.doctor.user.name}</strong> has submitted your consultation notes and prescription summary.</p>
      <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #0d9488; margin: 15px 0;">
        <p style="margin: 0;">${aiSummary.patientFriendlySummary}</p>
      </div>
    </div>
    `;

    sendEmailNotification(
      appointment.patient.email,
      'APPOINTMENT_REMINDER',
      `Your Post-Visit Summary from Dr. ${appointment.doctor.user.name}`,
      emailBody
    );

    return res.json({
      message: 'Post-visit notes and prescription submitted successfully',
      postVisitSummary: postVisitRecord,
      aiSummary
    });
  } catch (err) {
    console.error('submitPostVisit error:', err);
    return res.status(500).json({ error: 'Failed to submit post-visit notes' });
  }
}

export async function cancelAppointment(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { user: true } }
      }
    });

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by user'
      }
    });

    if (appointment.googleCalendarEventId) {
      await deleteGoogleCalendarEvent(appointment.googleCalendarEventId);
    }

    const cancelBody = `<p>Your appointment on ${appointment.date} at ${appointment.startTime} with Dr. ${appointment.doctor.user.name} has been cancelled.</p>`;
    sendEmailNotification(appointment.patient.email, 'CANCELLATION', `Appointment Cancelled`, cancelBody);

    return res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel appointment' });
  }
}
