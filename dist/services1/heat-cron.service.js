"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const heat_schedules_model_1 = __importStar(require("../models/heat-schedules.model"));
const cow_model_1 = __importDefault(require("../models/cow.model"));
const notification_service_1 = require("./notification.service");
const env_1 = __importDefault(require("../utils/env"));
const RETRY_FAILED_AFTER_MS = 5 * 60 * 1000;
let running = false;
/** Runs one delivery channel; a failure is logged but never blocks the other channels. */
async function runChannel(name, cowId, fn) {
    try {
        await fn();
        return true;
    }
    catch (err) {
        console.error(`❌ ${name} failed | ${cowId} | ${err?.message || err}`);
        return false;
    }
}
node_cron_1.default.schedule('* * * * *', async () => {
    if (running)
        return; // don't overlap with a slow previous run
    running = true;
    try {
        console.log('⏰ Heat cron running...');
        const retryBefore = new Date(Date.now() - RETRY_FAILED_AFTER_MS);
        const dueFilter = {
            scheduledAt: { [sequelize_1.Op.lte]: new Date() },
            [sequelize_1.Op.or]: [
                { status: heat_schedules_model_1.HeatScheduleStatus.SCHEDULED },
                // Failed reminders are retried, but not every minute.
                { status: heat_schedules_model_1.HeatScheduleStatus.FAILED, updatedAt: { [sequelize_1.Op.lte]: retryBefore } },
            ],
        };
        const schedules = await heat_schedules_model_1.default.findAll({
            where: dueFilter,
            include: [{ model: cow_model_1.default, as: 'cow', attributes: ['name'] }],
            limit: 10,
        });
        for (const schedule of schedules) {
            try {
                // 🔒 Atomic claim (prevents duplicate sends across instances)
                const [claimed] = await heat_schedules_model_1.default.update({ status: heat_schedules_model_1.HeatScheduleStatus.SENDING }, { where: { id: schedule.id, ...dueFilter } });
                if (!claimed)
                    continue;
                const { cowId, alertDay } = schedule;
                const cowName = schedule.cow?.name ?? '';
                const results = await Promise.all([
                    runChannel('Email', cowId, () => (0, notification_service_1.sendEmail)(cowId, cowName, 'HEAT', alertDay)),
                    runChannel('WhatsApp', cowId, () => (0, notification_service_1.sendWhatsApp)(cowId, alertDay)),
                    runChannel('SMS', cowId, () => (0, notification_service_1.sendSMS)(cowId, alertDay)),
                    runChannel('Push', cowId, () => (0, notification_service_1.sendPushNotification)(cowId, alertDay)),
                    runChannel('Google Meet', cowId, () => (0, notification_service_1.createGoogleMeetForUser)(cowId, env_1.default.GOOGLE_REFRESH_TOKEN, alertDay)),
                ]);
                // Sent if at least one channel got through; failed only when everything failed.
                const delivered = results.some(Boolean);
                await schedule.update({
                    status: delivered ? heat_schedules_model_1.HeatScheduleStatus.SENT : heat_schedules_model_1.HeatScheduleStatus.FAILED,
                });
                console.log(delivered
                    ? `✅ Heat alert sent | ${cowId} | day ${alertDay} (${results.filter(Boolean).length}/${results.length} channels)`
                    : `❌ Heat alert failed on every channel | ${cowId} | day ${alertDay}`);
            }
            catch (err) {
                console.error('❌ Heat alert failed', err);
                await schedule.update({ status: heat_schedules_model_1.HeatScheduleStatus.FAILED });
            }
        }
    }
    catch (err) {
        console.error('❌ Heat cron error', err);
    }
    finally {
        running = false;
    }
});
