import HeatSchedule, {
  HeatScheduleStatus,
} from '../models/heat-schedules.model';
import { Transaction } from 'sequelize';

export class HeatSchedulerService {

  private static readonly HEAT_ALERT_DAYS = [18,19, 20, 21, 22, 23];

  public static async scheduleHeatReminder(
    heatCycleId: string,
    cowId: string,
    heatStartDate: Date,
    transaction: Transaction
  ): Promise<void> {

    for (const day of this.HEAT_ALERT_DAYS) {

      // 🔒 Always normalize date (extra safety)
      const startDate = new Date(heatStartDate);

      const scheduledAt = new Date(
        startDate.getTime() + day * 24 * 60 * 60 * 1000
      );

      // Skip past alerts
      if (scheduledAt <= new Date()) continue;

      // 🔒 Prevent duplicate schedules
      const existing = await HeatSchedule.findOne({
        where: {
          heatCycleId,
          alertDay: day,
        },
        transaction, // ✅ SAME transaction
      });

      if (existing) continue;

      await HeatSchedule.create(
        {
          heatCycleId,
          cowId,
          alertDay: day,
          scheduledAt,
          status: HeatScheduleStatus.SCHEDULED,
        },
        { transaction } // ✅ SAME transaction
      );
    }
  }
}
