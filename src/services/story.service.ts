import { Op } from 'sequelize';
import Story, { StoryMediaType } from '../models/story.model';
import StoryView from '../models/story-view.model';
import StoryReaction from '../models/story-reaction.model';
import Follow from '../models/follow.model';
import User from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import { SocialMediaService } from './social-media.service';
import { SocialNotificationService } from './social-notification.service';

export class StoryService {
  public static async createStory(userId: string, file: Express.Multer.File) {
    const uploaded = await SocialMediaService.upload(file, `story-${userId}`);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return Story.create({
      userId,
      fileId: uploaded.fileId,
      mediaType: uploaded.mediaType as StoryMediaType,
      expiresAt,
    });
  }

  public static async getFeedStories(userId: string) {
    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId'],
    });
    const userIds = [userId, ...following.map((f) => f.followingId)];

    const stories = await Story.findAll({
      where: {
        userId: { [Op.in]: userIds },
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const grouped: Record<string, any> = {};
    for (const story of stories) {
      if (!grouped[story.userId]) {
        grouped[story.userId] = {
          user: story.user,
          stories: [],
        };
      }
      grouped[story.userId].stories.push(story);
    }

    return Object.values(grouped);
  }

  public static async viewStory(viewerId: string, storyId: string) {
    const story = await Story.findByPk(storyId);
    if (!story) throw new Error('Story not found');

    await StoryView.findOrCreate({
      where: { storyId, viewerId },
      defaults: { storyId, viewerId },
    });

    return { viewed: true };
  }

  public static async getStoryViews(storyId: string, userId: string) {
    const story = await Story.findByPk(storyId);
    if (!story || story.userId !== userId) throw new Error('Story not found');

    return StoryView.findAll({
      where: { storyId },
      include: [
        {
          model: User,
          as: 'viewer',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  public static async reactToStory(userId: string, storyId: string, reactionType = 'like') {
    const story = await Story.findByPk(storyId);
    if (!story) throw new Error('Story not found');

    await StoryReaction.findOrCreate({
      where: { storyId, userId },
      defaults: { storyId, userId, reactionType },
    });

    await SocialNotificationService.create({
      userId: story.userId,
      actorId: userId,
      type: 'story_reply',
      entityType: 'story',
      entityId: storyId,
      message: 'reacted to your story',
    });

    return { reacted: true };
  }
}

export default StoryService;
