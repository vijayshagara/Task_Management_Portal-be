import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Task } from './task.model';
import { text } from 'stream/consumers';

export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
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
}

export default User;