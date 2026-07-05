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

@Table({ tableName: 'password_resets', timestamps: true })
export class PasswordReset extends Model {
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

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare used: boolean;

  @BelongsTo(() => User)
  declare user: User;
}

export default PasswordReset;
