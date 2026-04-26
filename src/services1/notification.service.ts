import { google } from "googleapis";
import nodemailer from 'nodemailer';

export type AlertType = 'HEAT' | 'MILD_FEVER' | 'HIGH_FEVER';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
});

export async function sendEmail(
  cowId: string,
  cowName: string,
  alertType: AlertType,
  day?: number
) {
  let subject = '';
  let text = '';

  if (alertType === 'HEAT') {
    subject = `Heat Alert for Cow ${cowName}`;
    text = `Cow ${cowName} (${cowId}) is in heat on day ${day}`;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER!,
    to: process.env.EMAIL_TO! || 'vijayshagara1221@gmail.com',
    subject,
    text,
  });

  console.log(`📧 Email sent | Cow ${cowId}`);
}

export async function sendWhatsApp(cowId: string, day: number) {
  console.log(`💬 WhatsApp sent | ${cowId} | Day ${day}`);
}

export async function sendSMS(cowId: string, day: number) {
  console.log(`📱 SMS sent | ${cowId} | Day ${day}`);
}

export async function sendPushNotification(cowId: string, day: number) {
  console.log(`🔔 Push sent | ${cowId} | Day ${day}`);
}


export async function createGoogleMeetForUser(
  cowId: string,
  refreshToken: string,
  day: number
) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!
  );

  // 🔑 Use refresh token
  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({
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

  const meetLink =
    res.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video"
    )?.uri;

  console.log("🎥 Google Meet created:", meetLink);
  return meetLink;
}

