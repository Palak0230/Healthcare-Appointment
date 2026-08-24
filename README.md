# MedCare AI - Healthcare Appointment & Follow-Up Manager

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-00B5AD?style=for-the-badge&logo=render&logoColor=white)](https://healthcare-appointment-udt4.onrender.com)

🌐 **Live Application URL**: [https://healthcare-appointment-udt4.onrender.com](https://healthcare-appointment-udt4.onrender.com)

An enterprise-grade, full-stack Healthcare Appointment Platform featuring role-based portals for **Patients**, **Doctors**, and **Admins**. Powered by AI pre-visit symptom analysis, AI post-visit care plan generation, database transaction locks for double-booking prevention, 5-minute temporary slot holds, doctor leave conflict management with automatic patient notifications, background medication reminders, Nodemailer email alerts, and Google Calendar API synchronization.

---

## 🚀 Features & Key Requirements

- **Role-Based Portals (Patient, Doctor, Admin):**
  - **Patient Portal:** Search doctors by specialization, pick interactive time slots with live hold timer, complete AI pre-visit symptom intake, track appointment status, view post-visit doctor summaries, and access medication schedules.
  - **Doctor Portal:** View daily appointment queue, review AI-analyzed symptom summaries with **Urgency Badges (Low / Medium / High)** and suggested diagnostic questions, log clinical notes & prescriptions, and manage doctor leaves.
  - **Admin Portal:** Manage doctor profiles (specialty, working hours, slot duration, fee), monitor doctor leave history, audit delivery of email notifications, and review system performance metrics.
- **Concurrency & Double-Booking Prevention:** Atomic database transactions (`prisma.$transaction`) with pessimistic/atomic lock checks prevent race conditions between simultaneous patient booking attempts.
- **5-Minute Slot Hold Mechanism:** Reserves a selected slot temporarily while the patient completes symptom assessment, auto-expiring via a background cron runner.
- **Doctor Leave Displacement:** Marking doctor leave automatically cancels affected patient bookings, deletes Google Calendar events, and sends email cancellation alerts.
- **LLM Intelligence Engine (Gemini / OpenAI):**
  - **Pre-visit Prompt:** Analyzes symptoms to extract `urgencyLevel`, `chiefComplaint`, and 3 suggested diagnostic questions.
  - **Post-visit Prompt:** Converts doctor clinical notes into patient-friendly language with structured medication schedules and follow-up care steps.
  - **Resilient Fallback:** Includes a rule-based heuristic parser if LLM keys are absent or API limits are hit.
- **Background Cron Jobs:** `node-cron` handles active medication reminders, email retries for failed dispatches, and expired slot hold cleanups.
- **Google Calendar Sync:** OAuth 2.0 calendar integration for automatic event creation, updates, and cancellations.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, SQLite (`file:./dev.db`), `node-cron`, Nodemailer, `@google/generative-ai` / `openai`, `googleapis`.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons.

---

## 📋 Quick Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Clone & Install Dependencies
```bash
cd Healthcare-Appointment
npm install
```

### 3. Environment Configuration (`.env`)
Create a `.env` file in the root directory (see `.env.example`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super-secret-jwt-key-change-in-production-12345
DATABASE_URL="file:./dev.db"

# LLM Configuration (Optional - fallback engine auto-activates if blank)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=
LLM_PROVIDER=gemini

# Nodemailer / Email Service
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Healthcare Clinic <noreply@healthcare-clinic.com>"

# Google Calendar OAuth 2.0 Setup
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=
```

### 4. Database Setup & Seeding
Initialize SQLite database and seed demo data (Admin, Doctors, Patients, Appointments):
```bash
npm run prisma:push
npm run seed
```

### 5. Run Application
Run backend API and Vite client in development mode:
```bash
npm run dev
```
Open **`http://localhost:5000`** (or `http://localhost:3000` via Vite proxy).

---

## 🔐 One-Click Demo Personas

For instant testing, click the quick persona buttons in the top navbar:
- **Patient Persona:** `patient.john@example.com` / `patient123`
- **Doctor Persona:** `dr.smith@clinic.com` / `doctor123`
- **Admin Persona:** `admin@clinic.com` / `admin123`

---

## 📚 Database Schema (`prisma/schema.prisma`)

- `User`: Accounts for Patients, Doctors, and Admins (`id`, `email`, `password`, `name`, `role`, `phone`).
- `DoctorProfile`: Doctor metadata (`specialization`, `workingHoursStart`, `workingHoursEnd`, `slotDurationMinutes`, `consultationFee`, `bio`).
- `DoctorLeave`: Scheduled leave dates (`doctorId`, `leaveDate`, `reason`).
- `SlotHold`: Temporary 5-min holds (`doctorId`, `patientId`, `date`, `startTime`, `endTime`, `expiresAt`).
- `Appointment`: Bookings (`patientId`, `doctorId`, `date`, `startTime`, `endTime`, `status`, `googleCalendarEventId`).
- `SymptomSummary`: Pre-visit AI output (`rawSymptoms`, `urgencyLevel`, `chiefComplaint`, `suggestedQuestions`).
- `PostVisitSummary`: Post-visit AI output (`rawNotes`, `prescription`, `patientFriendlySummary`, `medicationSchedule`, `followUpSteps`).
- `MedicationReminder`: Patient reminder schedule (`medicationName`, `dosage`, `frequency`, `timeOfDay`, `active`).
- `NotificationLog`: Audit queue for emails (`recipientEmail`, `type`, `subject`, `status`, `retryCount`).

---

## 🧠 LLM Prompts & Guidance

### 1. Pre-Visit AI Symptom Analysis Prompt
```text
"You are a medical AI assistant. Analyze these patient symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: <symptoms>"
```

### 2. Post-Visit Patient Summary Prompt
```text
"You are a patient communication specialist. Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <notes>"
```

---

## 📅 Google Calendar OAuth 2.0 Setup Steps

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Google Calendar API**.
3. Navigate to **APIs & Services > Credentials** and create an **OAuth 2.0 Client ID**.
4. Set Authorized Redirect URI to `http://localhost:5000/api/auth/google/callback`.
5. Obtain Refresh Token using Google OAuth Playground or authorization consent flow.
6. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` to `.env`.

---

## 🔌 API Endpoints Summary

### Auth Routes
- `POST /api/auth/register` - Register user or doctor profile
- `POST /api/auth/login` - Authenticate user & receive JWT
- `GET /api/auth/me` - Get logged-in user profile

### Doctor Routes
- `GET /api/doctors` - Search doctors by specialization and name
- `GET /api/doctors/:id` - Get doctor profile details
- `GET /api/doctors/:id/slots?date=YYYY-MM-DD` - Get available slots for date
- `POST /api/doctors/leave` - Mark leave & trigger affected patient alerts (Admin/Doctor)
- `DELETE /api/doctors/leave/:id` - Remove leave date

### Appointment Routes
- `POST /api/appointments/hold-slot` - Create 5-minute temporary slot hold
- `POST /api/appointments/book` - Book slot with atomic lock & LLM symptom analysis
- `GET /api/appointments` - Get user/doctor appointments
- `POST /api/appointments/:id/post-visit` - Submit clinical notes & generate AI summary
- `POST /api/appointments/:id/cancel` - Cancel appointment & delete calendar event

### Admin Routes
- `GET /api/admin/stats` - Fetch clinic performance metrics
- `GET /api/admin/notifications` - Audit notification delivery logs
- `GET /api/admin/leaves` - View leave logs across doctors

---

## 📄 License & System Design Write-Up

Detailed system design write-up covering concurrency locks, slot hold mechanisms, doctor leave handling, and notification retries can be found in [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md).
