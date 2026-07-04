"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendWhatsApp = sendWhatsApp;
exports.sendSMS = sendSMS;
exports.sendPushNotification = sendPushNotification;
exports.createGoogleMeetForUser = createGoogleMeetForUser;
const googleapis_1 = require("googleapis");
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
async function sendEmail(cowId, cowName, alertType, day) {
    let subject = '';
    let text = '';
    if (alertType === 'HEAT') {
        subject = `Heat Alert for Cow ${cowName}`;
        text = `Cow ${cowName} (${cowId}) is in heat on day ${day}`;
    }
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || 'vijayshagara1221@gmail.com',
        subject,
        text,
    });
    console.log(`📧 Email sent | Cow ${cowId}`);
}
async function sendWhatsApp(cowId, day) {
    console.log(`💬 WhatsApp sent | ${cowId} | Day ${day}`);
}
async function sendSMS(cowId, day) {
    console.log(`📱 SMS sent | ${cowId} | Day ${day}`);
}
async function sendPushNotification(cowId, day) {
    console.log(`🔔 Push sent | ${cowId} | Day ${day}`);
}
async function createGoogleMeetForUser(cowId, refreshToken, day) {
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    // 🔑 Use refresh token
    oAuth2Client.setCredentials({
        refresh_token: refreshToken,
    });
    const calendar = googleapis_1.google.calendar({
        version: "v3",
        auth: oAuth2Client,
    });
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
    const event = {
        summary: `Heat Cycle Reminder – Day ${day}`,
        description: `Cow ${cowId} heat cycle reminder`,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: "Asia/Kolkata",
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: "Asia/Kolkata",
        },
        conferenceData: {
            createRequest: {
                requestId: `${cowId}-day-${day}-${Date.now()}`,
            },
        },
    };
    const res = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: event,
    });
    const meetLink = res.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")?.uri;
    console.log("🎥 Google Meet created:", meetLink);
    return meetLink;
}
