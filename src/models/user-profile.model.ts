import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

@Table({ tableName: 'user_profiles', timestamps: true })
export class UserProfile extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  declare userId: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  declare username: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare bio: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare farmName: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare location: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare contactPhone: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare contactEmail: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare profilePicture: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare coverPhoto: string | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isPrivate: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isVerified: boolean;

  @BelongsTo(() => User)
  declare user: User;
}

export default UserProfile;
