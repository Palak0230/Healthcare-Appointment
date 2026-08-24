import prisma from '../config/db.js';
export async function getDashboardStats(req, res) {
    try {
        const totalDoctors = await prisma.doctorProfile.count();
        const totalPatients = await prisma.user.count({ where: { role: 'PATIENT' } });
        const totalAppointments = await prisma.appointment.count();
        const completedAppointments = await prisma.appointment.count({ where: { status: 'COMPLETED' } });
        const cancelledAppointments = await prisma.appointment.count({ where: { status: 'CANCELLED' } });
        const activeLeaves = await prisma.doctorLeave.count();
        const totalNotifications = await prisma.notificationLog.count();
        const failedNotifications = await prisma.notificationLog.count({ where: { status: 'FAILED' } });
        return res.json({
            stats: {
                totalDoctors,
                totalPatients,
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                activeLeaves,
                totalNotifications,
                failedNotifications
            }
        });
    }
    catch (err) {
        console.error('getDashboardStats error:', err);
        return res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
}
export async function getNotificationLogs(req, res) {
    try {
        const logs = await prisma.notificationLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return res.json({ logs });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch notification logs' });
    }
}
export async function getDoctorLeaves(req, res) {
    try {
        const leaves = await prisma.doctorLeave.findMany({
            include: {
                doctor: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { leaveDate: 'desc' }
        });
        return res.json({ leaves });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch doctor leaves' });
    }
}
