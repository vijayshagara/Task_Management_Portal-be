import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import HeatSchedule from '../models/heat-schedules.model';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'neondb',
  username: process.env.DB_USER || 'neondb_owner',
  password: process.env.DB_PASSWORD || 'npg_pO5nHKE6YCzy',
  host: process.env.DB_HOST || 'ep-polished-river-a1vq0bs5-pooler.ap-southeast-1.aws.neon.tech',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  models: [
    HeatSchedule,
  ],
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 1,
    acquire: 30000,
    idle: 10000,
  },
  // models: [path.join(__dirname, '../models/*.model.ts')], // Explicit path
  logging: false,
});

export default sequelize;