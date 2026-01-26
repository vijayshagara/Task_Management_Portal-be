import HeatSchedule, {
  HeatScheduleStatus,
} from '../models/heat-schedules.model';
import { heatNotificationQueue } from '../queues/heat-notification.queue';
import sequelize from '../config/database';

export class HeatSchedulerService {

  // Industry-accepted heat window
  private static readonly HEAT_ALERT_DAYS = [18, 20, 21, 22, 23];

  public static async scheduleHeatReminder(
    heatCycleId: string,
    cowId: string,
    heatStartDate: Date
  ): Promise<void> {

    await sequelize.transaction(async transaction => {

      for (const day of this.HEAT_ALERT_DAYS) {

        const scheduledAt = new Date(
          heatStartDate.getTime() + day * 24 * 60 * 60 * 1000
        );

        // Skip past alerts
        if (scheduledAt.getTime() <= Date.now()) continue;

        // 🔒 Prevent duplicate schedules
        const existing = await HeatSchedule.findOne({
          where: {
            heatCycleId,
            alertDay: day,
          },
          transaction,
        });

        if (existing) continue;

        const schedule = await HeatSchedule.create(
          {
            heatCycleId,
            cowId,
            alertDay: day,
            scheduledAt,
            status: HeatScheduleStatus.SCHEDULED,
          },
          { transaction }
        );

        const delay = scheduledAt.getTime() - Date.now();

        await heatNotificationQueue.add(
          'heat-alert',
          {
            scheduleId: schedule.id,
            cowId,
            alertDay: day,
          },
          {
            delay,
            jobId: `heat:${schedule.id}`, // 🔑 idempotent
          }
        );
      }
    });
  }
}
