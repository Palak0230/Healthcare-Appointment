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
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, getCurrentUser);
// Doctor Routes
app.get('/api/doctors', getDoctors);
app.get('/api/doctors/:id', getDoctorById);
app.get('/api/doctors/:id/slots', getDoctorSlots);
app.post('/api/doctors/leave', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), addDoctorLeave);
app.delete('/api/doctors/leave/:id', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), removeDoctorLeave);
app.put('/api/doctors/:id', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), updateDoctorProfile);
// Appointment Routes
app.post('/api/appointments/hold-slot', authenticateToken, holdSlot);
app.post('/api/appointments/book', authenticateToken, bookAppointment);
app.get('/api/appointments', authenticateToken, getAppointments);
app.post('/api/appointments/:id/post-visit', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), submitPostVisit);
app.post('/api/appointments/:id/cancel', authenticateToken, cancelAppointment);
// Admin Routes
app.get('/api/admin/stats', authenticateToken, requireRole(['ADMIN']), getDashboardStats);
app.get('/api/admin/notifications', authenticateToken, requireRole(['ADMIN']), getNotificationLogs);
app.get('/api/admin/leaves', authenticateToken, requireRole(['ADMIN']), getDoctorLeaves);
// Seed Route for easy setup/demo testing
app.post('/api/seed', async (req, res) => {
    try {
        await seedDatabase();
        return res.json({ message: 'Database successfully seeded with demo users, doctors, and appointments!' });
    }
    catch (err) {
        console.error('Seed route error:', err);
        return res.status(500).json({ error: 'Failed to seed database' });
    }
});
// Serve frontend static files in production
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
// Start Express Server & Cron Engine
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏥 Healthcare Appointment Server running on port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
    initScheduler();
});
