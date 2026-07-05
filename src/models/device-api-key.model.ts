import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import User from './user.model';
import Cow from './cow.model';

@Table({ tableName: 'device_api_keys', timestamps: true })
export class DeviceApiKey extends Model {
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

  @Index({ unique: true })
  @Column({ type: DataType.STRING, allowNull: false })
  declare apiKey: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare deviceName: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  declare lastUsedAt: Date | null;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Cow)
  declare cow: Cow;
}

export default DeviceApiKey;
