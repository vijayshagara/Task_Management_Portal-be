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

export async function createGoogleMeet(cowId: string) {
  console.log(`📅 Meet created | ${cowId}`);
}
