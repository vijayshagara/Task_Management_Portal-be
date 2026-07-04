import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

export enum FollowRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Table({ tableName: 'follow_requests', timestamps: true })
export class FollowRequest extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare requesterId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare targetId: string;

  @Column({
    type: DataType.ENUM(...Object.values(FollowRequestStatus)),
    defaultValue: FollowRequestStatus.PENDING,
  })
  declare status: FollowRequestStatus;

  @BelongsTo(() => User, 'requesterId')
  declare requester: User;

  @BelongsTo(() => User, 'targetId')
  declare target: User;
}

export default FollowRequest;
