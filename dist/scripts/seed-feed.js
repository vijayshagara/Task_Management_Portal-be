"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Temporary seed script for social feed testing.
 * Run:  npm run seed:feed
 * Clear: npm run seed:feed:clear
 */
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const user_model_1 = __importStar(require("../models/user.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const user_settings_model_1 = __importDefault(require("../models/user-settings.model"));
const post_model_1 = __importDefault(require("../models/post.model"));
const post_like_model_1 = __importDefault(require("../models/post-like.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const follow_model_1 = __importDefault(require("../models/follow.model"));
const SEED_TAG = 'seed-feed-dummy';
const SEED_EMAIL_DOMAIN = '@seed-feed.test';
const DUMMY_FARMERS = [
    {
        name: 'Ramesh Patel',
        username: 'ramesh_dairy',
        farmName: 'Patel Organic Dairy',
        location: 'Anand, Gujarat',
        bio: 'Third-generation dairy farmer. Jersey & Holstein herd.',
    },
    {
        name: 'Sunita Sharma',
        username: 'sunita_farm',
        farmName: 'Sharma Gaushala',
        location: 'Karnal, Haryana',
        bio: 'Focused on healthy calves and clean milk production.',
    },
    {
        name: 'Vijay Kumar',
        username: 'vijay_cattle',
        farmName: 'Green Valley Farm',
        location: 'Namakkal, Tamil Nadu',
        bio: 'Sharing daily farm life and cattle care tips.',
    },
    {
        name: 'Lakshmi Reddy',
        username: 'lakshmi_dairy',
        farmName: 'Reddy Family Farm',
        location: 'Ongole, Andhra Pradesh',
        bio: 'Ongole breed specialist. Open to trade and advice.',
    },
];
const DUMMY_POSTS = [
    {
        authorIndex: 0,
        content: 'Morning milking done! 🥛 Our Jerseys are giving excellent yield this season. #dairy #morning #jersey',
        location: 'Anand, Gujarat',
        hashtags: ['dairy', 'morning', 'jersey'],
    },
    {
        authorIndex: 1,
        content: 'New calf born last night — healthy and active. Mother cow doing well. #calf #newborn #farm',
        location: 'Karnal, Haryana',
        hashtags: ['calf', 'newborn', 'farm'],
    },
    {
        authorIndex: 2,
        content: 'Green fodder harvest day. Good nutrition means good milk! 🌿 #fodder #cattle #nutrition',
        location: 'Namakkal, Tamil Nadu',
        hashtags: ['fodder', 'cattle', 'nutrition'],
    },
    {
        authorIndex: 3,
        content: 'Vaccination camp completed for the whole herd today. Prevention is better than cure. #health #vaccination',
        location: 'Ongole, Andhra Pradesh',
        hashtags: ['health', 'vaccination'],
    },
    {
        authorIndex: 0,
        content: 'Heat cycle detected for Bella — scheduled for AI tomorrow. Tracking makes all the difference. #heatcycle #breeding',
        location: 'Anand, Gujarat',
        hashtags: ['heatcycle', 'breeding'],
    },
    {
        authorIndex: 1,
        content: 'Farm visit from the co-op today. Quality checks passed with flying colours! #quality #dairyfarm',
        location: 'Karnal, Haryana',
        hashtags: ['quality', 'dairyfarm'],
    },
    {
        authorIndex: 2,
        content: 'Rainy season tip: keep bedding dry to prevent hoof problems. #tips #cattlecare #monsoon',
        location: 'Namakkal, Tamil Nadu',
        hashtags: ['tips', 'cattlecare', 'monsoon'],
    },
    {
        authorIndex: 3,
        content: 'Listing two young Ongole bulls for sale — DM for details. Strong build, vaccinated. #marketplace #ongole',
        location: 'Ongole, Andhra Pradesh',
        hashtags: ['marketplace', 'ongole'],
    },
];
async function linkExistingUsersToSeed(seedUsers) {
    const realUsers = await user_model_1.default.findAll({
        where: { email: { [sequelize_1.Op.notLike]: `%${SEED_EMAIL_DOMAIN}` } },
    });
    for (const realUser of realUsers) {
        for (const seedUser of seedUsers) {
            if (realUser.id === seedUser.id)
                continue;
            await follow_model_1.default.findOrCreate({
                where: { followerId: realUser.id, followingId: seedUser.id },
                defaults: { followerId: realUser.id, followingId: seedUser.id },
            });
        }
    }
    if (realUsers.length) {
        console.log(`Linked ${realUsers.length} existing user(s) to follow seed farmers`);
    }
}
async function seedFeed() {
    await database_1.default.authenticate();
    console.log('Connected to database');
    const password = await bcryptjs_1.default.hash('password123', 10);
    const createdUsers = [];
    for (const farmer of DUMMY_FARMERS) {
        const email = `${farmer.username}${SEED_EMAIL_DOMAIN}`;
        let user = await user_model_1.default.findOne({ where: { email } });
        if (!user) {
            user = await user_model_1.default.create({
                name: farmer.name,
                email,
                password,
                role: user_model_1.UserRole.FARMER,
            });
            console.log(`Created user: ${farmer.name}`);
        }
        else {
            console.log(`User exists: ${farmer.name}`);
        }
        await user_profile_model_1.default.findOrCreate({
            where: { userId: user.id },
            defaults: {
                userId: user.id,
                username: farmer.username,
                bio: farmer.bio,
                farmName: farmer.farmName,
                location: farmer.location,
            },
        });
        await user_settings_model_1.default.findOrCreate({
            where: { userId: user.id },
            defaults: { userId: user.id },
        });
        createdUsers.push(user);
    }
    // Full follow mesh between seed users
    for (const follower of createdUsers) {
        for (const following of createdUsers) {
            if (follower.id === following.id)
                continue;
            await follow_model_1.default.findOrCreate({
                where: { followerId: follower.id, followingId: following.id },
                defaults: { followerId: follower.id, followingId: following.id },
            });
        }
    }
    await linkExistingUsersToSeed(createdUsers);
    const seedPostCount = await post_model_1.default.count({
        where: { content: { [sequelize_1.Op.like]: `%${SEED_TAG}%` } },
    });
    if (seedPostCount > 0) {
        console.log(`Seed posts already exist (${seedPostCount}). Ensuring follows for existing users...`);
        await linkExistingUsersToSeed(createdUsers);
        console.log('\nDummy login (any seeded user):');
        console.log(`  Email: ramesh_dairy${SEED_EMAIL_DOMAIN}`);
        console.log('  Password: password123');
        await database_1.default.close();
        return;
    }
    const createdPosts = [];
    for (const postData of DUMMY_POSTS) {
        const author = createdUsers[postData.authorIndex];
        const post = await post_model_1.default.create({
            authorId: author.id,
            content: `${postData.content}\n\n— ${SEED_TAG}`,
            location: postData.location,
            hashtags: postData.hashtags,
        });
        createdPosts.push(post);
        console.log(`Created post by ${author.name}`);
    }
    // Likes
    for (const post of createdPosts) {
        const likers = createdUsers.filter((u) => u.id !== post.authorId).slice(0, 2);
        for (const liker of likers) {
            await post_like_model_1.default.findOrCreate({
                where: { postId: post.id, userId: liker.id },
                defaults: { postId: post.id, userId: liker.id },
            });
        }
    }
    // Comments
    const sampleComments = [
        'Great update! 👏',
        'Very helpful, thanks for sharing.',
        'Beautiful herd!',
        'Interested — please share more details.',
    ];
    for (let i = 0; i < createdPosts.length; i++) {
        const post = createdPosts[i];
        const commenter = createdUsers[(i + 2) % createdUsers.length];
        if (commenter.id !== post.authorId) {
            await comment_model_1.default.create({
                postId: post.id,
                authorId: commenter.id,
                content: sampleComments[i % sampleComments.length],
                mentions: [],
            });
        }
    }
    console.log('\n✅ Dummy feed data inserted successfully!');
    console.log('\nTest login credentials:');
    console.log(`  Email: ramesh_dairy${SEED_EMAIL_DOMAIN}`);
    console.log('  Password: password123');
    console.log('\nOther seeded users: sunita_farm, vijay_cattle, lakshmi_dairy @ seed-feed.test');
    console.log('\nTo remove later: npm run seed:feed:clear');
    await database_1.default.close();
}
async function clearSeedFeed() {
    await database_1.default.authenticate();
    const seedUsers = await user_model_1.default.findAll({
        where: { email: { [sequelize_1.Op.like]: `%${SEED_EMAIL_DOMAIN}` } },
    });
    const seedUserIds = seedUsers.map((u) => u.id);
    if (!seedUserIds.length) {
        console.log('No seed users found.');
        await database_1.default.close();
        return;
    }
    const seedPosts = await post_model_1.default.findAll({
        where: { content: { [sequelize_1.Op.like]: `%${SEED_TAG}%` } },
    });
    const seedPostIds = seedPosts.map((p) => p.id);
    if (seedPostIds.length) {
        await comment_model_1.default.destroy({ where: { postId: { [sequelize_1.Op.in]: seedPostIds } } });
        await post_like_model_1.default.destroy({ where: { postId: { [sequelize_1.Op.in]: seedPostIds } } });
        await post_model_1.default.destroy({ where: { id: { [sequelize_1.Op.in]: seedPostIds } } });
        console.log(`Deleted ${seedPostIds.length} seed posts`);
    }
    await follow_model_1.default.destroy({
        where: {
            [sequelize_1.Op.or]: [
                { followerId: { [sequelize_1.Op.in]: seedUserIds } },
                { followingId: { [sequelize_1.Op.in]: seedUserIds } },
            ],
        },
    });
    await user_settings_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: seedUserIds } } });
    await user_profile_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: seedUserIds } } });
    await user_model_1.default.destroy({ where: { id: { [sequelize_1.Op.in]: seedUserIds } } });
    console.log(`Deleted ${seedUserIds.length} seed users`);
    console.log('✅ Seed feed data cleared');
    await database_1.default.close();
}
const command = process.argv[2];
if (command === 'clear') {
    clearSeedFeed().catch((err) => {
        console.error('Clear failed:', err.message);
        process.exit(1);
    });
}
else {
    seedFeed().catch((err) => {
        console.error('Seed failed:', err.message);
        process.exit(1);
    });
}
