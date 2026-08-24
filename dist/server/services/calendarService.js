import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();
const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
}
/**
 * Create Google Calendar Event
 */
export async function createGoogleCalendarEvent(payload) {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: {
                    summary: payload.summary,
                    description: payload.description,
                    start: { dateTime: payload.startDateTime, timeZone: 'UTC' },
                    end: { dateTime: payload.endDateTime, timeZone: 'UTC' },
                    attendees: [
                        { email: payload.patientEmail },
                        { email: payload.doctorEmail },
                    ],
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 },
                            { method: 'popup', minutes: 30 },
                        ],
                    },
                },
            });
            console.log(`[GOOGLE CALENDAR] Created Event ID: ${response.data.id}`);
            return response.data.id || `gcal_${Date.now()}`;
        }
        catch (err) {
            console.warn('[GOOGLE CALENDAR API WARNING] Could not insert event to Google API:', err.message);
        }
    }
    // Local/Dev Mock Sync
    const mockId = `mock_gcal_evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    console.log(`[MOCK GOOGLE CALENDAR] Event Created ID: ${mockId} | Summary: ${payload.summary} | Time: ${payload.startDateTime}`);
    return mockId;
}
/**
 * Delete/Cancel Google Calendar Event
 */
export async function deleteGoogleCalendarEvent(eventId) {
    if (!eventId)
        return true;
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN && !eventId.startsWith('mock_')) {
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });
            console.log(`[GOOGLE CALENDAR] Deleted Event ID: ${eventId}`);
            return true;
        }
        catch (err) {
            console.warn('[GOOGLE CALENDAR API WARNING] Failed deleting event:', err.message);
        }
    }
    console.log(`[MOCK GOOGLE CALENDAR] Event Cancelled/Deleted ID: ${eventId}`);
    return true;
}
/**
 * Update Google Calendar Event
 */
export async function updateGoogleCalendarEvent(eventId, payload) {
    if (!eventId)
        return false;
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN && !eventId.startsWith('mock_')) {
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            await calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                requestBody: {
                    summary: payload.summary,
                    description: payload.description,
                    start: { dateTime: payload.startDateTime, timeZone: 'UTC' },
                    end: { dateTime: payload.endDateTime, timeZone: 'UTC' },
                    attendees: [
                        { email: payload.patientEmail },
                        { email: payload.doctorEmail },
                    ],
                },
            });
            console.log(`[GOOGLE CALENDAR] Updated Event ID: ${eventId}`);
            return true;
        }
        catch (err) {
            console.warn('[GOOGLE CALENDAR API WARNING] Failed updating event:', err.message);
        }
    }
    console.log(`[MOCK GOOGLE CALENDAR] Event Updated ID: ${eventId} | New Time: ${payload.startDateTime}`);
    return true;
}
