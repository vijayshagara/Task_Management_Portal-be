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
import Cow from './cow.model';
import PostMedia from './post-media.model';
import PostLike from './post-like.model';
import Comment from './comment.model';

@Table({ tableName: 'posts', timestamps: true })
export class Post extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare authorId: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare content: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare location: string | null;

  @ForeignKey(() => Cow)
  @Column({ type: DataType.UUID, allowNull: true })
  declare cowId: string | null;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  declare hashtags: string[];

  @BelongsTo(() => User)
  declare author: User;

  @BelongsTo(() => Cow)
  declare cow: Cow;

  @HasMany(() => PostMedia)
  declare media: PostMedia[];

  @HasMany(() => PostLike)
  declare likes: PostLike[];

  @HasMany(() => Comment)
  declare comments: Comment[];
}

export default Post;
