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
    createGoogleMeetForUser,
} from './notification.service';
import config from '../utils/env';

const RETRY_FAILED_AFTER_MS = 5 * 60 * 1000;
let running = false;

/** Runs one delivery channel; a failure is logged but never blocks the other channels. */
async function runChannel(name: string, cowId: string, fn: () => Promise<unknown>): Promise<boolean> {
    try {
        await fn();
        return true;
    } catch (err: any) {
        console.error(`❌ ${name} failed | ${cowId} | ${err?.message || err}`);
        return false;
    }
}

cron.schedule('* * * * *', async () => {
    if (running) return; // don't overlap with a slow previous run
    running = true;
    try {

        const retryBefore = new Date(Date.now() - RETRY_FAILED_AFTER_MS);
        const dueFilter = {
            scheduledAt: { [Op.lte]: new Date() },
            [Op.or]: [
                { status: HeatScheduleStatus.SCHEDULED },
                // Failed reminders are retried, but not every minute.
                { status: HeatScheduleStatus.FAILED, updatedAt: { [Op.lte]: retryBefore } },
            ],
        };

        const schedules = await HeatSchedule.findAll({
            where: dueFilter,
            include: [{ model: Cow, as: 'cow', attributes: ['name'] }],
            limit: 10,
        });

        for (const schedule of schedules) {
            try {
                // 🔒 Atomic claim (prevents duplicate sends across instances)
                const [claimed] = await HeatSchedule.update(
                    { status: HeatScheduleStatus.SENDING },
                    { where: { id: schedule.id, ...dueFilter } }
                );
                if (!claimed) continue;

                const { cowId, alertDay } = schedule;
                const cowName = schedule.cow?.name ?? '';

                const results = await Promise.all([
                    runChannel('Email', cowId, () => sendEmail(cowId, cowName, 'HEAT', alertDay)),
                    runChannel('WhatsApp', cowId, () => sendWhatsApp(cowId, alertDay)),
                    runChannel('SMS', cowId, () => sendSMS(cowId, alertDay)),
                    runChannel('Push', cowId, () => sendPushNotification(cowId, alertDay)),
                    runChannel('Google Meet', cowId, () =>
                        createGoogleMeetForUser(cowId, config.GOOGLE_REFRESH_TOKEN!, alertDay, cowName)
                    ),
                ]);

                // Sent if at least one channel got through; failed only when everything failed.
                const delivered = results.some(Boolean);
                await schedule.update({
                    status: delivered ? HeatScheduleStatus.SENT : HeatScheduleStatus.FAILED,
                });
            } catch (err) {
                console.error('❌ Heat alert failed', err);
                await schedule.update({ status: HeatScheduleStatus.FAILED });
            }
        }
    } catch (err) {
        console.error('❌ Heat cron error', err);
    } finally {
        running = false;
    }
});
