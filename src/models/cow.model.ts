import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Index,
} from 'sequelize-typescript';
import HeatCycle from './heat-cycle.model';
import HealthRecord from './health-record.model';

export enum CowGender {
  FEMALE = 'female',
  MALE = 'male',
}

@Table({
  tableName: 'cows',
  timestamps: true,
})
export class Cow extends Model {

  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Index({
    name: 'idx_cow_name_birthdate',
    unique: true,
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Index({
    name: 'idx_cow_name_birthdate',
    unique: true,
  })
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare birthDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare breed: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare fatherName: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare motherName: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(CowGender)),
    allowNull: false,
  })
  declare gender: CowGender;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image: string | null;

  // --------------------
  // Relations
  // --------------------
  @HasMany(() => HeatCycle)
  declare heatCycles: HeatCycle[];

  @HasMany(() => HealthRecord)
  declare healthRecords: HealthRecord[];
}

export default Cow;
