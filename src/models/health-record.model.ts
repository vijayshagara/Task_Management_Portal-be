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
  tableName: 'health_records',
  timestamps: true,
})
export default class HealthRecord extends Model {

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
    name: 'idx_health_record_cow',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare cowId: string;

  // --------------------
  // HEALTH METRICS
  // --------------------
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  declare temperature: number | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare activityLevel: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare eatingStatus: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare rumination: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare issue: string | null;

  // --------------------
  // RECORD TIME
  // --------------------
  @Index({
    name: 'idx_health_record_cow_time',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare recordedAt: Date;

  // --------------------
  // RELATION
  // --------------------
  @BelongsTo(() => Cow)
  declare cow: Cow;
}
