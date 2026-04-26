import { google } from "googleapis";
import process from "node:process";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// If refresh token exists, set it
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
}

export const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
});

export { oauth2Client };

export async function createMeeting(startTime: string, endTime: string) {
    try {
        const event = {
            summary: "Cow Heat Discussion",
            description: "Meeting created from backend",
            start: {
                dateTime: startTime,
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: endTime,
                timeZone: "Asia/Kolkata",
            },
            attendees: [
                { email: "vijayshagara1221@gmail.com" },
                { email: "Pateltoral88@gmail.com" },
            ],
            conferenceData: {
                createRequest: {
                    requestId: "meet-" + Date.now(),
                    conferenceSolutionKey: {
                        type: "hangoutsMeet",
                    },
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            conferenceDataVersion: 1,
            sendUpdates: "all",
            requestBody: event,
        });

        return response.data.hangoutLink;

    } catch (error: any) {
        console.error("❌ Google Meet creation failed:", error.message);
        throw error;
    }
}


