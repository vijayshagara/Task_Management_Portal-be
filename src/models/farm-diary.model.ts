import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';
import Cow from './cow.model';

@Table({ tableName: 'farm_diaries', timestamps: true })
export class FarmDiary extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @ForeignKey(() => Cow)
  @Column({ type: DataType.UUID, allowNull: true })
  declare cowId: string | null;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare entryDate: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  declare weather: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare feedNotes: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  declare photos: string[];

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare shareToFeed: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  declare voiceNoteUrl: string | null;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Cow)
  declare cow: Cow;
}

export default FarmDiary;
