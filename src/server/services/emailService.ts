import nodemailer from 'nodemailer';
import prisma from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable Nodemailer Transporter
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal Test Account or Mock Transporter for instant local development
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    // Return a dummy transport that logs email content
    return nodemailer.createTransport({
      jsonTransport: true
    });
  }
};

export async function sendEmailNotification(
  recipientEmail: string,
  type: 'BOOKING_CONFIRMATION' | 'APPOINTMENT_REMINDER' | 'CANCELLATION' | 'DOCTOR_LEAVE_ALERT' | 'MEDICATION_REMINDER',
  subject: string,
  htmlContent: string
): Promise<boolean> {
  let status = 'SENT';
  let errorMessage: string | undefined = undefined;

  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Healthcare Clinic" <noreply@healthcare-clinic.com>',
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log(`[EMAIL] ${type} sent to ${recipientEmail}. MessageId: ${info.messageId || 'mock'}`);
  } catch (err) {
    status = 'FAILED';
    errorMessage = (err as Error).message;
    console.error(`[EMAIL ERROR] Failed sending ${type} to ${recipientEmail}:`, errorMessage);
  }

  // Log in NotificationLog for auditing & retry runner
  try {
    await prisma.notificationLog.create({
      data: {
        recipientEmail,
        type,
        subject,
        status,
        errorMessage,
        sentAt: status === 'SENT' ? new Date() : null,
      },
    });
  } catch (dbErr) {
    console.error('Failed to log notification record:', dbErr);
  }

  return status === 'SENT';
}

/**
 * Retry failed notifications
 */
export async function retryFailedNotifications() {
  const failedLogs = await prisma.notificationLog.findMany({
    where: {
      status: 'FAILED',
      retryCount: { lt: 3 },
    },
    take: 10,
  });

  for (const log of failedLogs) {
    console.log(`[RETRY LOG] Retrying notification ID ${log.id} to ${log.recipientEmail}`);
    const success = await sendEmailNotification(
      log.recipientEmail,
      log.type as any,
      `[Retry] ${log.subject}`,
      `<p>This is a re-sent notification.</p><p>Original Subject: ${log.subject}</p>`
    );

    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        retryCount: { increment: 1 },
        status: success ? 'SENT' : 'FAILED',
        sentAt: success ? new Date() : null,
      },
    });
  }
}
