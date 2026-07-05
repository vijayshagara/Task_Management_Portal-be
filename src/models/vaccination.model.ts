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

export enum VaccinationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Table({ tableName: 'vaccinations', timestamps: true })
export class Vaccination extends Model {
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

  @Column({ type: DataType.STRING, allowNull: false })
  declare vaccineName: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare scheduledDate: Date;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare administeredDate: Date | null;

  @Column({
    type: DataType.ENUM(...Object.values(VaccinationStatus)),
    defaultValue: VaccinationStatus.SCHEDULED,
  })
  declare status: VaccinationStatus;

  @Column({ type: DataType.STRING, allowNull: true })
  declare vetName: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare nextDueDate: Date | null;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Cow)
  declare cow: Cow;
}

export default Vaccination;
