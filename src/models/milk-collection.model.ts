import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

export enum CollectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PAID = 'paid',
}

@Table({ tableName: 'milk_collections', timestamps: true })
export class MilkCollection extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare collectionDate: Date;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare totalLiters: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  declare fatPercent: number | null;

  @Column({ type: DataType.FLOAT, allowNull: true })
  declare snfPercent: number | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare ratePerLiter: number | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare totalAmount: number | null;

  @Column({
    type: DataType.ENUM(...Object.values(CollectionStatus)),
    defaultValue: CollectionStatus.PENDING,
  })
  declare status: CollectionStatus;

  @Column({ type: DataType.STRING, allowNull: true })
  declare cooperativeName: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare rejectionReason: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;

  @BelongsTo(() => User)
  declare user: User;
}

export default MilkCollection;
