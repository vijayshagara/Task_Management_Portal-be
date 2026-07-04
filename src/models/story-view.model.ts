import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Story from './story.model';
import User from './user.model';

@Table({ tableName: 'story_views', timestamps: true, updatedAt: false })
export class StoryView extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Story)
  @Column({ type: DataType.UUID, allowNull: false })
  declare storyId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare viewerId: string;

  @BelongsTo(() => Story)
  declare story: Story;

  @BelongsTo(() => User)
  declare viewer: User;
}

export default StoryView;
