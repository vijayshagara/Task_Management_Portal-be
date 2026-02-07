import cron from 'node-cron';
import { Op } from 'sequelize';
import HeatSchedule, {
    HeatScheduleStatus,
} from '../models/heat-schedules.model';
import Cow from '../models/cow.model';
import {
    sendEmail,
    sendWhatsApp,
    sendSMS,
    sendPushNotification,
    createGoogleMeet,
} from './notification.service';

cron.schedule('* * * * *', async () => {
    console.log('⏰ Heat cron running...');

    const schedules = await HeatSchedule.findAll({
        where: {
            status: {
                [Op.in]: [
                    HeatScheduleStatus.SCHEDULED,
                    HeatScheduleStatus.FAILED,
                ],
            },
            scheduledAt: { [Op.lte]: new Date() },
        },
        include: [
            {
                model: Cow,
                as: 'cow',
                attributes: ['name'],
            },
        ],
        limit: 10,
    });

    for (const schedule of schedules) {
        try {
            // 🔒 Atomic update (prevents duplicate send)
            const [updated] = await HeatSchedule.update(
                { status: HeatScheduleStatus.SENDING },
                {
                    where: {
                        id: schedule.id,
                        status: HeatScheduleStatus.SCHEDULED,
                    },
                }
            );

            if (!updated) continue;

            await sendEmail(
                schedule.cowId,
                schedule.cow.name ?? '',
                'HEAT',
                schedule.alertDay
            );
            await sendWhatsApp(schedule.cowId, schedule.alertDay);
            await sendSMS(schedule.cowId, schedule.alertDay);
            await sendPushNotification(schedule.cowId, schedule.alertDay);
            await createGoogleMeet(schedule.cowId);

            await schedule.update({ status: HeatScheduleStatus.SENT });

            console.log(`✅ Heat alert sent | ${schedule.cowId}`);
        } catch (err) {
            console.error('❌ Heat alert failed', err);
            await schedule.update({ status: HeatScheduleStatus.FAILED });
        }
    }
});
