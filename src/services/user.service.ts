import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../models/user.model';
import { UserRole } from '../models/user.model';
import { z } from 'zod';
import sequelize from '../config/database';
import UserSettings from '../models/user-settings.model';
import UserProfile from '../models/user-profile.model';
import RefreshToken from '../models/refresh-token.model';
import PasswordReset from '../models/password-reset.model';
import PushToken from '../models/push-token.model';
import DeviceApiKey from '../models/device-api-key.model';
import FarmDiary from '../models/farm-diary.model';
import MilkRecord from '../models/milk-record.model';
import MilkCollection from '../models/milk-collection.model';
import Vaccination from '../models/vaccination.model';
import Pregnancy from '../models/pregnancy.model';
import KnowledgeArticle from '../models/knowledge-article.model';
import Task from '../models/task.model';
import Cow from '../models/cow.model';
import Post from '../models/post.model';
import PostMedia from '../models/post-media.model';
import PostLike from '../models/post-like.model';
import Comment from '../models/comment.model';
import Follow from '../models/follow.model';
import FollowRequest from '../models/follow-request.model';
import Block from '../models/block.model';
import SavedItem from '../models/saved-item.model';
import Notification from '../models/notification.model';
import Message from '../models/message.model';
import Conversation from '../models/conversation.model';
import MarketplaceListing from '../models/marketplace-listing.model';
import Story from '../models/story.model';
import StoryView from '../models/story-view.model';
import StoryReaction from '../models/story-reaction.model';

const SAFE_USER_ATTRIBUTES = ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'] as const;
const SALT_ROUNDS = 10;

export class UserService {
  private static userSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(UserRole),
  });

  public static async getAllUsers(): Promise<User[]> {
    return await User.findAll({
      attributes: [...SAFE_USER_ATTRIBUTES],
    });
  }

  public static async getDevelopers(): Promise<User[]> {
    return await User.findAll({
      where: { role: UserRole.DEVELOPER },
      attributes: [...SAFE_USER_ATTRIBUTES],
    });
  }

  public static async getUserById(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      attributes: [...SAFE_USER_ATTRIBUTES],
    });
  }

  public static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    const validatedData = this.userSchema.parse(userData);
    const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
    });
    const safe = await this.getUserById(user.id);
    return safe as User;
  }

  public static async updateUser(
    id: string,
    userData: Partial<{ name: string; email: string; password: string; role: UserRole }>
  ): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    const validatedData = this.userSchema.partial().parse(userData);
    const updates: Partial<{ name: string; email: string; password: string; role: UserRole }> = {};
    if (validatedData.name !== undefined) updates.name = validatedData.name;
    if (validatedData.email !== undefined) updates.email = validatedData.email;
    if (validatedData.role !== undefined) updates.role = validatedData.role;
    if (validatedData.password !== undefined) {
      updates.password = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
    }

    await user.update(updates);
    return await this.getUserById(id);
  }

  private static async cascadeDeleteUsers(ids: string[]): Promise<number> {
    if (!ids.length) return 0;

    return sequelize.transaction(async (transaction) => {
      const posts = await Post.findAll({
        where: { authorId: { [Op.in]: ids } },
        attributes: ['id'],
        transaction,
      });
      const postIds = posts.map((p) => p.id);
      const stories = await Story.findAll({
        where: { userId: { [Op.in]: ids } },
        attributes: ['id'],
        transaction,
      });
      const storyIds = stories.map((s) => s.id);
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { participant1Id: { [Op.in]: ids } },
            { participant2Id: { [Op.in]: ids } },
          ],
        },
        attributes: ['id'],
        transaction,
      });
      const conversationIds = conversations.map((c) => c.id);

      if (storyIds.length) {
        await StoryReaction.destroy({ where: { storyId: { [Op.in]: storyIds } }, transaction });
        await StoryView.destroy({ where: { storyId: { [Op.in]: storyIds } }, transaction });
      }
      await StoryReaction.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await StoryView.destroy({ where: { viewerId: { [Op.in]: ids } }, transaction });
      await Story.destroy({ where: { userId: { [Op.in]: ids } }, transaction });

      if (conversationIds.length) {
        await Message.destroy({
          where: { conversationId: { [Op.in]: conversationIds } },
          transaction,
        });
        await Conversation.destroy({
          where: { id: { [Op.in]: conversationIds } },
          transaction,
        });
      }
      await Message.destroy({ where: { senderId: { [Op.in]: ids } }, transaction });

      await Notification.destroy({
        where: {
          [Op.or]: [{ userId: { [Op.in]: ids } }, { actorId: { [Op.in]: ids } }],
        },
        transaction,
      });
      await SavedItem.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await Block.destroy({
        where: {
          [Op.or]: [{ blockerId: { [Op.in]: ids } }, { blockedId: { [Op.in]: ids } }],
        },
        transaction,
      });
      await Follow.destroy({
        where: {
          [Op.or]: [{ followerId: { [Op.in]: ids } }, { followingId: { [Op.in]: ids } }],
        },
        transaction,
      });
      await FollowRequest.destroy({
        where: {
          [Op.or]: [{ requesterId: { [Op.in]: ids } }, { targetId: { [Op.in]: ids } }],
        },
        transaction,
      });

      if (postIds.length) {
        await PostLike.destroy({ where: { postId: { [Op.in]: postIds } }, transaction });
        await Comment.destroy({ where: { postId: { [Op.in]: postIds } }, transaction });
        await PostMedia.destroy({ where: { postId: { [Op.in]: postIds } }, transaction });
      }
      await PostLike.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await Comment.destroy({ where: { authorId: { [Op.in]: ids } }, transaction });
      await Post.destroy({ where: { authorId: { [Op.in]: ids } }, transaction });

      await MarketplaceListing.destroy({ where: { sellerId: { [Op.in]: ids } }, transaction });
      await FarmDiary.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await MilkRecord.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await MilkCollection.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await Vaccination.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await Pregnancy.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await KnowledgeArticle.destroy({ where: { authorId: { [Op.in]: ids } }, transaction });
      await DeviceApiKey.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await PushToken.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await Task.destroy({ where: { developerId: { [Op.in]: ids } }, transaction });
      await Cow.update(
        { ownerId: null },
        { where: { ownerId: { [Op.in]: ids } }, transaction }
      );

      await RefreshToken.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await PasswordReset.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await UserSettings.destroy({ where: { userId: { [Op.in]: ids } }, transaction });
      await UserProfile.destroy({ where: { userId: { [Op.in]: ids } }, transaction });

      return User.destroy({ where: { id: { [Op.in]: ids } }, transaction });
    });
  }

  public static async deleteUser(id: string): Promise<boolean> {
    const user = await User.findByPk(id);
    if (!user) return false;
    const count = await this.cascadeDeleteUsers([id]);
    return count > 0;
  }

  public static async bulkDeleteUsers(
    ids: string[],
    requestingUserId: string
  ): Promise<{ ids: string[]; count: number }> {
    const filteredIds = [...new Set(ids)].filter((id) => id !== requestingUserId);
    if (!filteredIds.length) return { ids: [], count: 0 };

    const existing = await User.findAll({
      where: { id: { [Op.in]: filteredIds } },
      attributes: ['id'],
    });
    const deleteIds = existing.map((u) => u.id);
    if (!deleteIds.length) return { ids: [], count: 0 };

    const count = await this.cascadeDeleteUsers(deleteIds);
    return { ids: deleteIds, count };
  }
}
