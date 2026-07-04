import { Sequelize } from 'sequelize-typescript';
import pg from 'pg';
import config from '../utils/env';
import HeatSchedule from '../models/heat-schedules.model';
import Cow from '../models/cow.model';
import HealthRecord from '../models/health-record.model';
import HeatCycle from '../models/heat-cycle.model';
import Task from '../models/task.model';
import User from '../models/user.model';
import CowHealthStatus from '../models/cow-health-status.model';
import UserProfile from '../models/user-profile.model';
import Post from '../models/post.model';
import PostMedia from '../models/post-media.model';
import PostLike from '../models/post-like.model';
import Comment from '../models/comment.model';
import Follow from '../models/follow.model';
import FollowRequest from '../models/follow-request.model';
import Story from '../models/story.model';
import StoryView from '../models/story-view.model';
import StoryReaction from '../models/story-reaction.model';
import MarketplaceListing from '../models/marketplace-listing.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import Notification from '../models/notification.model';
import SavedItem from '../models/saved-item.model';
import Block from '../models/block.model';
import UserSettings from '../models/user-settings.model';

const sequelize = new Sequelize({
  database: config.DB_NAME,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: 'postgres',
  dialectModule: pg,
  models: [
    HeatSchedule,
    Cow,
    HealthRecord,
    HeatCycle,
    Task,
    User,
    CowHealthStatus,
    UserProfile,
    Post,
    PostMedia,
    PostLike,
    Comment,
    Follow,
    FollowRequest,
    Story,
    StoryView,
    StoryReaction,
    MarketplaceListing,
    Conversation,
    Message,
    Notification,
    SavedItem,
    Block,
    UserSettings,
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
