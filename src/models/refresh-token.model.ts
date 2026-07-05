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

@Table({ tableName: 'refresh_tokens', timestamps: true })
export class RefreshToken extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING, allowNull: false })
  declare token: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @BelongsTo(() => User)
  declare user: User;
}

export default RefreshToken;
