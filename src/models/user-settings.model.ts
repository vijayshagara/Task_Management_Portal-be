import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

@Table({ tableName: 'user_settings', timestamps: true })
export class UserSettings extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  declare userId: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare showEmail: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare showPhone: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare notifyLikes: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare notifyComments: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare notifyFollows: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare notifyMessages: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare notifyMarketplace: boolean;

  @BelongsTo(() => User)
  declare user: User;
}

export default UserSettings;
