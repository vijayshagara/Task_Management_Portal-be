import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'task_management',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  models: [path.join(__dirname, '../models/*.model.ts')], // Explicit path
  logging: false,
});

export default sequelize;