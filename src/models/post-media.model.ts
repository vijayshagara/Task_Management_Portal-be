import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Post from './post.model';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Table({ tableName: 'post_media', timestamps: true })
export class PostMedia extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Post)
  @Column({ type: DataType.UUID, allowNull: false })
  declare postId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare fileId: string;

  @Column({
    type: DataType.ENUM(...Object.values(MediaType)),
    defaultValue: MediaType.IMAGE,
  })
  declare mediaType: MediaType;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare sortOrder: number;

  @BelongsTo(() => Post)
  declare post: Post;
}

export default PostMedia;
