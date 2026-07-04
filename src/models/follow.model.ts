import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

@Table({ tableName: 'follows', timestamps: true, updatedAt: false })
export class Follow extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare followerId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare followingId: string;

  @BelongsTo(() => User, 'followerId')
  declare follower: User;

  @BelongsTo(() => User, 'followingId')
  declare following: User;
}

export default Follow;
