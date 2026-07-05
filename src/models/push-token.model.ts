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

@Table({ tableName: 'push_tokens', timestamps: true })
export class PushToken extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Index
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING, allowNull: false })
  declare token: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare platform: string | null;

  @BelongsTo(() => User)
  declare user: User;
}

export default PushToken;
