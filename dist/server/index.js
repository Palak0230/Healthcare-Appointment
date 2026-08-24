import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { register, login, getCurrentUser } from './controllers/authController.js';
import { getDoctors, getDoctorById, getDoctorSlots, addDoctorLeave, removeDoctorLeave, updateDoctorProfile } from './controllers/doctorController.js';
import { holdSlot, bookAppointment, getAppointments, submitPostVisit, cancelAppointment } from './controllers/appointmentController.js';
import { getDashboardStats, getNotificationLogs, getDoctorLeaves } from './controllers/adminController.js';
import { authenticateToken, requireRole } from './middleware/authMiddleware.js';
import { initScheduler } from './services/schedulerService.js';
import { seedDatabase } from './seed.js';
import prisma from './config/db.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// Vercel Serverless DB Cold Start Auto-Init (Fast Native Raw SQL)
let vercelDbInitialized = false;
async function ensureVercelDb() {
    if (process.env.VERCEL && !vercelDbInitialized) {
        vercelDbInitialized = true;
        try {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT PRIMARY KEY,
          "email" TEXT UNIQUE NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'PATIENT',
          "phone" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DoctorProfile" (
          "id" TEXT PRIMARY KEY,
          "userId" TEXT UNIQUE NOT NULL,
          "specialization" TEXT NOT NULL,
          "workingHoursStart" TEXT NOT NULL DEFAULT '09:00',
          "workingHoursEnd" TEXT NOT NULL DEFAULT '17:00',
          "slotDurationMinutes" INTEGER NOT NULL DEFAULT 30,
          "bio" TEXT,
          "consultationFee" REAL NOT NULL DEFAULT 100.0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
        );
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DoctorLeave" (
          "id" TEXT PRIMARY KEY,
          "doctorId" TEXT NOT NULL,
          "leaveDate" TEXT NOT NULL,
          "reason" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile" ("id") ON DELETE CASCADE
        );
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Appointment" (
          "id" TEXT PRIMARY KEY,
          "patientId" TEXT NOT NULL,
          "doctorId" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "startTime" TEXT NOT NULL,
          "endTime" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'BOOKED',
          "cancellationReason" TEXT,
          "googleCalendarEventId" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE,
          FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile" ("id") ON DELETE CASCADE
        );
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SymptomSummary" (
          "id" TEXT PRIMARY KEY,
          "appointmentId" TEXT UNIQUE NOT NULL,
          "rawSymptoms" TEXT NOT NULL,
          "urgencyLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
          "chiefComplaint" TEXT NOT NULL,
          "suggestedQuestions" TEXT NOT NULL,
          "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE CASCADE
        );
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PostVisitSummary" (
          "id" TEXT PRIMARY KEY,
          "appointmentId" TEXT UNIQUE NOT NULL,
          "rawNotes" TEXT NOT NULL,
          "prescription" TEXT,
          "patientFriendlySummary" TEXT NOT NULL,
          "medicationSchedule" TEXT,
          "followUpSteps" TEXT,
          "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE CASCADE
        );
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SlotHold" (
          "id" TEXT PRIMARY KEY,
          "doctorId" TEXT NOT NULL,
          "patientId" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "startTime" TEXT NOT NULL,
          "expiresAt" DATETIME NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "MedicationReminder" (
          "id" TEXT PRIMARY KEY,
          "appointmentId" TEXT NOT NULL,
          "patientId" TEXT NOT NULL,
          "medicationName" TEXT NOT NULL,
          "dosage" TEXT NOT NULL,
          "frequency" TEXT NOT NULL,
          "timeOfDay" TEXT NOT NULL,
          "startDate" TEXT NOT NULL,
          "endDate" TEXT NOT NULL,
          "active" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "NotificationLog" (
          "id" TEXT PRIMARY KEY,
          "recipientEmail" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "status" TEXT NOT NULL,
          "retryCount" INTEGER NOT NULL DEFAULT 0,
          "errorMessage" TEXT,
          "sentAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
            const userCount = await prisma.user.count();
            if (userCount === 0) {
                await seedDatabase();
            }
        }
        catch (err) {
            console.error('Vercel DB auto-init error:', err);
        }
    }
}
app.use(async (req, res, next) => {
    if (process.env.VERCEL) {
        await ensureVercelDb();
    }
    next();
});
// Health & API Root Route
app.get(['/api', '/api/health'], (req, res) => {
    const acceptsHtml = req.accepts('html') && !req.xhr && !req.headers['accept']?.includes('application/json');
    if (acceptsHtml) {
        return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Healthcare Appointment API & Web App</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
          .card { background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 36px; max-width: 600px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          .badge { background: #065f46; color: #34d399; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; display: inline-block; margin-bottom: 12px; }
          h1 { margin: 0 0 12px; font-size: 24px; color: #ffffff; }
          p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
          .btn { background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block; transition: background 0.2s; margin-right: 12px; }
          .btn:hover { background: #1d4ed8; }
          .btn-sec { background: #334155; color: #e2e8f0; }
          .btn-sec:hover { background: #475569; }
          pre { background: #0f172a; padding: 16px; border-radius: 8px; overflow-x: auto; color: #38bdf8; font-size: 13px; margin-top: 24px; border: 1px solid #334155; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● API SERVER ONLINE</div>
          <h1>Healthcare Appointment Manager</h1>
          <p>You opened the backend API URL (<code>/api</code>). Click the button below to launch the full interactive Web Application Portal.</p>
          <div style="margin-bottom: 20px;">
            <a href="/" class="btn">🚀 Open Web Application Portal</a>
          </div>
          <p style="font-size: 13px; margin-bottom: 8px; color: #cbd5e1;">API Status Response:</p>
          <pre><code>${JSON.stringify({ status: 'online', message: 'Healthcare Appointment Platform API is running', timestamp: new Date().toISOString() }, null, 2)}</code></pre>
        </div>
      </body>
      </html>
    `);
    }
    return res.json({
        status: 'online',
        message: 'Healthcare Appointment Platform API is running',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
            doctors: ['GET /api/doctors', 'GET /api/doctors/:id', 'GET /api/doctors/:id/slots', 'POST /api/doctors/leave'],
            appointments: ['GET /api/appointments', 'POST /api/appointments/hold-slot', 'POST /api/appointments/book'],
            admin: ['GET /api/admin/stats', 'GET /api/admin/notifications', 'GET /api/admin/leaves'],
            seed: 'POST /api/seed'
        }
    });
});
// Auth Routes
app.post(['/api/auth/register', '/auth/register'], register);
app.post(['/api/auth/login', '/auth/login'], login);
app.get(['/api/auth/me', '/auth/me'], authenticateToken, getCurrentUser);
// Doctor Routes
app.get(['/api/doctors', '/doctors'], getDoctors);
app.get(['/api/doctors/:id', '/doctors/:id'], getDoctorById);
app.get(['/api/doctors/:id/slots', '/doctors/:id/slots'], getDoctorSlots);
app.post(['/api/doctors/leave', '/doctors/leave'], authenticateToken, requireRole(['ADMIN', 'DOCTOR']), addDoctorLeave);
app.delete(['/api/doctors/leave/:id', '/doctors/leave/:id'], authenticateToken, requireRole(['ADMIN', 'DOCTOR']), removeDoctorLeave);
app.put(['/api/doctors/:id', '/doctors/:id'], authenticateToken, requireRole(['ADMIN', 'DOCTOR']), updateDoctorProfile);
// Appointment Routes
app.post(['/api/appointments/hold-slot', '/appointments/hold-slot'], authenticateToken, holdSlot);
app.post(['/api/appointments/book', '/appointments/book'], authenticateToken, bookAppointment);
app.get(['/api/appointments', '/appointments'], authenticateToken, getAppointments);
app.post(['/api/appointments/:id/post-visit', '/appointments/:id/post-visit'], authenticateToken, requireRole(['DOCTOR', 'ADMIN']), submitPostVisit);
app.post(['/api/appointments/:id/cancel', '/appointments/:id/cancel'], authenticateToken, cancelAppointment);
// Admin Routes
app.get(['/api/admin/stats', '/admin/stats'], authenticateToken, requireRole(['ADMIN']), getDashboardStats);
app.get(['/api/admin/notifications', '/admin/notifications'], authenticateToken, requireRole(['ADMIN']), getNotificationLogs);
app.get(['/api/admin/leaves', '/admin/leaves'], authenticateToken, requireRole(['ADMIN']), getDoctorLeaves);
// Seed Route for easy setup/demo testing
app.post(['/api/seed', '/seed'], async (req, res) => {
    try {
        await seedDatabase();
        return res.json({ message: 'Database successfully seeded with demo users, doctors, and appointments!' });
    }
    catch (err) {
        console.error('Seed route error:', err);
        return res.status(500).json({ error: 'Failed to seed database' });
    }
});
// Serve frontend static files in non-Vercel environments (Render, local dev)
if (!process.env.VERCEL) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const clientDistPath = path.join(__dirname, '../../dist/client');
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api'))
            return next();
        res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
            if (err) {
                res.status(200).send('Healthcare Appointment API Server Running. Build client using npm run build for full UI.');
            }
        });
    });
}
// Start Express Server & Cron Engine in non-Vercel environments (Render, local dev)
if (!process.env.VERCEL) {
    const server = app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🏥 Healthcare Appointment Server running on port ${PORT}`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api`);
        console.log(`=======================================================`);
        initScheduler();
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
            console.error(`💡 Solution: Stop the existing server process or run: taskkill /F /PID <pid>\n`);
        }
        else {
            console.error('Server startup error:', err);
        }
    });
}
export default app;
