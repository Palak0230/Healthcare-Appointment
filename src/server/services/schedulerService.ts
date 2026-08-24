import cron from 'node-cron';
import prisma from '../config/db.js';
import { sendEmailNotification, retryFailedNotifications } from './emailService.js';

/**
 * Initialize background cron jobs for:
 * 1. Medication Reminders (Runs every 15 minutes)
 * 2. Notification Retry Queue (Runs every 10 minutes)
 * 3. Expired Slot Hold Cleanup (Runs every 1 minute)
 */
export function initScheduler() {
  console.log('[SCHEDULER] Initializing background job engine...');

  // 1. Medication Reminders - Every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('[SCHEDULER] Running active medication reminder check...');
      const todayIso = new Date().toISOString().split('T')[0];

      const activeReminders = await prisma.medicationReminder.findMany({
        where: {
          active: true,
          startDate: { lte: todayIso },
          endDate: { gte: todayIso },
        },
        include: {
          appointment: {
            include: {
              patient: true,
            },
          },
        },
      });

      for (const reminder of activeReminders) {
        const patientEmail = reminder.appointment.patient.email;
        const patientName = reminder.appointment.patient.name;

        await sendEmailNotification(
          patientEmail,
          'MEDICATION_REMINDER',
          `Medication Reminder: ${reminder.medicationName}`,
          `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0284c7;">💊 Medication Time Reminder</h2>
            <p>Hello <strong>${patientName}</strong>,</p>
            <p>This is your automated reminder to take your prescribed medication:</p>
            <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #0284c7; margin: 15px 0;">
              <p style="margin: 0; font-size: 16px;"><strong>Medication:</strong> ${reminder.medicationName}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Dosage:</strong> ${reminder.dosage}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Instructions:</strong> ${reminder.frequency}</p>
            </div>
            <p>Stay healthy and remember to follow your doctor's full prescription schedule.</p>
          </div>
          `
        );

        await prisma.medicationReminder.update({
          where: { id: reminder.id },
          data: { lastSentAt: new Date() },
        });
      }
    } catch (err) {
      console.error('[SCHEDULER ERROR] Error running medication reminders:', err);
    }
  });

  // 2. Notification Retry Queue - Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      await retryFailedNotifications();
    } catch (err) {
      console.error('[SCHEDULER ERROR] Failed notification retry job:', err);
    }
  });

  // 3. Slot Hold Cleanup - Every 1 minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const deleted = await prisma.slotHold.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      });
      if (deleted.count > 0) {
        console.log(`[SCHEDULER] Cleaned up ${deleted.count} expired slot holds.`);
      }
    } catch (err) {
      console.error('[SCHEDULER ERROR] Slot hold cleanup failed:', err);
    }
  });
}
