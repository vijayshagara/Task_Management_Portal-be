"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const pg_1 = __importDefault(require("pg"));
const env_1 = __importDefault(require("../utils/env"));
const heat_schedules_model_1 = __importDefault(require("../models/heat-schedules.model"));
const cow_model_1 = __importDefault(require("../models/cow.model"));
const health_record_model_1 = __importDefault(require("../models/health-record.model"));
const heat_cycle_model_1 = __importDefault(require("../models/heat-cycle.model"));
const task_model_1 = __importDefault(require("../models/task.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const cow_health_status_model_1 = __importDefault(require("../models/cow-health-status.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const post_model_1 = __importDefault(require("../models/post.model"));
const post_media_model_1 = __importDefault(require("../models/post-media.model"));
const post_like_model_1 = __importDefault(require("../models/post-like.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const follow_model_1 = __importDefault(require("../models/follow.model"));
const follow_request_model_1 = __importDefault(require("../models/follow-request.model"));
const story_model_1 = __importDefault(require("../models/story.model"));
const story_view_model_1 = __importDefault(require("../models/story-view.model"));
const story_reaction_model_1 = __importDefault(require("../models/story-reaction.model"));
const marketplace_listing_model_1 = __importDefault(require("../models/marketplace-listing.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const saved_item_model_1 = __importDefault(require("../models/saved-item.model"));
const block_model_1 = __importDefault(require("../models/block.model"));
const user_settings_model_1 = __importDefault(require("../models/user-settings.model"));
const sequelize = new sequelize_typescript_1.Sequelize({
    database: env_1.default.DB_NAME,
    username: env_1.default.DB_USER,
    password: env_1.default.DB_PASSWORD,
    host: env_1.default.DB_HOST,
    port: env_1.default.DB_PORT,
    dialect: 'postgres',
    dialectModule: pg_1.default,
    models: [
        heat_schedules_model_1.default,
        cow_model_1.default,
        health_record_model_1.default,
        heat_cycle_model_1.default,
        task_model_1.default,
        user_model_1.default,
        cow_health_status_model_1.default,
        user_profile_model_1.default,
        post_model_1.default,
        post_media_model_1.default,
        post_like_model_1.default,
        comment_model_1.default,
        follow_model_1.default,
        follow_request_model_1.default,
        story_model_1.default,
        story_view_model_1.default,
        story_reaction_model_1.default,
        marketplace_listing_model_1.default,
        conversation_model_1.default,
        message_model_1.default,
        notification_model_1.default,
        saved_item_model_1.default,
        block_model_1.default,
        user_settings_model_1.default,
    ],
    dialectOptions: env_1.default.DB_SSL
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
    logging: env_1.default.NODE_ENV === 'development' ? console.log : false,
    retry: {
        max: 3,
    },
});
exports.default = sequelize;
