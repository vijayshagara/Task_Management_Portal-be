import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import HeatCycle from './heat-cycle.model';
import { Cow } from './cow.model';

export enum HeatScheduleStatus {
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}


@Table({
  tableName: 'heat_schedules',
  timestamps: true,
})
export default class HeatSchedule extends Model {

  // --------------------
  // PRIMARY KEY
  // --------------------
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  // --------------------
  // RELATIONS
  // --------------------
  @ForeignKey(() => HeatCycle)
  @Index({
    name: 'idx_heat_schedule_cycle',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare heatCycleId: string;

  @ForeignKey(() => Cow)
  @Index({
    name: 'idx_heat_schedule_cow',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare cowId: string;

  // --------------------
  // ALERT CONFIG
  // --------------------
  @Index({
    name: 'idx_heat_schedule_day',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare alertDay: number; // 18, 20, 21, 22, 23

  @Index({
    name: 'idx_heat_schedule_time',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare scheduledAt: Date;

  @Index({
    name: 'idx_heat_schedule_status',
  })
  @Column({
    type: DataType.ENUM(...Object.values(HeatScheduleStatus)),
    allowNull: false,
    defaultValue: HeatScheduleStatus.SCHEDULED,
  })
  declare status: HeatScheduleStatus;

  // --------------------
  // RELATIONS
  // --------------------
  @BelongsTo(() => HeatCycle)
  declare heatCycle: HeatCycle;

  @BelongsTo(() => Cow)
  declare cow: Cow;
}
