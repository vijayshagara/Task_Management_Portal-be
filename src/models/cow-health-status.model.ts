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

@Table({
  tableName: 'cow_health_status',
  timestamps: true,
})
export default class CowHealthStatus extends Model {

  // --------------------
  // PRIMARY KEY (1 row per cow)
  // --------------------
  @ForeignKey(() => Cow)
  @Index({
    name: 'idx_cow_health_status_cow',
    unique: true,
  })
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  declare cowId: string;

  // --------------------
  // LATEST HEALTH DATA
  // --------------------
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  declare latestTemperature: number | null;

  @Column({
    type: DataType.ENUM('NORMAL', 'MILD_FEVER', 'HIGH_FEVER'),
    allowNull: false,
    defaultValue: 'NORMAL',
  })
  declare feverStatus: 'NORMAL' | 'MILD_FEVER' | 'HIGH_FEVER';

  // --------------------
  // LAST CHECKED TIME
  // --------------------
  @Index({
    name: 'idx_cow_health_status_time',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare lastCheckedAt: Date;

  // --------------------
  // RELATION
  // --------------------
  @BelongsTo(() => Cow)
  declare cow: Cow;
}
