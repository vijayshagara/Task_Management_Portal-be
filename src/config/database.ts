import { Sequelize } from 'sequelize-typescript';
import config from '../utils/env';
import HeatSchedule from '../models/heat-schedules.model';
import Cow from '../models/cow.model';
import HealthRecord from '../models/health-record.model';
import HeatCycle from '../models/heat-cycle.model';
import Task from '../models/task.model';
import User from '../models/user.model';
import CowHealthStatus from '../models/cow-health-status.model';

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = config;
console.log('🔍 Database configuration:');
console.log({ DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD });
console.log('🔧 Initializing database connection with the following config:');
const sequelize = new Sequelize({
  database: config.DB_NAME,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: 'postgres',
  models: [
    HeatSchedule,
    Cow,
    HealthRecord,
    HeatCycle,
    Task,
    User,
    CowHealthStatus
  ],
  dialectOptions: config.DB_SSL ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {},
  pool: {
    max: 5,
    min: 1,
    acquire: 30000,
    idle: 10000,
  },
  // logging: config.NODE_ENV === 'development' ? console.log : false,
  logging: false,
  retry: {
    max: 3,
  },
});

export default sequelize;