import 'dotenv/config';
import app from './app';
import sequelize from './config/database';
import HeatSchedule from './models/heat-schedules.model';
// import { heatNotificationQueue } from './queues/heat-notification.queue';
import './services1/heat-cron.service';


const PORT = process.env.PORT || 5000;

/**
 * Reschedule pending heat reminders on server restart
 * - Uses HeatSchedule table (source of truth)
 * - Skips expired schedules
 * - Avoids blocking the event loop
 */
// async function rescheduleHeatReminders() {
//   const schedules = await HeatSchedule.findAll({
//     where: { status: 'scheduled' },
//   });

//   if (!schedules.length) {
//     console.log('ℹ️ No heat reminders to reschedule');
//     return;
//   }

//   const jobs = schedules.map(schedule => {
//     const delay = schedule.scheduledAt.getTime() - Date.now();
//     if (delay <= 0) return null;

//     return heatNotificationQueue.add(
//       'heat-reminder',
//       {
//         scheduleId: schedule.id,
//         cowId: schedule.cowId,
//         alertDay: schedule.alertDay,
//       },
//       {
//         delay,
//         jobId: `heat:${schedule.id}`, // ✅ prevents duplicate jobs
//       }
//     );
//   });

//   await Promise.all(jobs.filter(Boolean));
//   console.log(`🔁 Rescheduled ${jobs.filter(Boolean).length} heat reminders`);
// }

async function initialize() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // ⚠️ Use alter only in development
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
    }

    // ✅ Reschedule AFTER DB is ready
    // await rescheduleHeatReminders();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

initialize();
