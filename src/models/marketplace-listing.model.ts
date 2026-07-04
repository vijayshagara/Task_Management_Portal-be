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

export enum ListingType {
  COW = 'cow',
  CALF = 'calf',
  BULL = 'bull',
  FODDER = 'fodder',
  EQUIPMENT = 'equipment',
  DAIRY_PRODUCT = 'dairy_product',
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  DRAFT = 'draft',
}

@Table({ tableName: 'marketplace_listings', timestamps: true })
export class MarketplaceListing extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare sellerId: string;

  @Column({
    type: DataType.ENUM(...Object.values(ListingType)),
    allowNull: false,
  })
  declare listingType: ListingType;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  declare photos: string[];

  @Column({ type: DataType.STRING, allowNull: true })
  declare breed: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare age: string | null;

  @Column({ type: DataType.FLOAT, allowNull: true })
  declare weight: number | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare milkProduction: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare pregnancyStatus: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare healthInfo: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare vaccinationStatus: string | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  declare price: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare negotiable: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  declare location: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(ListingStatus)),
    defaultValue: ListingStatus.ACTIVE,
  })
  declare status: ListingStatus;

  @ForeignKey(() => Cow)
  @Column({ type: DataType.UUID, allowNull: true })
  declare cowId: string | null;

  @BelongsTo(() => User)
  declare seller: User;

  @BelongsTo(() => Cow)
  declare cow: Cow;
}

export default MarketplaceListing;
