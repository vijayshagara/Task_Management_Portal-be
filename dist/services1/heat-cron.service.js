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
node_cron_1.default.schedule('* * * * *', async () => {
    console.log('⏰ Heat cron running...');
    const schedules = await heat_schedules_model_1.default.findAll({
        where: {
            status: {
                [sequelize_1.Op.in]: [
                    heat_schedules_model_1.HeatScheduleStatus.SCHEDULED,
                    heat_schedules_model_1.HeatScheduleStatus.FAILED,
                ],
            },
            scheduledAt: { [sequelize_1.Op.lte]: new Date() },
        },
        include: [
            {
                model: cow_model_1.default,
                as: 'cow',
                attributes: ['name'],
            },
        ],
        limit: 10,
    });
    for (const schedule of schedules) {
        try {
            // 🔒 Atomic update (prevents duplicate send)
            const [updated] = await heat_schedules_model_1.default.update({ status: heat_schedules_model_1.HeatScheduleStatus.SENDING }, {
                where: {
                    id: schedule.id,
                    status: heat_schedules_model_1.HeatScheduleStatus.SCHEDULED,
                },
            });
            if (!updated)
                continue;
            await (0, notification_service_1.sendEmail)(schedule.cowId, schedule.cow.name ?? '', 'HEAT', schedule.alertDay);
            await (0, notification_service_1.sendWhatsApp)(schedule.cowId, schedule.alertDay);
            await (0, notification_service_1.sendSMS)(schedule.cowId, schedule.alertDay);
            await (0, notification_service_1.sendPushNotification)(schedule.cowId, schedule.alertDay);
            // await createGoogleMeetForUser(schedule.cowId, "schedule.refreshToken as any", schedule.alertDay);
            await (0, notification_service_1.createGoogleMeetForUser)(schedule.cowId, env_1.default.GOOGLE_REFRESH_TOKEN, schedule.alertDay);
            await schedule.update({ status: heat_schedules_model_1.HeatScheduleStatus.SENT });
            console.log(`✅ Heat alert sent | ${schedule.cowId}`);
        }
        catch (err) {
            console.error('❌ Heat alert failed', err);
            await schedule.update({ status: heat_schedules_model_1.HeatScheduleStatus.FAILED });
        }
    }
});
