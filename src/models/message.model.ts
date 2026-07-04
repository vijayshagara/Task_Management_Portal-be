import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Conversation from './conversation.model';
import User from './user.model';
import Post from './post.model';

@Table({ tableName: 'messages', timestamps: true })
export class Message extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Conversation)
  @Column({ type: DataType.UUID, allowNull: false })
  declare conversationId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare senderId: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare content: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare imageFileId: string | null;

  @ForeignKey(() => Post)
  @Column({ type: DataType.UUID, allowNull: true })
  declare sharedPostId: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare readAt: Date | null;

  @BelongsTo(() => Conversation)
  declare conversation: Conversation;

  @BelongsTo(() => User)
  declare sender: User;

  @BelongsTo(() => Post)
  declare sharedPost: Post;
}

export default Message;
