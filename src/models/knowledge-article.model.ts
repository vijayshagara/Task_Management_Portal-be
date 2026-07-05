import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

export enum ArticleCategory {
  HEALTH = 'health',
  BREEDING = 'breeding',
  FEEDING = 'feeding',
  GENERAL = 'general',
  DISEASE = 'disease',
}

@Table({ tableName: 'knowledge_articles', timestamps: true })
export class KnowledgeArticle extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare authorId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({
    type: DataType.ENUM(...Object.values(ArticleCategory)),
    defaultValue: ArticleCategory.GENERAL,
  })
  declare category: ArticleCategory;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  declare tags: string[];

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare upvotes: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isVerified: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isPublished: boolean;

  @BelongsTo(() => User)
  declare author: User;
}

export default KnowledgeArticle;
