import HeatCycle, {
  HeatDetectionMethod,
  HeatCycleStatus,
} from '../models/heat-cycle.model';
import { Cow } from '../models/cow.model';
import HeatSchedule from '../models/heat-schedules.model';
import { HeatSchedulerService } from './heat-scheduler.service';
import { z } from 'zod';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { BulkMutationResult } from '../utils/bulk';

export class HeatCycleService {

  // --------------------
  // VALIDATION SCHEMAS
  // --------------------
  private static createSchema = z.object({
    cowId: z.string().uuid(),
    heatStartDate: z.coerce.date(),
    heatEndDate: z.coerce.date().optional(),
    detectionMethod: z.nativeEnum(HeatDetectionMethod),
    nextExpectedHeat: z.coerce.date().optional(),
    notes: z.string().optional(),
  });

  private static updateSchema = z.object({
    heatStartDate: z.coerce.date().optional(),
    heatEndDate: z.coerce.date().optional(),
    detectionMethod: z.nativeEnum(HeatDetectionMethod).optional(),
    nextExpectedHeat: z.coerce.date().optional(),
    notes: z.string().optional(),
  });

  // --------------------
  // GET ALL
  // --------------------
  public static async getAllHeatCycles(): Promise<HeatCycle[]> {
    return HeatCycle.findAll({
      order: [['heatStartDate', 'DESC']],
      include: [
        {
          model: Cow,
          attributes: ['id', 'name', 'breed'],
        },
      ],
    });
  }

  // --------------------
  // GET BY ID
  // --------------------
  public static async getHeatCycleById(
    id: string
  ): Promise<HeatCycle | null> {

    return HeatCycle.findByPk(id, {
      include: [
        {
          model: Cow,
          attributes: ['id', 'name', 'breed'],
        },
      ],
    });
  }

  // --------------------
  // GET BY COW
  // --------------------
  public static async getHeatCyclesByCowId(
    cowId: string
  ): Promise<HeatCycle[]> {

    return HeatCycle.findAll({
      where: { cowId },
      order: [['heatStartDate', 'DESC']],
    });
  }

  // --------------------
  // CREATE
  // --------------------
  public static async createHeatCycle(
    data: {
      cowId: string;
      heatStartDate: Date | string;
      heatEndDate?: Date | string;
      detectionMethod: HeatDetectionMethod;
      nextExpectedHeat?: Date | string;
      notes?: string;
    }
  ): Promise<HeatCycle> {
    
    
    const validatedData = this.createSchema.parse(data);
    
    return sequelize.transaction(async transaction => {
      
      const cow = await Cow.findByPk(validatedData.cowId, { transaction });

      if (!cow) {
        throw new Error('Cow not found');
      }

      // ❗ Prevent multiple active cycles
      const activeCycle = await HeatCycle.findOne({
        where: {
          cowId: validatedData.cowId,
          status: HeatCycleStatus.PENDING,
        },
        transaction,
      });

      if (activeCycle) {
        throw new Error('Active heat cycle already exists for this cow');
      }

      const cycle = await HeatCycle.create(
        {
          ...validatedData,
          status: HeatCycleStatus.PENDING,
        },
        { transaction }
      );

      // Schedule alerts AFTER create (still inside transaction context)
      await HeatSchedulerService.scheduleHeatReminder(
        cycle.id,
        cycle.cowId,
        cycle.heatStartDate,
        transaction
      );

      return cycle;
    });
  }

  // --------------------
  // UPDATE
  // --------------------
  public static async updateHeatCycle(
    id: string,
    data: Partial<{
      heatStartDate: Date | string;
      heatEndDate: Date | string;
      detectionMethod: HeatDetectionMethod;
      nextExpectedHeat: Date | string;
      notes: string;
    }>
  ): Promise<HeatCycle | null> {

    const validatedData = this.updateSchema.parse(data);

    const cycle = await HeatCycle.findByPk(id);
    if (!cycle) return null;

    return cycle.update(validatedData);
  }

  // --------------------
  // DELETE
  // --------------------
  public static async deleteHeatCycle(id: string): Promise<boolean> {
    const cycle = await HeatCycle.findByPk(id);
    if (!cycle) return false;

    const deletedCount = await sequelize.transaction(async (transaction) => {
      await HeatSchedule.destroy({
        where: { heatCycleId: id },
        transaction,
      });

      return HeatCycle.destroy({
        where: { id },
        transaction,
      });
    });

    return deletedCount > 0;
  }

  public static async bulkDeleteHeatCycles(ids: string[]): Promise<BulkMutationResult> {
    const uniqueIds = [...new Set(ids)];
    const count = await sequelize.transaction(async (transaction) => {
      await HeatSchedule.destroy({
        where: { heatCycleId: { [Op.in]: uniqueIds } },
        transaction,
      });
      return HeatCycle.destroy({
        where: { id: { [Op.in]: uniqueIds } },
        transaction,
      });
    });
    return { ids: uniqueIds, count };
  }

  // --------------------
  // CONFIRM HEAT
  // --------------------
  public static async confirmHeat(
    heatCycleId: string
  ): Promise<boolean> {

    return sequelize.transaction(async transaction => {

      const heatCycle = await HeatCycle.findByPk(heatCycleId, { transaction });
      if (!heatCycle) return false;

      await heatCycle.update(
        {
          status: HeatCycleStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
        { transaction }
      );

      await HeatSchedule.update(
        { status: 'CANCELLED' },
        {
          where: {
            heatCycleId,
            status: 'SCHEDULED',
          },
          transaction,
        }
      );

      return true;
    });
  }

  public static async bulkConfirmHeat(
    ids: string[]
  ): Promise<{ ids: string[]; count: number; items: HeatCycle[] }> {
    const uniqueIds = [...new Set(ids)];

    return sequelize.transaction(async (transaction) => {
      const pending = await HeatCycle.findAll({
        where: {
          id: { [Op.in]: uniqueIds },
          status: HeatCycleStatus.PENDING,
        },
        attributes: ['id'],
        transaction,
      });
      const confirmIds = pending.map((c) => c.id);
      if (!confirmIds.length) return { ids: [], count: 0, items: [] };

      const now = new Date();
      await HeatCycle.update(
        {
          status: HeatCycleStatus.CONFIRMED,
          confirmedAt: now,
        },
        {
          where: { id: { [Op.in]: confirmIds } },
          transaction,
        }
      );

      await HeatSchedule.update(
        { status: 'CANCELLED' },
        {
          where: {
            heatCycleId: { [Op.in]: confirmIds },
            status: 'SCHEDULED',
          },
          transaction,
        }
      );

      const items = await HeatCycle.findAll({
        where: { id: { [Op.in]: confirmIds } },
        include: [{ model: Cow, attributes: ['id', 'name', 'breed'] }],
        transaction,
      });

      return { ids: confirmIds, count: confirmIds.length, items };
    });
  }
}
