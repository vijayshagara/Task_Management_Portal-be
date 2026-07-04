import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  REPLY = 'reply',
  FOLLOW = 'follow',
  FOLLOW_REQUEST = 'follow_request',
  STORY_REPLY = 'story_reply',
  MARKETPLACE_INQUIRY = 'marketplace_inquiry',
  MENTION = 'mention',
  MESSAGE = 'message',
}

@Table({ tableName: 'notifications', timestamps: true, updatedAt: false })
export class Notification extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    allowNull: false,
  })
  declare type: NotificationType;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare actorId: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare entityType: string | null;

  @Column({ type: DataType.UUID, allowNull: true })
  declare entityId: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare message: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isRead: boolean;

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @BelongsTo(() => User, 'actorId')
  declare actor: User;
}

export default Notification;
