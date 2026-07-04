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
import StoryView from './story-view.model';
import StoryReaction from './story-reaction.model';

export enum StoryMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Table({ tableName: 'stories', timestamps: true })
export class Story extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare fileId: string;

  @Column({
    type: DataType.ENUM(...Object.values(StoryMediaType)),
    defaultValue: StoryMediaType.IMAGE,
  })
  declare mediaType: StoryMediaType;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => StoryView)
  declare views: StoryView[];

  @HasMany(() => StoryReaction)
  declare reactions: StoryReaction[];
}

export default Story;
