import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { Cow } from './cow.model';

export enum HeatDetectionMethod {
  SENSOR = 'sensor',
  MANUAL = 'manual',
}

export enum HeatCycleStatus {
  PENDING = 'pending',     // heat expected, alerts running
  CONFIRMED = 'confirmed', // heat observed
  MISSED = 'missed',       // heat not observed
}

@Table({
  tableName: 'heat_cycles',
  timestamps: true,
})
export default class HeatCycle extends Model {

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
  // FOREIGN KEY
  // --------------------
  @ForeignKey(() => Cow)
  @Index({
    name: 'idx_heat_cycle_cow',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare cowId: string;

  // --------------------
  // HEAT DATES
  // --------------------
  @Index({
    name: 'idx_heat_cycle_cow_start',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare heatStartDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare heatEndDate: Date | null;

  // --------------------
  // DETECTION
  // --------------------
  @Column({
    type: DataType.ENUM(...Object.values(HeatDetectionMethod)),
    allowNull: false,
  })
  declare detectionMethod: HeatDetectionMethod;

  // --------------------
  // STATUS (CRITICAL)
  // --------------------
  @Index({
    name: 'idx_heat_cycle_cow_status',
  })
  @Column({
    type: DataType.ENUM(...Object.values(HeatCycleStatus)),
    allowNull: false,
    defaultValue: HeatCycleStatus.PENDING,
  })
  declare status: HeatCycleStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare confirmedAt: Date | null;

  // --------------------
  // NEXT HEAT
  // --------------------
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare nextExpectedHeat: Date | null;

  // --------------------
  // NOTES
  // --------------------
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string | null;

  // --------------------
  // RELATION
  // --------------------
  @BelongsTo(() => Cow)
  declare cow: Cow;
}
