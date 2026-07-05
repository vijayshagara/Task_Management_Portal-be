import { Response } from 'express';
import { AuthenticatedRequest, getUserId } from '../interfaces/auth.interface';
import {
  FarmDiaryService,
  MilkRecordService,
  VaccinationService,
  PregnancyService,
  MilkCollectionService,
  KnowledgeService,
  PushTokenService,
  DeviceApiKeyService,
  AnalyticsService,
  HealthInsightsService,
} from '../services/farm.service';

function handleError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = message.includes('not found') ? 404
    : message.includes('Access denied') || message.includes('access') ? 403
    : 400;
  res.status(status).json({ message });
}

export class FarmController {
  // ─── Diary ──────────────────────────────────────────────────
  static async listDiary(req: AuthenticatedRequest, res: Response) {
    try {
      const entries = await FarmDiaryService.list(
        getUserId(req),
        req.user!.role,
        req.query.month as string | undefined
      );
      res.json(entries);
    } catch (e) { handleError(res, e); }
  }

  static async createDiary(req: AuthenticatedRequest, res: Response) {
    try {
      const entry = await FarmDiaryService.create(getUserId(req), req.user!.role, req.body);
      res.status(201).json(entry);
    } catch (e) { handleError(res, e); }
  }

  static async updateDiary(req: AuthenticatedRequest, res: Response) {
    try {
      const entry = await FarmDiaryService.update(req.params.id, getUserId(req), req.user!.role, req.body);
      if (!entry) { res.status(404).json({ message: 'Entry not found' }); return; }
      res.json(entry);
    } catch (e) { handleError(res, e); }
  }

  static async deleteDiary(req: AuthenticatedRequest, res: Response) {
    try {
      const ok = await FarmDiaryService.delete(req.params.id, getUserId(req), req.user!.role);
      if (!ok) { res.status(404).json({ message: 'Entry not found' }); return; }
      res.json({ message: 'Deleted' });
    } catch (e) { handleError(res, e); }
  }

  // ─── Milk ───────────────────────────────────────────────────
  static async listMilk(req: AuthenticatedRequest, res: Response) {
    try {
      const records = await MilkRecordService.list(
        getUserId(req), req.user!.role,
        req.query.from as string, req.query.to as string
      );
      res.json(records);
    } catch (e) { handleError(res, e); }
  }

  static async createMilk(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await MilkRecordService.create(getUserId(req), req.user!.role, req.body);
      res.status(201).json(record);
    } catch (e) { handleError(res, e); }
  }

  static async deleteMilk(req: AuthenticatedRequest, res: Response) {
    try {
      const ok = await MilkRecordService.delete(req.params.id, getUserId(req), req.user!.role);
      if (!ok) { res.status(404).json({ message: 'Record not found' }); return; }
      res.json({ message: 'Deleted' });
    } catch (e) { handleError(res, e); }
  }

  static async milkTrends(req: AuthenticatedRequest, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trends = await MilkRecordService.getTrends(getUserId(req), req.user!.role, days);
      res.json(trends);
    } catch (e) { handleError(res, e); }
  }

  // ─── Vaccinations ───────────────────────────────────────────
  static async listVaccinations(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(await VaccinationService.list(getUserId(req), req.user!.role));
    } catch (e) { handleError(res, e); }
  }

  static async upcomingVaccinations(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(await VaccinationService.getUpcoming(getUserId(req), req.user!.role));
    } catch (e) { handleError(res, e); }
  }

  static async createVaccination(req: AuthenticatedRequest, res: Response) {
    try {
      res.status(201).json(await VaccinationService.create(getUserId(req), req.user!.role, req.body));
    } catch (e) { handleError(res, e); }
  }

  static async updateVaccination(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await VaccinationService.update(req.params.id, getUserId(req), req.user!.role, req.body);
      if (!record) { res.status(404).json({ message: 'Not found' }); return; }
      res.json(record);
    } catch (e) { handleError(res, e); }
  }

  static async deleteVaccination(req: AuthenticatedRequest, res: Response) {
    try {
      const ok = await VaccinationService.delete(req.params.id, getUserId(req), req.user!.role);
      if (!ok) { res.status(404).json({ message: 'Not found' }); return; }
      res.json({ message: 'Deleted' });
    } catch (e) { handleError(res, e); }
  }

  // ─── Pregnancies ────────────────────────────────────────────
  static async listPregnancies(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(await PregnancyService.list(getUserId(req), req.user!.role));
    } catch (e) { handleError(res, e); }
  }

  static async createPregnancy(req: AuthenticatedRequest, res: Response) {
    try {
      res.status(201).json(await PregnancyService.create(getUserId(req), req.user!.role, req.body));
    } catch (e) { handleError(res, e); }
  }

  static async updatePregnancy(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await PregnancyService.update(req.params.id, getUserId(req), req.user!.role, req.body);
      if (!record) { res.status(404).json({ message: 'Not found' }); return; }
      res.json(record);
    } catch (e) { handleError(res, e); }
  }

  static async recordCalving(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await PregnancyService.recordCalving(req.params.id, getUserId(req), req.user!.role, req.body);
      if (!record) { res.status(404).json({ message: 'Not found' }); return; }
      res.json(record);
    } catch (e) { handleError(res, e); }
  }

  // ─── Collections ────────────────────────────────────────────
  static async listCollections(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(await MilkCollectionService.list(getUserId(req), req.user!.role));
    } catch (e) { handleError(res, e); }
  }

  static async createCollection(req: AuthenticatedRequest, res: Response) {
    try {
      res.status(201).json(await MilkCollectionService.create(getUserId(req), req.body));
    } catch (e) { handleError(res, e); }
  }

  static async updateCollection(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await MilkCollectionService.update(req.params.id, getUserId(req), req.user!.role, req.body);
      if (!record) { res.status(404).json({ message: 'Not found' }); return; }
      res.json(record);
    } catch (e) { handleError(res, e); }
  }

  static async deleteCollection(req: AuthenticatedRequest, res: Response) {
    try {
      const ok = await MilkCollectionService.delete(req.params.id, getUserId(req), req.user!.role);
      if (!ok) { res.status(404).json({ message: 'Not found' }); return; }
      res.json({ message: 'Deleted' });
    } catch (e) { handleError(res, e); }
  }

  // ─── Knowledge ──────────────────────────────────────────────
  static async listKnowledge(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(await KnowledgeService.list(
        req.query.category as string,
        req.query.search as string
      ));
    } catch (e) { handleError(res, e); }
  }

  static async createKnowledge(req: AuthenticatedRequest, res: Response) {
    try {
      const isVerified = req.user!.role === 'admin';
      res.status(201).json(await KnowledgeService.create(getUserId(req), req.body, isVerified));
    } catch (e) { handleError(res, e); }
  }

  static async upvoteKnowledge(req: AuthenticatedRequest, res: Response) {
    try {
      const article = await KnowledgeService.upvote(req.params.id);
      if (!article) { res.status(404).json({ message: 'Not found' }); return; }
      res.json(article);
    } catch (e) { handleError(res, e); }
  }

  // ─── Push & Devices ─────────────────────────────────────────
  static async registerPush(req: AuthenticatedRequest, res: Response) {
    try {
      const { token, platform } = req.body;
      res.json(await PushTokenService.register(getUserId(req), token, platform));
    } catch (e) { handleError(res, e); }
  }

  static async unregisterPush(req: AuthenticatedRequest, res: Response) {
    try {
      await PushTokenService.unregister(req.body.token);
      res.json({ message: 'Unregistered' });
    } catch (e) { handleError(res, e); }
  }

  static async listDevices(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(await DeviceApiKeyService.list(getUserId(req)));
    } catch (e) { handleError(res, e); }
  }

  static async createDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceName, cowId } = req.body;
      res.status(201).json(await DeviceApiKeyService.create(getUserId(req), deviceName, cowId));
    } catch (e) { handleError(res, e); }
  }

  static async revokeDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const ok = await DeviceApiKeyService.revoke(req.params.id, getUserId(req));
      if (!ok) { res.status(404).json({ message: 'Not found' }); return; }
      res.json({ message: 'Revoked' });
    } catch (e) { handleError(res, e); }
  }

  // ─── Analytics & Insights ───────────────────────────────────
  static async analytics(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(await AnalyticsService.getDashboard(getUserId(req), req.user!.role));
    } catch (e) { handleError(res, e); }
  }

  static async healthInsights(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(await HealthInsightsService.getHerdInsights(getUserId(req), req.user!.role));
    } catch (e) { handleError(res, e); }
  }

  static async cowInsight(req: AuthenticatedRequest, res: Response) {
    try {
      const insight = await HealthInsightsService.getCowInsight(req.params.cowId, getUserId(req), req.user!.role);
      if (!insight) { res.status(404).json({ message: 'Not found' }); return; }
      res.json(insight);
    } catch (e) { handleError(res, e); }
  }
}
