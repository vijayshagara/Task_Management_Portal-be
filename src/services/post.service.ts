import { Op } from 'sequelize';
import { z } from 'zod';
import Post from '../models/post.model';
import PostMedia, { MediaType } from '../models/post-media.model';
import PostLike from '../models/post-like.model';
import Comment from '../models/comment.model';
import Follow from '../models/follow.model';
import User from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import Cow from '../models/cow.model';
import SavedItem, { SavedItemType } from '../models/saved-item.model';
import { SocialMediaService } from './social-media.service';
import { SocialNotificationService } from './social-notification.service';
import { ensureMongoConnected } from '../config/mongodb';

const createPostSchema = z.object({
  content: z.string().max(2200).optional(),
  location: z.string().max(100).optional(),
  cowId: z.string().uuid().optional(),
  hashtags: z.array(z.string()).optional(),
});

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
  mentions: z.array(z.string()).optional(),
});

function extractHashtags(content?: string | null): string[] {
  if (!content) return [];
  const matches = content.match(/#[\w]+/g) || [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}

export class PostService {
  private static async formatPost(post: Post, viewerId?: string) {
    const plain = post.get({ plain: true }) as any;
    const likesCount = await PostLike.count({ where: { postId: post.id } });
    const commentsCount = await Comment.count({ where: { postId: post.id } });
    const likedByMe = viewerId
      ? !!(await PostLike.findOne({ where: { postId: post.id, userId: viewerId } }))
      : false;
    const savedByMe = viewerId
      ? !!(await SavedItem.findOne({
          where: { userId: viewerId, itemType: SavedItemType.POST, itemId: post.id },
        }))
      : false;

    return {
      ...plain,
      likesCount,
      commentsCount,
      likedByMe,
      savedByMe,
    };
  }

  public static async createPost(
    authorId: string,
    data: unknown,
    files: Express.Multer.File[] = []
  ) {
    const validated = createPostSchema.parse(data);
    const hashtags = [
      ...new Set([...(validated.hashtags || []), ...extractHashtags(validated.content)]),
    ];

    if (files.length > 0) {
      const mongoReady = await ensureMongoConnected();
      if (!mongoReady) {
        throw new Error(
          'Media storage is not configured on the server. Add MONGODB_URI to Vercel Environment Variables, then redeploy.'
        );
      }
    }

    const post = await Post.create({
      authorId,
      content: validated.content ?? null,
      location: validated.location ?? null,
      cowId: validated.cowId ?? null,
      hashtags,
    });

    for (let i = 0; i < files.length; i++) {
      const uploaded = await SocialMediaService.upload(files[i], `post-${post.id}`);
      await PostMedia.create({
        postId: post.id,
        fileId: uploaded.fileId,
        mediaType: uploaded.mediaType as MediaType,
        sortOrder: i,
      });
    }

    return this.getPostById(post.id, authorId);
  }

  public static async getPostById(postId: string, viewerId?: string) {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture', 'farmName'] }],
        },
        { model: PostMedia, as: 'media' },
        { model: Cow, as: 'cow', attributes: ['id', 'name', 'breed', 'image'] },
      ],
    });

    if (!post) throw new Error('Post not found');
    return this.formatPost(post, viewerId);
  }

  public static async getFeed(userId: string, page = 1, limit = 10) {
    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId'],
    });
    const authorIds = [userId, ...following.map((f) => f.followingId)];

    const offset = (page - 1) * limit;
    const { rows, count } = await Post.findAndCountAll({
      where: { authorId: { [Op.in]: authorIds } },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
        { model: PostMedia, as: 'media' },
        { model: Cow, as: 'cow', attributes: ['id', 'name', 'breed'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const items = await Promise.all(rows.map((post) => this.formatPost(post, userId)));

    return {
      items,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async getUserPosts(userId: string, viewerId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Post.findAndCountAll({
      where: { authorId: userId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
        { model: PostMedia, as: 'media' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const items = await Promise.all(rows.map((post) => this.formatPost(post, viewerId)));

    return {
      items,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async likePost(userId: string, postId: string) {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error('Post not found');

    await PostLike.findOrCreate({
      where: { postId, userId },
      defaults: { postId, userId },
    });

    await SocialNotificationService.create({
      userId: post.authorId,
      actorId: userId,
      type: 'like',
      entityType: 'post',
      entityId: postId,
      message: 'liked your post',
    });

    return { liked: true };
  }

  public static async unlikePost(userId: string, postId: string) {
    await PostLike.destroy({ where: { postId, userId } });
    return { liked: false };
  }

  public static async getPostLikes(postId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await PostLike.findAndCountAll({
      where: { postId },
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      items: rows.map((like) => like.user),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async addComment(userId: string, postId: string, data: unknown) {
    const validated = commentSchema.parse(data);
    const post = await Post.findByPk(postId);
    if (!post) throw new Error('Post not found');

    const comment = await Comment.create({
      postId,
      authorId: userId,
      content: validated.content,
      parentId: validated.parentId ?? null,
      mentions: validated.mentions ?? [],
    });

    await SocialNotificationService.create({
      userId: post.authorId,
      actorId: userId,
      type: validated.parentId ? 'reply' : 'comment',
      entityType: 'post',
      entityId: postId,
      message: validated.parentId ? 'replied to a comment' : 'commented on your post',
    });

    return Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
      ],
    });
  }

  public static async getComments(postId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Comment.findAndCountAll({
      where: { postId, parentId: null },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name'],
              include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      items: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async updateComment(userId: string, commentId: string, content: string) {
    const comment = await Comment.findByPk(commentId);
    if (!comment || comment.authorId !== userId) {
      throw new Error('Comment not found');
    }
    await comment.update({ content });
    return comment;
  }

  public static async deleteComment(userId: string, commentId: string) {
    const comment = await Comment.findByPk(commentId);
    if (!comment || comment.authorId !== userId) {
      throw new Error('Comment not found');
    }
    await Comment.destroy({ where: { parentId: commentId } });
    await comment.destroy();
    return { deleted: true };
  }

  public static async savePost(userId: string, postId: string, collectionName?: string) {
    await SavedItem.findOrCreate({
      where: { userId, itemType: SavedItemType.POST, itemId: postId },
      defaults: { userId, itemType: SavedItemType.POST, itemId: postId, collectionName },
    });
    return { saved: true };
  }

  public static async unsavePost(userId: string, postId: string) {
    await SavedItem.destroy({
      where: { userId, itemType: SavedItemType.POST, itemId: postId },
    });
    return { saved: false };
  }

  public static async getSavedPosts(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { rows, count } = await SavedItem.findAndCountAll({
      where: { userId, itemType: SavedItemType.POST },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const postIds = rows.map((item) => item.itemId);
    const posts = await Post.findAll({
      where: { id: { [Op.in]: postIds } },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'], include: [UserProfile] },
        { model: PostMedia, as: 'media' },
      ],
    });

    const items = await Promise.all(posts.map((post) => this.formatPost(post, userId)));

    return {
      items,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export default PostService;
