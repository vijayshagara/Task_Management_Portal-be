import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';

@Table({ tableName: 'blocks', timestamps: true, updatedAt: false })
export class Block extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare blockerId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare blockedId: string;

  @BelongsTo(() => User, 'blockerId')
  declare blocker: User;

  @BelongsTo(() => User, 'blockedId')
  declare blocked: User;
}

export default Block;
