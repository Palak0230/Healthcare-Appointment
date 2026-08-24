/**
 * Helper utilities for doctor appointment slot generation and availability check
 */
/**
 * Generate slots for a doctor given working hours and duration
 * e.g., 09:00 to 17:00 with 30 min duration -> ["09:00-09:30", "09:30-10:00", ...]
 */
export function generateDoctorSlots(startStr, endStr, slotDurationMinutes) {
    const slots = [];
    const [startHour, startMin] = startStr.split(':').map(Number);
    const [endHour, endMin] = endStr.split(':').map(Number);
    let currentMinutes = startHour * 60 + startMin;
    const endMinutesTotal = endHour * 60 + endMin;
    while (currentMinutes + slotDurationMinutes <= endMinutesTotal) {
        const sH = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
        const sM = String(currentMinutes % 60).padStart(2, '0');
        const nextMinutes = currentMinutes + slotDurationMinutes;
        const eH = String(Math.floor(nextMinutes / 60)).padStart(2, '0');
        const eM = String(nextMinutes % 60).padStart(2, '0');
        slots.push({
            startTime: `${sH}:${sM}`,
            endTime: `${eH}:${eM}`,
        });
        currentMinutes += slotDurationMinutes;
    }
    return slots;
}
