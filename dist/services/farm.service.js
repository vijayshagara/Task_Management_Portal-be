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
exports.HealthInsightsService = exports.AnalyticsService = exports.DeviceApiKeyService = exports.PushTokenService = exports.KnowledgeService = exports.MilkCollectionService = exports.PregnancyService = exports.VaccinationService = exports.MilkRecordService = exports.FarmDiaryService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const farm_diary_model_1 = __importDefault(require("../models/farm-diary.model"));
const milk_record_model_1 = __importStar(require("../models/milk-record.model"));
const vaccination_model_1 = __importStar(require("../models/vaccination.model"));
const pregnancy_model_1 = __importStar(require("../models/pregnancy.model"));
const milk_collection_model_1 = __importStar(require("../models/milk-collection.model"));
const knowledge_article_model_1 = __importStar(require("../models/knowledge-article.model"));
const push_token_model_1 = __importDefault(require("../models/push-token.model"));
const device_api_key_model_1 = __importDefault(require("../models/device-api-key.model"));
const cow_model_1 = require("../models/cow.model");
const health_record_model_1 = __importDefault(require("../models/health-record.model"));
const heat_cycle_model_1 = __importDefault(require("../models/heat-cycle.model"));
const farm_access_1 = require("../utils/farm-access");
const cowInclude = { model: cow_model_1.Cow, attributes: ['id', 'name', 'breed'] };
// ─── Farm Diary ───────────────────────────────────────────────
const diarySchema = zod_1.z.object({
    entryDate: zod_1.z.coerce.date(),
    content: zod_1.z.string().min(1),
    weather: zod_1.z.string().optional(),
    feedNotes: zod_1.z.string().optional(),
    cowId: zod_1.z.string().uuid().optional().nullable(),
    photos: zod_1.z.array(zod_1.z.string()).optional(),
    shareToFeed: zod_1.z.boolean().optional(),
    voiceNoteUrl: zod_1.z.string().optional().nullable(),
});
class FarmDiaryService {
    static async list(userId, role, month) {
        const where = (0, farm_access_1.isAdmin)(role) ? {} : { userId };
        if (month) {
            const [year, m] = month.split('-').map(Number);
            const start = new Date(year, m - 1, 1);
            const end = new Date(year, m, 0);
            where.entryDate = { [sequelize_1.Op.between]: [start, end] };
        }
        return farm_diary_model_1.default.findAll({
            where,
            include: [cowInclude],
            order: [['entryDate', 'DESC']],
        });
    }
    static async getById(id, userId, role) {
        const entry = await farm_diary_model_1.default.findByPk(id, { include: [cowInclude] });
        if (!entry)
            return null;
        if (!(0, farm_access_1.isAdmin)(role) && entry.userId !== userId)
            throw new Error('Access denied');
        return entry;
    }
    static async create(userId, role, data) {
        const parsed = diarySchema.parse(data);
        if (parsed.cowId)
            await (0, farm_access_1.assertCowAccess)(parsed.cowId, userId, role);
        return farm_diary_model_1.default.create({ ...parsed, userId });
    }
    static async update(id, userId, role, data) {
        const entry = await this.getById(id, userId, role);
        if (!entry)
            return null;
        const parsed = diarySchema.partial().parse(data);
        if (parsed.cowId)
            await (0, farm_access_1.assertCowAccess)(parsed.cowId, userId, role);
        return entry.update(parsed);
    }
    static async delete(id, userId, role) {
        const entry = await this.getById(id, userId, role);
        if (!entry)
            return false;
        await entry.destroy();
        return true;
    }
}
exports.FarmDiaryService = FarmDiaryService;
// ─── Milk Records ─────────────────────────────────────────────
const milkSchema = zod_1.z.object({
    recordDate: zod_1.z.coerce.date(),
    session: zod_1.z.nativeEnum(milk_record_model_1.MilkSession),
    liters: zod_1.z.number().positive(),
    cowId: zod_1.z.string().uuid().optional().nullable(),
    fatPercent: zod_1.z.number().min(0).max(100).optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
class MilkRecordService {
    static async list(userId, role, from, to) {
        const where = (0, farm_access_1.isAdmin)(role) ? {} : { userId };
        if (from && to) {
            where.recordDate = { [sequelize_1.Op.between]: [from, to] };
        }
        return milk_record_model_1.default.findAll({
            where,
            include: [cowInclude],
            order: [['recordDate', 'DESC'], ['session', 'ASC']],
        });
    }
    static async create(userId, role, data) {
        const parsed = milkSchema.parse(data);
        if (parsed.cowId)
            await (0, farm_access_1.assertCowAccess)(parsed.cowId, userId, role);
        return milk_record_model_1.default.create({ ...parsed, userId });
    }
    static async delete(id, userId, role) {
        const record = await milk_record_model_1.default.findByPk(id);
        if (!record)
            return false;
        if (!(0, farm_access_1.isAdmin)(role) && record.userId !== userId)
            throw new Error('Access denied');
        await record.destroy();
        return true;
    }
    static async getTrends(userId, role, days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const where = {
            recordDate: { [sequelize_1.Op.gte]: since.toISOString().split('T')[0] },
        };
        if (!(0, farm_access_1.isAdmin)(role))
            where.userId = userId;
        const records = await milk_record_model_1.default.findAll({ where, order: [['recordDate', 'ASC']] });
        const byDate = {};
        for (const r of records) {
            const key = String(r.recordDate);
            byDate[key] = (byDate[key] || 0) + r.liters;
        }
        return Object.entries(byDate).map(([date, liters]) => ({ date, liters }));
    }
}
exports.MilkRecordService = MilkRecordService;
// ─── Vaccinations ─────────────────────────────────────────────
const vaccinationSchema = zod_1.z.object({
    cowId: zod_1.z.string().uuid(),
    vaccineName: zod_1.z.string().min(1),
    scheduledDate: zod_1.z.coerce.date(),
    administeredDate: zod_1.z.coerce.date().optional().nullable(),
    status: zod_1.z.nativeEnum(vaccination_model_1.VaccinationStatus).optional(),
    vetName: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    nextDueDate: zod_1.z.coerce.date().optional().nullable(),
});
class VaccinationService {
    static async list(userId, role) {
        const where = (0, farm_access_1.isAdmin)(role) ? {} : { userId };
        return vaccination_model_1.default.findAll({
            where,
            include: [cowInclude],
            order: [['scheduledDate', 'ASC']],
        });
    }
    static async create(userId, role, data) {
        const parsed = vaccinationSchema.parse(data);
        await (0, farm_access_1.assertCowAccess)(parsed.cowId, userId, role);
        return vaccination_model_1.default.create({ ...parsed, userId });
    }
    static async update(id, userId, role, data) {
        const record = await vaccination_model_1.default.findByPk(id);
        if (!record)
            return null;
        if (!(0, farm_access_1.isAdmin)(role) && record.userId !== userId)
            throw new Error('Access denied');
        const parsed = vaccinationSchema.partial().parse(data);
        return record.update(parsed);
    }
    static async delete(id, userId, role) {
        const record = await vaccination_model_1.default.findByPk(id);
        if (!record)
            return false;
        if (!(0, farm_access_1.isAdmin)(role) && record.userId !== userId)
            throw new Error('Access denied');
        await record.destroy();
        return true;
    }
    static async getUpcoming(userId, role, days = 14) {
        const until = new Date();
        until.setDate(until.getDate() + days);
        const where = {
            status: vaccination_model_1.VaccinationStatus.SCHEDULED,
            scheduledDate: { [sequelize_1.Op.lte]: until.toISOString().split('T')[0] },
        };
        if (!(0, farm_access_1.isAdmin)(role))
            where.userId = userId;
        return vaccination_model_1.default.findAll({ where, include: [cowInclude], order: [['scheduledDate', 'ASC']] });
    }
}
exports.VaccinationService = VaccinationService;
// ─── Pregnancies ──────────────────────────────────────────────
const pregnancySchema = zod_1.z.object({
    cowId: zod_1.z.string().uuid(),
    conceptionDate: zod_1.z.coerce.date(),
    expectedCalvingDate: zod_1.z.coerce.date().optional().nullable(),
    status: zod_1.z.nativeEnum(pregnancy_model_1.PregnancyStatus).optional(),
    sireName: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
class PregnancyService {
    static async list(userId, role) {
        const where = (0, farm_access_1.isAdmin)(role) ? {} : { userId };
        return pregnancy_model_1.default.findAll({
            where,
            include: [cowInclude],
            order: [['conceptionDate', 'DESC']],
        });
    }
    static async create(userId, role, data) {
        const parsed = pregnancySchema.parse(data);
        await (0, farm_access_1.assertCowAccess)(parsed.cowId, userId, role);
        const expectedCalvingDate = parsed.expectedCalvingDate ||
            new Date(new Date(parsed.conceptionDate).getTime() + 283 * 86400000);
        return pregnancy_model_1.default.create({ ...parsed, expectedCalvingDate, userId });
    }
    static async update(id, userId, role, data) {
        const record = await pregnancy_model_1.default.findByPk(id);
        if (!record)
            return null;
        if (!(0, farm_access_1.isAdmin)(role) && record.userId !== userId)
            throw new Error('Access denied');
        return record.update(pregnancySchema.partial().parse(data));
    }
    static async recordCalving(id, userId, role, calfData) {
        const pregnancy = await pregnancy_model_1.default.findByPk(id);
        if (!pregnancy)
            return null;
        if (!(0, farm_access_1.isAdmin)(role) && pregnancy.userId !== userId)
            throw new Error('Access denied');
        let calfId = null;
        if (calfData) {
            const cow = await cow_model_1.Cow.findByPk(pregnancy.cowId);
            const calf = await cow_model_1.Cow.create({
                name: calfData.name,
                breed: calfData.breed || cow?.breed || 'Unknown',
                gender: calfData.gender,
                birthDate: new Date(),
                motherName: cow?.name || null,
                ownerId: userId,
            });
            calfId = calf.id;
        }
        return pregnancy.update({
            status: pregnancy_model_1.PregnancyStatus.CALVED,
            actualCalvingDate: new Date(),
            calfId,
        });
    }
}
exports.PregnancyService = PregnancyService;
// ─── Milk Collections ─────────────────────────────────────────
const collectionSchema = zod_1.z.object({
    collectionDate: zod_1.z.coerce.date(),
    totalLiters: zod_1.z.number().positive(),
    fatPercent: zod_1.z.number().optional().nullable(),
    snfPercent: zod_1.z.number().optional().nullable(),
    ratePerLiter: zod_1.z.number().optional().nullable(),
    cooperativeName: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    status: zod_1.z.nativeEnum(milk_collection_model_1.CollectionStatus).optional(),
    rejectionReason: zod_1.z.string().optional().nullable(),
});
class MilkCollectionService {
    static async list(userId, role) {
        const where = (0, farm_access_1.isAdmin)(role) ? {} : { userId };
        return milk_collection_model_1.default.findAll({ where, order: [['collectionDate', 'DESC']] });
    }
    static async create(userId, data) {
        const parsed = collectionSchema.parse(data);
        const totalAmount = parsed.ratePerLiter != null ? parsed.totalLiters * parsed.ratePerLiter : null;
        return milk_collection_model_1.default.create({ ...parsed, userId, totalAmount });
    }
    static async update(id, userId, role, data) {
        const record = await milk_collection_model_1.default.findByPk(id);
        if (!record)
            return null;
        if (!(0, farm_access_1.isAdmin)(role) && record.userId !== userId)
            throw new Error('Access denied');
        const parsed = collectionSchema.partial().parse(data);
        const totalAmount = parsed.ratePerLiter != null && parsed.totalLiters != null
            ? parsed.totalLiters * parsed.ratePerLiter
            : record.totalAmount;
        return record.update({ ...parsed, totalAmount });
    }
    static async delete(id, userId, role) {
        const record = await milk_collection_model_1.default.findByPk(id);
        if (!record)
            return false;
        if (!(0, farm_access_1.isAdmin)(role) && record.userId !== userId)
            throw new Error('Access denied');
        await record.destroy();
        return true;
    }
}
exports.MilkCollectionService = MilkCollectionService;
// ─── Knowledge Base ───────────────────────────────────────────
const articleSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    content: zod_1.z.string().min(10),
    category: zod_1.z.nativeEnum(knowledge_article_model_1.ArticleCategory).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isPublished: zod_1.z.boolean().optional(),
});
class KnowledgeService {
    static async list(category, search) {
        const where = { isPublished: true };
        if (category)
            where.category = category;
        if (search) {
            where[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { content: { [sequelize_1.Op.iLike]: `%${search}%` } },
            ];
        }
        return knowledge_article_model_1.default.findAll({
            where,
            order: [['upvotes', 'DESC'], ['createdAt', 'DESC']],
        });
    }
    static async create(authorId, data, isVerified = false) {
        return knowledge_article_model_1.default.create({
            ...articleSchema.parse(data),
            authorId,
            isVerified,
        });
    }
    static async upvote(id) {
        const article = await knowledge_article_model_1.default.findByPk(id);
        if (!article)
            return null;
        return article.update({ upvotes: article.upvotes + 1 });
    }
}
exports.KnowledgeService = KnowledgeService;
// ─── Push Tokens ──────────────────────────────────────────────
class PushTokenService {
    static async register(userId, token, platform) {
        const [record] = await push_token_model_1.default.findOrCreate({
            where: { token },
            defaults: { userId, token, platform: platform || null },
        });
        if (record.userId !== userId)
            await record.update({ userId });
        return record;
    }
    static async unregister(token) {
        return push_token_model_1.default.destroy({ where: { token } });
    }
    static async sendToUser(userId, title, body) {
        const tokens = await push_token_model_1.default.findAll({ where: { userId } });
        // FCM integration stub — logs for now; wire Expo push or FCM in production
        for (const t of tokens) {
            console.log(`[PUSH] → ${t.token}: ${title} — ${body}`);
        }
        return tokens.length;
    }
}
exports.PushTokenService = PushTokenService;
// ─── Device API Keys (IoT) ────────────────────────────────────
class DeviceApiKeyService {
    static async create(userId, deviceName, cowId) {
        if (cowId)
            await (0, farm_access_1.assertCowAccess)(cowId, userId, 'farmer');
        const apiKey = `iot_${crypto_1.default.randomBytes(24).toString('hex')}`;
        return device_api_key_model_1.default.create({ userId, deviceName, cowId: cowId || null, apiKey });
    }
    static async list(userId) {
        return device_api_key_model_1.default.findAll({
            where: { userId },
            include: [cowInclude],
            order: [['createdAt', 'DESC']],
        });
    }
    static async revoke(id, userId) {
        const key = await device_api_key_model_1.default.findByPk(id);
        if (!key || key.userId !== userId)
            return false;
        await key.update({ isActive: false });
        return true;
    }
    static async validate(apiKey) {
        const key = await device_api_key_model_1.default.findOne({ where: { apiKey, isActive: true } });
        if (key)
            await key.update({ lastUsedAt: new Date() });
        return key;
    }
}
exports.DeviceApiKeyService = DeviceApiKeyService;
// ─── Analytics ────────────────────────────────────────────────
class AnalyticsService {
    static async getDashboard(userId, role) {
        const cowWhere = (0, farm_access_1.cowScopeWhere)(userId, role);
        const userWhere = (0, farm_access_1.isAdmin)(role) ? {} : { userId };
        const [cowCount, healthCount, heatPending, milkTotal, upcomingVaccinations, activePregnancies] = await Promise.all([
            cow_model_1.Cow.count({ where: cowWhere }),
            health_record_model_1.default.count({
                include: (0, farm_access_1.isAdmin)(role) ? [] : [{ model: cow_model_1.Cow, where: cowWhere, required: true }],
            }),
            heat_cycle_model_1.default.count({
                where: { status: 'pending' },
                include: (0, farm_access_1.isAdmin)(role) ? [] : [{ model: cow_model_1.Cow, where: cowWhere, required: true }],
            }),
            milk_record_model_1.default.sum('liters', { where: userWhere }),
            vaccination_model_1.default.count({
                where: { ...userWhere, status: vaccination_model_1.VaccinationStatus.SCHEDULED },
            }),
            pregnancy_model_1.default.count({
                where: { ...userWhere, status: { [sequelize_1.Op.in]: [pregnancy_model_1.PregnancyStatus.CONFIRMED, pregnancy_model_1.PregnancyStatus.IN_PROGRESS] } },
            }),
        ]);
        const milkTrend = await MilkRecordService.getTrends(userId, role, 14);
        const healthInsights = await HealthInsightsService.getHerdInsights(userId, role);
        return {
            cowCount,
            healthCount,
            heatPending,
            milkTotal: milkTotal || 0,
            upcomingVaccinations,
            activePregnancies,
            milkTrend,
            healthInsights,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
// ─── Health Insights ──────────────────────────────────────────
class HealthInsightsService {
    static async getHerdInsights(userId, role) {
        const cowWhere = (0, farm_access_1.cowScopeWhere)(userId, role);
        const cows = await cow_model_1.Cow.findAll({ where: cowWhere, attributes: ['id', 'name'] });
        const insights = await Promise.all(cows.map(async (cow) => {
            const records = await health_record_model_1.default.findAll({
                where: { cowId: cow.id },
                order: [['recordedAt', 'DESC']],
                limit: 7,
            });
            if (!records.length)
                return { cowId: cow.id, cowName: cow.name, score: 100, alerts: [] };
            const alerts = [];
            let score = 100;
            const temps = records.filter((r) => r.temperature != null).map((r) => r.temperature);
            if (temps.length >= 2) {
                const avgRecent = temps.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, temps.length);
                const avgOlder = temps.slice(3).reduce((a, b) => a + b, 0) / Math.max(1, temps.length - 3);
                if (avgRecent > avgOlder + 0.5) {
                    alerts.push('Temperature trending upward');
                    score -= 20;
                }
            }
            const latest = records[0];
            if (latest.temperature != null && latest.temperature >= 39.3) {
                alerts.push(`Elevated temperature: ${latest.temperature}°C`);
                score -= latest.temperature >= 40 ? 40 : 20;
            }
            if (latest.eatingStatus === 'poor' || latest.eatingStatus === 'refused') {
                alerts.push('Poor eating status');
                score -= 15;
            }
            if (latest.activityLevel === 'low' || latest.activityLevel === 'lethargic') {
                alerts.push('Low activity detected');
                score -= 10;
            }
            return {
                cowId: cow.id,
                cowName: cow.name,
                score: Math.max(0, score),
                alerts,
                latestTemp: latest.temperature,
                latestRecordedAt: latest.recordedAt,
            };
        }));
        return insights.sort((a, b) => a.score - b.score);
    }
    static async getCowInsight(cowId, userId, role) {
        await (0, farm_access_1.assertCowAccess)(cowId, userId, role);
        const herd = await this.getHerdInsights(userId, role);
        return herd.find((h) => h.cowId === cowId) || null;
    }
}
exports.HealthInsightsService = HealthInsightsService;
