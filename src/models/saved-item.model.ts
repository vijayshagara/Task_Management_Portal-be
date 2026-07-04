import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

export enum SavedItemType {
  POST = 'post',
  LISTING = 'listing',
}

@Table({ tableName: 'saved_items', timestamps: true, updatedAt: false })
export class SavedItem extends Model {
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
    type: DataType.ENUM(...Object.values(SavedItemType)),
    allowNull: false,
  })
  declare itemType: SavedItemType;

  @Column({ type: DataType.UUID, allowNull: false })
  declare itemId: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare collectionName: string | null;

  @BelongsTo(() => User)
  declare user: User;
}

export default SavedItem;
