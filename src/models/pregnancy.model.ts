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

export enum PregnancyStatus {
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  CALVED = 'calved',
  ABORTED = 'aborted',
}

@Table({ tableName: 'pregnancies', timestamps: true })
export class Pregnancy extends Model {
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
  @Column({ type: DataType.UUID, allowNull: false })
  declare cowId: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare conceptionDate: Date;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare expectedCalvingDate: Date | null;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare actualCalvingDate: Date | null;

  @Column({
    type: DataType.ENUM(...Object.values(PregnancyStatus)),
    defaultValue: PregnancyStatus.CONFIRMED,
  })
  declare status: PregnancyStatus;

  @Column({ type: DataType.STRING, allowNull: true })
  declare sireName: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;

  @ForeignKey(() => Cow)
  @Column({ type: DataType.UUID, allowNull: true })
  declare calfId: string | null;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Cow, 'cowId')
  declare cow: Cow;

  @BelongsTo(() => Cow, 'calfId')
  declare calf: Cow;
}

export default Pregnancy;
