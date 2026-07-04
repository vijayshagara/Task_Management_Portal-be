"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleInitialized = exports.calendar = exports.oauth2Client = void 0;
exports.listEvents = listEvents;
exports.createMeeting = createMeeting;
const googleapis_1 = require("googleapis");
const env_1 = __importDefault(require("../utils/env"));
let calendar = null;
exports.calendar = calendar;
let oauth2Client = null;
exports.oauth2Client = oauth2Client;
function initializeGoogleOAuth() {
    // Only initialize if all required credentials are present
    if (!env_1.default.GOOGLE_CLIENT_ID || !env_1.default.GOOGLE_CLIENT_SECRET || !env_1.default.GOOGLE_REDIRECT_URI) {
        console.warn("⚠️ Google OAuth credentials not found. Google Calendar features disabled.");
        return false;
    }
    exports.oauth2Client = oauth2Client = new googleapis_1.google.auth.OAuth2(env_1.default.GOOGLE_CLIENT_ID, env_1.default.GOOGLE_CLIENT_SECRET, env_1.default.GOOGLE_REDIRECT_URI);
    // Set refresh token if available
    if (env_1.default.GOOGLE_REFRESH_TOKEN) {
        oauth2Client.setCredentials({
            refresh_token: env_1.default.GOOGLE_REFRESH_TOKEN,
        });
    }
    exports.calendar = calendar = googleapis_1.google.calendar({
        version: "v3",
        auth: oauth2Client,
    });
    return true;
}
const googleInitialized = initializeGoogleOAuth();
exports.googleInitialized = googleInitialized;
async function listEvents() {
    if (!googleInitialized || !calendar) {
        console.warn("⚠️ Google Calendar not initialized");
        return [];
    }
    try {
        const result = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: "startTime",
        });
        const events = result.data.items || [];
        if (events.length === 0) {
            console.log("ℹ️ No upcoming events found.");
            return [];
        }
        console.log("📅 Upcoming 10 events:");
        events.forEach((event) => {
            const start = event.start?.dateTime ?? event.start?.date;
            console.log(`  ${start} - ${event.summary}`);
        });
        return events;
    }
    catch (error) {
        if (error.message?.includes("invalid_grant")) {
            console.warn("⚠️ Google refresh token expired or invalid");
            console.warn("💡 Generate a new token: http://localhost:5000/generate-token");
        }
        else {
            console.warn("⚠️ Google API Error:", error.message);
        }
        return [];
    }
}
async function createMeeting(startTime, endTime) {
    if (!googleInitialized || !calendar) {
        throw new Error("Google Calendar not initialized");
    }
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
    }
    catch (error) {
        if (error.message?.includes("invalid_grant")) {
            throw new Error("Google refresh token expired. Generate a new one at: /generate-token");
        }
        console.error("❌ Google Meet creation failed:", error.message);
        throw error;
    }
}
