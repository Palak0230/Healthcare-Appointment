import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
export async function register(req, res) {
    try {
        const { email, password, name, role, phone, specialization, workingHoursStart, workingHoursEnd, slotDurationMinutes, bio, consultationFee } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === 'ADMIN' ? 'ADMIN' : role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: userRole,
                phone: phone || null,
                doctorProfile: userRole === 'DOCTOR' ? {
                    create: {
                        specialization: specialization || 'General Medicine',
                        workingHoursStart: workingHoursStart || '09:00',
                        workingHoursEnd: workingHoursEnd || '17:00',
                        slotDurationMinutes: Number(slotDurationMinutes) || 30,
                        bio: bio || 'Experienced medical professional',
                        consultationFee: Number(consultationFee) || 100,
                    }
                } : undefined
            },
            include: {
                doctorProfile: true,
            }
        });
        const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-12345';
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            doctorProfileId: user.doctorProfile?.id
        }, secret, { expiresIn: '7d' });
        return res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                doctorProfile: user.doctorProfile
            }
        });
    }
    catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Internal server error during registration' });
    }
}
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const user = await prisma.user.findUnique({
            where: { email },
            include: { doctorProfile: true },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-12345';
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            doctorProfileId: user.doctorProfile?.id
        }, secret, { expiresIn: '7d' });
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                doctorProfile: user.doctorProfile
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error during login' });
    }
}
export async function getCurrentUser(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthenticated' });
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { doctorProfile: true },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                doctorProfile: user.doctorProfile
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch current user' });
    }
}
