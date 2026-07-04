import { Table, Column, Model, DataType, HasMany, HasOne } from 'sequelize-typescript';
import { Task } from './task.model';
import UserProfile from './user-profile.model';

export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  FARMER = 'farmer',
}

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  declare role: UserRole;
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare googleRefreshToken: string | null;


  @HasMany(() => Task)
  declare tasks: Task[];

  @HasOne(() => UserProfile)
  declare profile: UserProfile;
}

export default User;