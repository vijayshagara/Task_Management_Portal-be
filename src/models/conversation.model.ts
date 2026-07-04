import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import User from './user.model';
import Message from './message.model';

@Table({ tableName: 'conversations', timestamps: true })
export class Conversation extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare participant1Id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare participant2Id: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare lastMessageAt: Date | null;

  @BelongsTo(() => User, 'participant1Id')
  declare participant1: User;

  @BelongsTo(() => User, 'participant2Id')
  declare participant2: User;

  @HasMany(() => Message)
  declare messages: Message[];
}

export default Conversation;
