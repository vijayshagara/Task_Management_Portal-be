"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmController = void 0;
const auth_interface_1 = require("../interfaces/auth.interface");
const farm_service_1 = require("../services/farm.service");
function handleError(res, error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('not found') ? 404
        : message.includes('Access denied') || message.includes('access') ? 403
            : 400;
    res.status(status).json({ message });
}
class FarmController {
    // ─── Diary ──────────────────────────────────────────────────
    static async listDiary(req, res) {
        try {
            const entries = await farm_service_1.FarmDiaryService.list((0, auth_interface_1.getUserId)(req), req.user.role, req.query.month);
            res.json(entries);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async createDiary(req, res) {
        try {
            const entry = await farm_service_1.FarmDiaryService.create((0, auth_interface_1.getUserId)(req), req.user.role, req.body);
            res.status(201).json(entry);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async updateDiary(req, res) {
        try {
            const entry = await farm_service_1.FarmDiaryService.update(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role, req.body);
            if (!entry) {
                res.status(404).json({ message: 'Entry not found' });
                return;
            }
            res.json(entry);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async deleteDiary(req, res) {
        try {
            const ok = await farm_service_1.FarmDiaryService.delete(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role);
            if (!ok) {
                res.status(404).json({ message: 'Entry not found' });
                return;
            }
            res.json({ message: 'Deleted' });
        }
        catch (e) {
            handleError(res, e);
        }
    }
    // ─── Milk ───────────────────────────────────────────────────
    static async listMilk(req, res) {
        try {
            const records = await farm_service_1.MilkRecordService.list((0, auth_interface_1.getUserId)(req), req.user.role, req.query.from, req.query.to);
            res.json(records);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async createMilk(req, res) {
        try {
            const record = await farm_service_1.MilkRecordService.create((0, auth_interface_1.getUserId)(req), req.user.role, req.body);
            res.status(201).json(record);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async deleteMilk(req, res) {
        try {
            const ok = await farm_service_1.MilkRecordService.delete(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role);
            if (!ok) {
                res.status(404).json({ message: 'Record not found' });
                return;
            }
            res.json({ message: 'Deleted' });
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async milkTrends(req, res) {
        try {
            const days = parseInt(req.query.days) || 30;
            const trends = await farm_service_1.MilkRecordService.getTrends((0, auth_interface_1.getUserId)(req), req.user.role, days);
            res.json(trends);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    // ─── Vaccinations ───────────────────────────────────────────
    static async listVaccinations(req, res) {
        try {
            res.json(await farm_service_1.VaccinationService.list((0, auth_interface_1.getUserId)(req), req.user.role));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async upcomingVaccinations(req, res) {
        try {
            res.json(await farm_service_1.VaccinationService.getUpcoming((0, auth_interface_1.getUserId)(req), req.user.role));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async createVaccination(req, res) {
        try {
            res.status(201).json(await farm_service_1.VaccinationService.create((0, auth_interface_1.getUserId)(req), req.user.role, req.body));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async updateVaccination(req, res) {
        try {
            const record = await farm_service_1.VaccinationService.update(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role, req.body);
            if (!record) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json(record);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async deleteVaccination(req, res) {
        try {
            const ok = await farm_service_1.VaccinationService.delete(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role);
            if (!ok) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json({ message: 'Deleted' });
        }
        catch (e) {
            handleError(res, e);
        }
    }
    // ─── Pregnancies ────────────────────────────────────────────
    static async listPregnancies(req, res) {
        try {
            res.json(await farm_service_1.PregnancyService.list((0, auth_interface_1.getUserId)(req), req.user.role));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async createPregnancy(req, res) {
        try {
            res.status(201).json(await farm_service_1.PregnancyService.create((0, auth_interface_1.getUserId)(req), req.user.role, req.body));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async updatePregnancy(req, res) {
        try {
            const record = await farm_service_1.PregnancyService.update(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role, req.body);
            if (!record) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json(record);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async recordCalving(req, res) {
        try {
            const record = await farm_service_1.PregnancyService.recordCalving(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role, req.body);
            if (!record) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json(record);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    // ─── Collections ────────────────────────────────────────────
    static async listCollections(req, res) {
        try {
            res.json(await farm_service_1.MilkCollectionService.list((0, auth_interface_1.getUserId)(req), req.user.role));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async createCollection(req, res) {
        try {
            res.status(201).json(await farm_service_1.MilkCollectionService.create((0, auth_interface_1.getUserId)(req), req.body));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async updateCollection(req, res) {
        try {
            const record = await farm_service_1.MilkCollectionService.update(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role, req.body);
            if (!record) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json(record);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async deleteCollection(req, res) {
        try {
            const ok = await farm_service_1.MilkCollectionService.delete(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role);
            if (!ok) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json({ message: 'Deleted' });
        }
        catch (e) {
            handleError(res, e);
        }
    }
    // ─── Knowledge ──────────────────────────────────────────────
    static async listKnowledge(req, res) {
        try {
            res.json(await farm_service_1.KnowledgeService.list(req.query.category, req.query.search));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async createKnowledge(req, res) {
        try {
            const isVerified = req.user.role === 'admin';
            res.status(201).json(await farm_service_1.KnowledgeService.create((0, auth_interface_1.getUserId)(req), req.body, isVerified));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async upvoteKnowledge(req, res) {
        try {
            const article = await farm_service_1.KnowledgeService.upvote(req.params.id);
            if (!article) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json(article);
        }
        catch (e) {
            handleError(res, e);
        }
    }
    // ─── Push & Devices ─────────────────────────────────────────
    static async registerPush(req, res) {
        try {
            const { token, platform } = req.body;
            res.json(await farm_service_1.PushTokenService.register((0, auth_interface_1.getUserId)(req), token, platform));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async unregisterPush(req, res) {
        try {
            await farm_service_1.PushTokenService.unregister(req.body.token);
            res.json({ message: 'Unregistered' });
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async listDevices(req, res) {
        try {
            res.json(await farm_service_1.DeviceApiKeyService.list((0, auth_interface_1.getUserId)(req)));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async createDevice(req, res) {
        try {
            const { deviceName, cowId } = req.body;
            res.status(201).json(await farm_service_1.DeviceApiKeyService.create((0, auth_interface_1.getUserId)(req), deviceName, cowId));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async revokeDevice(req, res) {
        try {
            const ok = await farm_service_1.DeviceApiKeyService.revoke(req.params.id, (0, auth_interface_1.getUserId)(req));
            if (!ok) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json({ message: 'Revoked' });
        }
        catch (e) {
            handleError(res, e);
        }
    }
    // ─── Analytics & Insights ───────────────────────────────────
    static async analytics(req, res) {
        try {
            res.json(await farm_service_1.AnalyticsService.getDashboard((0, auth_interface_1.getUserId)(req), req.user.role));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async healthInsights(req, res) {
        try {
            res.json(await farm_service_1.HealthInsightsService.getHerdInsights((0, auth_interface_1.getUserId)(req), req.user.role));
        }
        catch (e) {
            handleError(res, e);
        }
    }
    static async cowInsight(req, res) {
        try {
            const insight = await farm_service_1.HealthInsightsService.getCowInsight(req.params.cowId, (0, auth_interface_1.getUserId)(req), req.user.role);
            if (!insight) {
                res.status(404).json({ message: 'Not found' });
                return;
            }
            res.json(insight);
        }
        catch (e) {
            handleError(res, e);
        }
    }
}
exports.FarmController = FarmController;
