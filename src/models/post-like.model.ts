import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Post from './post.model';
import User from './user.model';

@Table({ tableName: 'post_likes', timestamps: true, updatedAt: false })
export class PostLike extends Model {
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
  declare userId: string;

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => User)
  declare user: User;
}

export default PostLike;
