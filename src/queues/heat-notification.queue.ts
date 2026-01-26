import 'dotenv/config';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import HeatSchedule from '../models/heat-schedules.model';

// --------------------
// Redis connection
// --------------------
export const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: {},
  retryStrategy: times => Math.min(times * 100, 2000),
});

// --------------------
// Queue
// --------------------
export const heatNotificationQueue = new Queue(
  'heat-notification',
  { connection: redisConnection }
);

// --------------------
// Worker (INSIDE API)
// --------------------
new Worker(
  'heat-notification',
  async job => {
    const { scheduleId, cowId, alertDay } = job.data;

    console.log(`🔥 Heat reminder triggered`);
    console.log(`🐄 Cow: ${cowId} | Day: ${alertDay}`);

    // 🔐 Idempotency check
    const schedule = await HeatSchedule.findByPk(scheduleId);
    if (!schedule || schedule.status !== 'scheduled') {
      console.log('⏭️ Schedule already processed, skipping');
      return;
    }

    try {
      // Send notifications
      await sendEmail(cowId, alertDay);
      await sendWhatsApp(cowId, alertDay);
      await sendSMS(cowId, alertDay);
      await sendPushNotification(cowId, alertDay);
      await createGoogleMeet(cowId);

      // Mark as SENT only after success
      await schedule.update({ status: 'sent' });

      console.log('✅ Heat reminder completed');
    } catch (error) {
      console.error('❌ Notification failed:', error);
      throw error; // BullMQ retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,          // ✅ free hosting friendly
    lockDuration: 60000,     // ✅ prevents duplicate execution
    maxStalledCount: 2,      // ✅ retry safety
  }
);

// --------------------
// Notification stubs
// --------------------
async function sendEmail(cowId: string, day: number) {
  console.log(`📧 Email sent | Cow: ${cowId} | Day: ${day}`);
}

async function sendWhatsApp(cowId: string, day: number) {
  console.log(`💬 WhatsApp sent | Cow: ${cowId} | Day: ${day}`);
}

async function sendSMS(cowId: string, day: number) {
  console.log(`📱 SMS sent | Cow: ${cowId} | Day: ${day}`);
}

async function sendPushNotification(cowId: string, day: number) {
  console.log(`🔔 Push notification sent | Cow: ${cowId} | Day: ${day}`);
}

async function createGoogleMeet(cowId: string) {
  console.log(`📅 Google Meet created`);
  console.log(`🔗 https://meet.google.com/new`);
}
