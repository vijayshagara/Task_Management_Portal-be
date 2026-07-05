import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';
import Cow from './cow.model';

export enum MilkSession {
  MORNING = 'morning',
  EVENING = 'evening',
}

@Table({ tableName: 'milk_records', timestamps: true })
export class MilkRecord extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @ForeignKey(() => Cow)
  @Column({ type: DataType.UUID, allowNull: true })
  declare cowId: string | null;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare recordDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(MilkSession)),
    allowNull: false,
  })
  declare session: MilkSession;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare liters: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  declare fatPercent: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Cow)
  declare cow: Cow;
}

export default MilkRecord;
