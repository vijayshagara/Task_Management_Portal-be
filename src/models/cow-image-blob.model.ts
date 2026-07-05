import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Cow from './cow.model';

@Table({ tableName: 'cow_image_blobs', timestamps: true })
export class CowImageBlob extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Cow)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare cowId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare contentType: string;

  @Column({ type: DataType.BLOB, allowNull: false })
  declare data: Buffer;

  @BelongsTo(() => Cow)
  declare cow: Cow;
}

export default CowImageBlob;
