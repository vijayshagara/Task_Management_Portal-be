import { Sequelize } from 'sequelize-typescript';
import pg from 'pg'; // or require('pg') if not using ES modules
import config from '../utils/env';
import HeatSchedule from '../models/heat-schedules.model';
import Cow from '../models/cow.model';
import HealthRecord from '../models/health-record.model';
import HeatCycle from '../models/heat-cycle.model';
import Task from '../models/task.model';
import User from '../models/user.model';
import CowHealthStatus from '../models/cow-health-status.model';

// Forces pg to be present; also attaches it to the Sequelize instance
const sequelize = new Sequelize({
  database: config.DB_NAME,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: 'postgres',
  dialectModule: pg, // 👈 this tells Sequelize to use this pg instance
  models: [
    HeatSchedule,
    Cow,
    HealthRecord,
    HeatCycle,
    Task,
    User,
    CowHealthStatus,
  ],
  dialectOptions: config.DB_SSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  pool: {
    max: 5,
    min: 1,
    acquire: 30000,
    idle: 10000,
  },
  logging: config.NODE_ENV === 'development' ? console.log : false,
  retry: {
    max: 3,
  },
});

export default sequelize;