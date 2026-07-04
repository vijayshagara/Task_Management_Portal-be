import { Op } from 'sequelize';
import Follow from '../models/follow.model';
import FollowRequest, { FollowRequestStatus } from '../models/follow-request.model';
import UserProfile from '../models/user-profile.model';
import User from '../models/user.model';
import Block from '../models/block.model';
import { SocialNotificationService } from './social-notification.service';

export class FollowService {
  private static async isBlocked(userA: string, userB: string): Promise<boolean> {
    const block = await Block.findOne({
      where: {
        [Op.or]: [
          { blockerId: userA, blockedId: userB },
          { blockerId: userB, blockedId: userA },
        ],
      },
    });
    return !!block;
  }

  public static async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new Error('Cannot follow yourself');
    if (await this.isBlocked(followerId, followingId)) {
      throw new Error('Action not allowed');
    }

    const existing = await Follow.findOne({ where: { followerId, followingId } });
    if (existing) throw new Error('Already following');

    const profile = await UserProfile.findByPk(followingId);
    if (!profile) throw new Error('User not found');

    if (profile.isPrivate) {
      const pending = await FollowRequest.findOne({
        where: { requesterId: followerId, targetId: followingId, status: FollowRequestStatus.PENDING },
      });
      if (pending) throw new Error('Follow request already sent');

      const request = await FollowRequest.create({
        requesterId: followerId,
        targetId: followingId,
      });

      await SocialNotificationService.create({
        userId: followingId,
        actorId: followerId,
        type: 'follow_request',
        entityType: 'follow_request',
        entityId: request.id,
        message: 'sent you a follow request',
      });

      return { status: 'requested' };
    }

    await Follow.create({ followerId, followingId });
    await SocialNotificationService.create({
      userId: followingId,
      actorId: followerId,
      type: 'follow',
      entityType: 'user',
      entityId: followerId,
      message: 'started following you',
    });

    return { status: 'following' };
  }

  public static async unfollow(followerId: string, followingId: string) {
    await Follow.destroy({ where: { followerId, followingId } });
    await FollowRequest.destroy({
      where: { requesterId: followerId, targetId: followingId },
    });
    return { status: 'unfollowed' };
  }

  public static async respondToRequest(
    userId: string,
    requestId: string,
    action: 'accept' | 'reject'
  ) {
    const request = await FollowRequest.findByPk(requestId);
    if (!request || request.targetId !== userId) {
      throw new Error('Request not found');
    }

    if (action === 'accept') {
      await request.update({ status: FollowRequestStatus.ACCEPTED });
      await Follow.findOrCreate({
        where: {
          followerId: request.requesterId,
          followingId: request.targetId,
        },
        defaults: {
          followerId: request.requesterId,
          followingId: request.targetId,
        },
      });
      await SocialNotificationService.create({
        userId: request.requesterId,
        actorId: userId,
        type: 'follow',
        entityType: 'user',
        entityId: userId,
        message: 'accepted your follow request',
      });
    } else {
      await request.update({ status: FollowRequestStatus.REJECTED });
    }

    return request;
  }

  public static async getFollowers(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Follow.findAndCountAll({
      where: { followingId: userId },
      include: [
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture', 'farmName'] }],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      items: rows.map((r) => r.follower),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async getFollowing(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Follow.findAndCountAll({
      where: { followerId: userId },
      include: [
        {
          model: User,
          as: 'following',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture', 'farmName'] }],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      items: rows.map((r) => r.following),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async getPendingRequests(userId: string) {
    return FollowRequest.findAll({
      where: { targetId: userId, status: FollowRequestStatus.PENDING },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}

export default FollowService;
