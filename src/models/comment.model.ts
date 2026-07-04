import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import Post from './post.model';
import User from './user.model';

@Table({ tableName: 'comments', timestamps: true })
export class Comment extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Post)
  @Column({ type: DataType.UUID, allowNull: false })
  declare postId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare authorId: string;

  @ForeignKey(() => Comment)
  @Column({ type: DataType.UUID, allowNull: true })
  declare parentId: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  declare mentions: string[];

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => User)
  declare author: User;

  @BelongsTo(() => Comment, 'parentId')
  declare parent: Comment;

  @HasMany(() => Comment, 'parentId')
  declare replies: Comment[];
}

export default Comment;
