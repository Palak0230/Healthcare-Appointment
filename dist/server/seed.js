import prisma from './config/db.js';
import bcrypt from 'bcryptjs';
export async function seedDatabase() {
    console.log('🌱 Starting database seed...');
    // Clean existing tables
    await prisma.medicationReminder.deleteMany();
    await prisma.postVisitSummary.deleteMany();
    await prisma.symptomSummary.deleteMany();
    await prisma.slotHold.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.doctorLeave.deleteMany();
    await prisma.doctorProfile.deleteMany();
    await prisma.notificationLog.deleteMany();
    await prisma.user.deleteMany();
    const adminPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const patientPassword = await bcrypt.hash('patient123', 10);
    // 1. Admin User
    const admin = await prisma.user.create({
        data: {
            email: 'admin@clinic.com',
            password: adminPassword,
            name: 'System Admin',
            role: 'ADMIN',
            phone: '+1 555-0100',
        }
    });
    // 2. Doctor Users & Profiles
    const drSmith = await prisma.user.create({
        data: {
            email: 'dr.smith@clinic.com',
            password: doctorPassword,
            name: 'Dr. Arthur Smith',
            role: 'DOCTOR',
            phone: '+1 555-0101',
            doctorProfile: {
                create: {
                    specialization: 'Cardiology',
                    workingHoursStart: '09:00',
                    workingHoursEnd: '17:00',
                    slotDurationMinutes: 30,
                    bio: 'Senior Cardiologist specializing in preventative heart health and hypertension management.',
                    consultationFee: 150.0,
                }
            }
        },
        include: { doctorProfile: true }
    });
    const drPatel = await prisma.user.create({
        data: {
            email: 'dr.patel@clinic.com',
            password: doctorPassword,
            name: 'Dr. Priya Patel',
            role: 'DOCTOR',
            phone: '+1 555-0102',
            doctorProfile: {
                create: {
                    specialization: 'Dermatology',
                    workingHoursStart: '10:00',
                    workingHoursEnd: '16:00',
                    slotDurationMinutes: 20,
                    bio: 'Board-certified Dermatologist with expertise in acne, eczema, and skin cancer screenings.',
                    consultationFee: 120.0,
                }
            }
        },
        include: { doctorProfile: true }
    });
    const drChen = await prisma.user.create({
        data: {
            email: 'dr.chen@clinic.com',
            password: doctorPassword,
            name: 'Dr. Marcus Chen',
            role: 'DOCTOR',
            phone: '+1 555-0103',
            doctorProfile: {
                create: {
                    specialization: 'Neurology',
                    workingHoursStart: '08:30',
                    workingHoursEnd: '16:30',
                    slotDurationMinutes: 45,
                    bio: 'Neurologist specializing in migraine treatment, sleep disorders, and neuropathy.',
                    consultationFee: 180.0,
                }
            }
        },
        include: { doctorProfile: true }
    });
    // 3. Patient Users
    const patientJohn = await prisma.user.create({
        data: {
            email: 'patient.john@example.com',
            password: patientPassword,
            name: 'John Doe',
            role: 'PATIENT',
            phone: '+1 555-0201',
        }
    });
    const patientSarah = await prisma.user.create({
        data: {
            email: 'patient.sarah@example.com',
            password: patientPassword,
            name: 'Sarah Jenkins',
            role: 'PATIENT',
            phone: '+1 555-0202',
        }
    });
    // 4. Sample Doctor Leave
    if (drPatel.doctorProfile) {
        const nextWeekDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await prisma.doctorLeave.create({
            data: {
                doctorId: drPatel.doctorProfile.id,
                leaveDate: nextWeekDate,
                reason: 'Medical Conference Attendance',
            }
        });
    }
    // 5. Sample Booked Appointment (Upcoming)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (drSmith.doctorProfile) {
        const app1 = await prisma.appointment.create({
            data: {
                patientId: patientJohn.id,
                doctorId: drSmith.doctorProfile.id,
                date: tomorrow,
                startTime: '10:00',
                endTime: '10:30',
                status: 'BOOKED',
                symptomSummary: {
                    create: {
                        rawSymptoms: 'Experiencing intermittent chest tightness during morning runs and mild shortness of breath for the last 3 days.',
                        urgencyLevel: 'HIGH',
                        chiefComplaint: 'Chest tightness and exertional shortness of breath',
                        suggestedQuestions: JSON.stringify([
                            'How long have these symptoms been present?',
                            'Does the tightness radiate to the arm or neck?',
                            'What triggers or relieves the shortness of breath?'
                        ])
                    }
                }
            }
        });
    }
    // 6. Sample Completed Appointment with Post-Visit Summary & Medication Reminders
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (drChen.doctorProfile) {
        const app2 = await prisma.appointment.create({
            data: {
                patientId: patientSarah.id,
                doctorId: drChen.doctorProfile.id,
                date: yesterday,
                startTime: '11:00',
                endTime: '11:45',
                status: 'COMPLETED',
                symptomSummary: {
                    create: {
                        rawSymptoms: 'Chronic throbbing headaches behind right eye accompanied by light sensitivity.',
                        urgencyLevel: 'MEDIUM',
                        chiefComplaint: 'Unilateral throbbing headache with photophobia',
                        suggestedQuestions: JSON.stringify([
                            'Are headaches accompanied by nausea?',
                            'How many headache days per month?',
                            'Have abortive medications been tried?'
                        ])
                    }
                },
                postVisitSummary: {
                    create: {
                        rawNotes: 'Patient presents with classic migraine without aura. Neurological exam normal. Prescribed Sumatriptan for acute attacks and recommended tracking triggers in headache diary.',
                        prescription: 'Sumatriptan 50mg tablets. Take 1 tablet at onset of headache. Repeat after 2 hours if needed (max 100mg/24h).',
                        patientFriendlySummary: 'You were diagnosed with mild to moderate migraine headaches. Your neurological examination was completely normal. Take your prescribed Sumatriptan as soon as you notice headache onset.',
                        medicationSchedule: JSON.stringify([
                            { medication: 'Sumatriptan', dosage: '50mg', frequency: 'At onset of headache', duration: 'As needed' }
                        ]),
                        followUpSteps: JSON.stringify([
                            'Keep a daily headache diary recording duration, intensity, and potential triggers.',
                            'Ensure 7-8 hours of sleep per night and maintain consistent hydration.',
                            'Schedule a follow-up consultation in 4 weeks to evaluate treatment efficacy.'
                        ])
                    }
                }
            }
        });
        await prisma.medicationReminder.create({
            data: {
                appointmentId: app2.id,
                patientId: patientSarah.id,
                medicationName: 'Sumatriptan',
                dosage: '50mg',
                frequency: 'At onset of headache',
                timeOfDay: '08:00, 20:00',
                startDate: yesterday,
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                active: true
            }
        });
    }
    console.log('✅ Database seeded successfully!');
}
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
    seedDatabase()
        .catch(e => {
        console.error('Seed error:', e);
        process.exit(1);
    })
        .finally(async () => {
        await prisma.$disconnect();
    });
}
