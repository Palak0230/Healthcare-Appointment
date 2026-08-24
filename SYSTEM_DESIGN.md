# System Design Write-Up: Healthcare Appointment & Follow-Up Manager

## 1. Overview & Architecture

The Healthcare Appointment & Follow-up Manager is a high-reliability, role-based healthcare platform designed to orchestrate patient consultations, pre-visit AI symptom triaging, post-visit care plans, and automated multi-channel notifications (Email and Google Calendar). 

The platform guarantees strong transactional consistency for appointment scheduling while offering high availability for background operations like medication reminders and notification retries.

---

## 2. Double-Booking Prevention & Concurrency Control

### Problem
In high-concurrency clinical scheduling environments, two patients viewing the same doctor’s schedule may attempt to book the exact same time slot simultaneously. Naive `SELECT` followed by `INSERT` operations suffer from race conditions leading to overlapping appointments.

### Architectural Solution
The system employs **Database Transaction Isolation (`prisma.$transaction`) with Atomic State Enforcement**:
1. **Isolated Transaction Boundary:** When a patient initiates booking, the backend opens an explicit transaction.
2. **Pessimistic Slot Locking Check:** Within the transaction scope, the engine queries the `Appointment` table for existing bookings matching `(doctorId, date, startTime)` with status in `['BOOKED', 'COMPLETED']`.
3. **Atomic Slot Hold Check:** The transaction verifies whether an unexpired `SlotHold` exists for a different patient ID.
4. **State Insertion & Lock Release:** If clear, the appointment record is written atomically, and any associated temporary holds are deleted in the same transaction block. If another transaction commits first, the second attempt aborts with a `409 Conflict` status, prompting the user to select an alternate slot.

---

## 3. Temporary Slot Hold Mechanism

### Problem
During the pre-visit booking flow, patients must complete a detailed symptom assessment form for AI analysis. If a slot is not reserved while the patient fills out this form, another user could book it, causing frustration and lost intake data.

### Architectural Solution
1. **5-Minute Temporary Slot Reservations:** When a patient selects an available slot, the system creates a `SlotHold` record (`expiresAt = Date.now() + 5 minutes`).
2. **Real-time Slot Filtering:** The slot calculation engine (`/api/doctors/:id/slots`) evaluates theoretical working hour slots against active holds (`expiresAt > NOW()`). Slots held by other users display as **"Reserved"**.
3. **Automatic Expiration & Cleanup:** A background `node-cron` worker executes every 60 seconds (`* * * * *`), purging expired holds. If a patient abandons the intake form or the 5-minute timer expires, the slot automatically becomes available to all patients without manual intervention.

---

## 4. Doctor Leave Conflict Management

### Problem
When a doctor marks a leave day (e.g. medical conference or emergency leave), existing patient bookings on that date become invalid and require immediate resolution to avoid clinic disruption.

### Architectural Solution
1. **Cascade Cancellation Pipeline:** When an Admin or Doctor submits a leave request for date `YYYY-MM-DD`, the `addDoctorLeave` controller identifies all active appointments matching `(doctorId, leaveDate, status = 'BOOKED')`.
2. **State Displacement:** Affected appointments are updated to `status = 'CANCELLED'` with a structured cancellation reason: `Doctor [Name] on Leave`.
3. **External Calendar Purge:** The system dispatches asynchronous requests to `deleteGoogleCalendarEvent()` to delete the corresponding Google Calendar events from both doctor and patient calendars.
4. **Immediate Patient Alert Dispatch:** For every displaced booking, the system generates a high-priority `DOCTOR_LEAVE_ALERT` email notifying the patient of the cancellation and providing a direct link to reschedule.

---

## 5. Notification Reliability & Failure Handling

### Problem
External API calls (e.g. Nodemailer SMTP servers, Google Calendar OAuth APIs) are vulnerable to network latency, rate limits, or transient outages. Notification failures must not block database transactions or break the patient booking experience.

### Architectural Solution
1. **Decoupled Notification Pipeline:** All email dispatches (`sendEmailNotification`) operate asynchronously. Booking transactions commit immediately without waiting for SMTP network round-trips.
2. **Notification Audit Log:** Every notification attempt (confirmations, leave alerts, medication reminders) records an entry in `NotificationLog` with fields: `status ('SENT' | 'FAILED')`, `retryCount`, `errorMessage`, and `sentAt`.
3. **Automated Background Retry Queue:** A dedicated `node-cron` background worker runs every 10 minutes (`*/10 * * * *`). It fetches logs with `status = 'FAILED'` and `retryCount < 3`, re-executes the transport layer, and updates audit records upon successful delivery or final failure exhaustion.
4. **Graceful LLM Fallbacks:** If LLM API calls (Gemini/OpenAI) fail due to rate limits or invalid keys, the `llmService` catches the exception and routes symptoms through an internal rule-based heuristic parser. The patient's booking succeeds seamlessly with a fallback summary.
