import crypto from 'crypto';
import { Op } from 'sequelize';
import { z } from 'zod';
import FarmDiary from '../models/farm-diary.model';
import MilkRecord, { MilkSession } from '../models/milk-record.model';
import Vaccination, { VaccinationStatus } from '../models/vaccination.model';
import Pregnancy, { PregnancyStatus } from '../models/pregnancy.model';
import MilkCollection, { CollectionStatus } from '../models/milk-collection.model';
import KnowledgeArticle, { ArticleCategory } from '../models/knowledge-article.model';
import PushToken from '../models/push-token.model';
import DeviceApiKey from '../models/device-api-key.model';
import { Cow } from '../models/cow.model';
import HealthRecord from '../models/health-record.model';
import HeatCycle from '../models/heat-cycle.model';
import { assertCowAccess, cowScopeWhere, isAdmin } from '../utils/farm-access';

const cowInclude = { model: Cow, attributes: ['id', 'name', 'breed'] };

// ─── Farm Diary ───────────────────────────────────────────────

const diarySchema = z.object({
  entryDate: z.coerce.date(),
  content: z.string().min(1),
  weather: z.string().optional(),
  feedNotes: z.string().optional(),
  cowId: z.string().uuid().optional().nullable(),
  photos: z.array(z.string()).optional(),
  shareToFeed: z.boolean().optional(),
  voiceNoteUrl: z.string().optional().nullable(),
});

export class FarmDiaryService {
  static async list(userId: string, role: string, month?: string) {
    const where: Record<string, unknown> = isAdmin(role) ? {} : { userId };
    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0);
      where.entryDate = { [Op.between]: [start, end] };
    }
    return FarmDiary.findAll({
      where,
      include: [cowInclude],
      order: [['entryDate', 'DESC']],
    });
  }

  static async getById(id: string, userId: string, role: string) {
    const entry = await FarmDiary.findByPk(id, { include: [cowInclude] });
    if (!entry) return null;
    if (!isAdmin(role) && entry.userId !== userId) throw new Error('Access denied');
    return entry;
  }

  static async create(userId: string, role: string, data: unknown) {
    const parsed = diarySchema.parse(data);
    if (parsed.cowId) await assertCowAccess(parsed.cowId, userId, role);
    return FarmDiary.create({ ...parsed, userId });
  }

  static async update(id: string, userId: string, role: string, data: unknown) {
    const entry = await this.getById(id, userId, role);
    if (!entry) return null;
    const parsed = diarySchema.partial().parse(data);
    if (parsed.cowId) await assertCowAccess(parsed.cowId, userId, role);
    return entry.update(parsed);
  }

  static async delete(id: string, userId: string, role: string) {
    const entry = await this.getById(id, userId, role);
    if (!entry) return false;
    await entry.destroy();
    return true;
  }
}

// ─── Milk Records ─────────────────────────────────────────────

const milkSchema = z.object({
  recordDate: z.coerce.date(),
  session: z.nativeEnum(MilkSession),
  liters: z.number().positive(),
  cowId: z.string().uuid().optional().nullable(),
  fatPercent: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export class MilkRecordService {
  static async list(userId: string, role: string, from?: string, to?: string) {
    const where: Record<string, unknown> = isAdmin(role) ? {} : { userId };
    if (from && to) {
      where.recordDate = { [Op.between]: [from, to] };
    }
    return MilkRecord.findAll({
      where,
      include: [cowInclude],
      order: [['recordDate', 'DESC'], ['session', 'ASC']],
    });
  }

  static async create(userId: string, role: string, data: unknown) {
    const parsed = milkSchema.parse(data);
    if (parsed.cowId) await assertCowAccess(parsed.cowId, userId, role);
    return MilkRecord.create({ ...parsed, userId });
  }

  static async delete(id: string, userId: string, role: string) {
    const record = await MilkRecord.findByPk(id);
    if (!record) return false;
    if (!isAdmin(role) && record.userId !== userId) throw new Error('Access denied');
    await record.destroy();
    return true;
  }

  static async getTrends(userId: string, role: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const where: Record<string, unknown> = {
      recordDate: { [Op.gte]: since.toISOString().split('T')[0] },
    };
    if (!isAdmin(role)) where.userId = userId;

    const records = await MilkRecord.findAll({ where, order: [['recordDate', 'ASC']] });
    const byDate: Record<string, number> = {};
    for (const r of records) {
      const key = String(r.recordDate);
      byDate[key] = (byDate[key] || 0) + r.liters;
    }
    return Object.entries(byDate).map(([date, liters]) => ({ date, liters }));
  }
}

// ─── Vaccinations ─────────────────────────────────────────────

const vaccinationSchema = z.object({
  cowId: z.string().uuid(),
  vaccineName: z.string().min(1),
  scheduledDate: z.coerce.date(),
  administeredDate: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(VaccinationStatus).optional(),
  vetName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  nextDueDate: z.coerce.date().optional().nullable(),
});

export class VaccinationService {
  static async list(userId: string, role: string) {
    const where = isAdmin(role) ? {} : { userId };
    return Vaccination.findAll({
      where,
      include: [cowInclude],
      order: [['scheduledDate', 'ASC']],
    });
  }

  static async create(userId: string, role: string, data: unknown) {
    const parsed = vaccinationSchema.parse(data);
    await assertCowAccess(parsed.cowId, userId, role);
    return Vaccination.create({ ...parsed, userId });
  }

  static async update(id: string, userId: string, role: string, data: unknown) {
    const record = await Vaccination.findByPk(id);
    if (!record) return null;
    if (!isAdmin(role) && record.userId !== userId) throw new Error('Access denied');
    const parsed = vaccinationSchema.partial().parse(data);
    return record.update(parsed);
  }

  static async delete(id: string, userId: string, role: string) {
    const record = await Vaccination.findByPk(id);
    if (!record) return false;
    if (!isAdmin(role) && record.userId !== userId) throw new Error('Access denied');
    await record.destroy();
    return true;
  }

  static async getUpcoming(userId: string, role: string, days = 14) {
    const until = new Date();
    until.setDate(until.getDate() + days);
    const where: Record<string, unknown> = {
      status: VaccinationStatus.SCHEDULED,
      scheduledDate: { [Op.lte]: until.toISOString().split('T')[0] },
    };
    if (!isAdmin(role)) where.userId = userId;
    return Vaccination.findAll({ where, include: [cowInclude], order: [['scheduledDate', 'ASC']] });
  }
}

// ─── Pregnancies ──────────────────────────────────────────────

const pregnancySchema = z.object({
  cowId: z.string().uuid(),
  conceptionDate: z.coerce.date(),
  expectedCalvingDate: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(PregnancyStatus).optional(),
  sireName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export class PregnancyService {
  static async list(userId: string, role: string) {
    const where = isAdmin(role) ? {} : { userId };
    return Pregnancy.findAll({
      where,
      include: [cowInclude],
      order: [['conceptionDate', 'DESC']],
    });
  }

  static async create(userId: string, role: string, data: unknown) {
    const parsed = pregnancySchema.parse(data);
    await assertCowAccess(parsed.cowId, userId, role);
    const expectedCalvingDate =
      parsed.expectedCalvingDate ||
      new Date(new Date(parsed.conceptionDate).getTime() + 283 * 86400000);
    return Pregnancy.create({ ...parsed, expectedCalvingDate, userId });
  }

  static async update(id: string, userId: string, role: string, data: unknown) {
    const record = await Pregnancy.findByPk(id);
    if (!record) return null;
    if (!isAdmin(role) && record.userId !== userId) throw new Error('Access denied');
    return record.update(pregnancySchema.partial().parse(data));
  }

  static async recordCalving(id: string, userId: string, role: string, calfData?: { name: string; breed: string; gender: string }) {
    const pregnancy = await Pregnancy.findByPk(id);
    if (!pregnancy) return null;
    if (!isAdmin(role) && pregnancy.userId !== userId) throw new Error('Access denied');

    let calfId: string | null = null;
    if (calfData) {
      const cow = await Cow.findByPk(pregnancy.cowId);
      const calf = await Cow.create({
        name: calfData.name,
        breed: calfData.breed || cow?.breed || 'Unknown',
        gender: calfData.gender as any,
        birthDate: new Date(),
        motherName: cow?.name || null,
        ownerId: userId,
      });
      calfId = calf.id;
    }

    return pregnancy.update({
      status: PregnancyStatus.CALVED,
      actualCalvingDate: new Date(),
      calfId,
    });
  }
}

// ─── Milk Collections ─────────────────────────────────────────

const collectionSchema = z.object({
  collectionDate: z.coerce.date(),
  totalLiters: z.number().positive(),
  fatPercent: z.number().optional().nullable(),
  snfPercent: z.number().optional().nullable(),
  ratePerLiter: z.number().optional().nullable(),
  cooperativeName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(CollectionStatus).optional(),
  rejectionReason: z.string().optional().nullable(),
});

export class MilkCollectionService {
  static async list(userId: string, role: string) {
    const where = isAdmin(role) ? {} : { userId };
    return MilkCollection.findAll({ where, order: [['collectionDate', 'DESC']] });
  }

  static async create(userId: string, data: unknown) {
    const parsed = collectionSchema.parse(data);
    const totalAmount =
      parsed.ratePerLiter != null ? parsed.totalLiters * parsed.ratePerLiter : null;
    return MilkCollection.create({ ...parsed, userId, totalAmount });
  }

  static async update(id: string, userId: string, role: string, data: unknown) {
    const record = await MilkCollection.findByPk(id);
    if (!record) return null;
    if (!isAdmin(role) && record.userId !== userId) throw new Error('Access denied');
    const parsed = collectionSchema.partial().parse(data);
    const totalAmount =
      parsed.ratePerLiter != null && parsed.totalLiters != null
        ? parsed.totalLiters * parsed.ratePerLiter
        : record.totalAmount;
    return record.update({ ...parsed, totalAmount });
  }

  static async delete(id: string, userId: string, role: string) {
    const record = await MilkCollection.findByPk(id);
    if (!record) return false;
    if (!isAdmin(role) && record.userId !== userId) throw new Error('Access denied');
    await record.destroy();
    return true;
  }
}

// ─── Knowledge Base ───────────────────────────────────────────

const articleSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.nativeEnum(ArticleCategory).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export class KnowledgeService {
  static async list(category?: string, search?: string) {
    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;
    if (search) {
      where[Op.or as any] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }
    return KnowledgeArticle.findAll({
      where,
      order: [['upvotes', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  static async create(authorId: string, data: unknown, isVerified = false) {
    return KnowledgeArticle.create({
      ...articleSchema.parse(data),
      authorId,
      isVerified,
    });
  }

  static async upvote(id: string) {
    const article = await KnowledgeArticle.findByPk(id);
    if (!article) return null;
    return article.update({ upvotes: article.upvotes + 1 });
  }
}

// ─── Push Tokens ──────────────────────────────────────────────

export class PushTokenService {
  static async register(userId: string, token: string, platform?: string) {
    const [record] = await PushToken.findOrCreate({
      where: { token },
      defaults: { userId, token, platform: platform || null },
    });
    if (record.userId !== userId) await record.update({ userId });
    return record;
  }

  static async unregister(token: string, userId: string) {
    return PushToken.destroy({ where: { token, userId } });
  }

  static async sendToUser(userId: string, title: string, body: string) {
    const tokens = await PushToken.findAll({ where: { userId } });
    // FCM integration stub — logs for now; wire Expo push or FCM in production
    for (const t of tokens) {
      console.log(`[PUSH] → ${t.token}: ${title} — ${body}`);
    }
    return tokens.length;
  }
}

// ─── Device API Keys (IoT) ────────────────────────────────────

export class DeviceApiKeyService {
  static async create(userId: string, deviceName: string, cowId?: string) {
    if (cowId) await assertCowAccess(cowId, userId, 'farmer');
    const apiKey = `iot_${crypto.randomBytes(24).toString('hex')}`;
    return DeviceApiKey.create({ userId, deviceName, cowId: cowId || null, apiKey });
  }

  static async list(userId: string) {
    return DeviceApiKey.findAll({
      where: { userId },
      include: [cowInclude],
      order: [['createdAt', 'DESC']],
    });
  }

  static async revoke(id: string, userId: string) {
    const key = await DeviceApiKey.findByPk(id);
    if (!key || key.userId !== userId) return false;
    await key.update({ isActive: false });
    return true;
  }

  static async validate(apiKey: string): Promise<DeviceApiKey | null> {
    const key = await DeviceApiKey.findOne({ where: { apiKey, isActive: true } });
    if (key) await key.update({ lastUsedAt: new Date() });
    return key;
  }
}

// ─── Analytics ────────────────────────────────────────────────

export class AnalyticsService {
  static async getDashboard(userId: string, role: string) {
    const cowWhere = cowScopeWhere(userId, role);
    const userWhere = isAdmin(role) ? {} : { userId };

    const [cowCount, healthCount, heatPending, milkTotal, upcomingVaccinations, activePregnancies] =
      await Promise.all([
        Cow.count({ where: cowWhere }),
        HealthRecord.count({
          include: isAdmin(role) ? [] : [{ model: Cow, where: cowWhere, required: true }],
        }),
        HeatCycle.count({
          where: { status: 'pending' },
          include: isAdmin(role) ? [] : [{ model: Cow, where: cowWhere, required: true }],
        }),
        MilkRecord.sum('liters', { where: userWhere }),
        Vaccination.count({
          where: { ...userWhere, status: VaccinationStatus.SCHEDULED },
        }),
        Pregnancy.count({
          where: { ...userWhere, status: { [Op.in]: [PregnancyStatus.CONFIRMED, PregnancyStatus.IN_PROGRESS] } },
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

// ─── Health Insights ──────────────────────────────────────────

export class HealthInsightsService {
  static async getHerdInsights(userId: string, role: string) {
    const cowWhere = cowScopeWhere(userId, role);
    const cows = await Cow.findAll({ where: cowWhere, attributes: ['id', 'name'] });

    const insights = await Promise.all(
      cows.map(async (cow) => {
        const records = await HealthRecord.findAll({
          where: { cowId: cow.id },
          order: [['recordedAt', 'DESC']],
          limit: 7,
        });

        if (!records.length) return { cowId: cow.id, cowName: cow.name, score: 100, alerts: [] };

        const alerts: string[] = [];
        let score = 100;

        const temps = records.filter((r) => r.temperature != null).map((r) => r.temperature!);
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
      })
    );

    return insights.sort((a, b) => a.score - b.score);
  }

  static async getCowInsight(cowId: string, userId: string, role: string) {
    await assertCowAccess(cowId, userId, role);
    const herd = await this.getHerdInsights(userId, role);
    return herd.find((h) => h.cowId === cowId) || null;
  }
}
