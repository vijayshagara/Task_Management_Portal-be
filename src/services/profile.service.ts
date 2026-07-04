import { Op } from 'sequelize';
import { z } from 'zod';
import User from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import UserSettings from '../models/user-settings.model';
import Follow from '../models/follow.model';
import Post from '../models/post.model';
import MarketplaceListing from '../models/marketplace-listing.model';
import Cow from '../models/cow.model';
import Block from '../models/block.model';
import { SocialMediaService } from './social-media.service';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  farmName: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional().nullable(),
  isPrivate: z.boolean().optional(),
});

export class ProfileService {
  public static async getProfile(userId: string, viewerId?: string) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      include: [{ model: UserProfile }],
    });

    if (!user) throw new Error('User not found');

    const profile = user.profile;
    const isOwner = viewerId === userId;

    if (profile?.isPrivate && !isOwner && viewerId) {
      const isFollowing = await Follow.findOne({
        where: { followerId: viewerId, followingId: userId },
      });
      if (!isFollowing) {
        return {
          id: user.id,
          name: user.name,
          profile: {
            username: profile.username,
            isPrivate: true,
            isVerified: profile.isVerified,
          },
          stats: await this.getStats(userId, viewerId),
          isFollowing: false,
          isPrivate: true,
        };
      }
    }

    const settings = await UserSettings.findByPk(userId);
    const stats = await this.getStats(userId, viewerId);

    return {
      id: user.id,
      name: user.name,
      email: isOwner || settings?.showEmail ? user.email : undefined,
      role: user.role,
      profile: {
        username: profile?.username,
        bio: profile?.bio,
        farmName: profile?.farmName,
        location: profile?.location,
        contactPhone: isOwner || settings?.showPhone ? profile?.contactPhone : undefined,
        contactEmail: isOwner || settings?.showEmail ? profile?.contactEmail : undefined,
        profilePicture: profile?.profilePicture,
        coverPhoto: profile?.coverPhoto,
        isPrivate: profile?.isPrivate ?? false,
        isVerified: profile?.isVerified ?? false,
      },
      stats,
      isFollowing: viewerId
        ? !!(await Follow.findOne({ where: { followerId: viewerId, followingId: userId } }))
        : false,
      isOwner,
    };
  }

  public static async getStats(userId: string, viewerId?: string) {
    const [postsCount, followersCount, followingCount, listingsCount, cowsCount] =
      await Promise.all([
        Post.count({ where: { authorId: userId } }),
        Follow.count({ where: { followingId: userId } }),
        Follow.count({ where: { followerId: userId } }),
        MarketplaceListing.count({ where: { sellerId: userId, status: 'active' } }),
        Cow.count(),
      ]);

    return { postsCount, followersCount, followingCount, listingsCount, cowsCount };
  }

  public static async updateProfile(userId: string, data: unknown) {
    const validated = updateProfileSchema.parse(data);
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (validated.name) {
      await user.update({ name: validated.name });
    }

    const [profile] = await UserProfile.findOrCreate({
      where: { userId },
      defaults: { userId, username: `user_${userId.slice(0, 8)}` },
    });

    if (validated.username && validated.username !== profile.username) {
      const exists = await UserProfile.findOne({
        where: { username: validated.username, userId: { [Op.ne]: userId } },
      });
      if (exists) throw new Error('Username already taken');
    }

    await profile.update({
      username: validated.username ?? profile.username,
      bio: validated.bio ?? profile.bio,
      farmName: validated.farmName ?? profile.farmName,
      location: validated.location ?? profile.location,
      contactPhone: validated.contactPhone ?? profile.contactPhone,
      contactEmail: validated.contactEmail ?? profile.contactEmail,
      isPrivate: validated.isPrivate ?? profile.isPrivate,
    });

    return this.getProfile(userId, userId);
  }

  public static async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    const profile = await UserProfile.findByPk(userId);
    if (!profile) throw new Error('Profile not found');

    const { fileId } = await SocialMediaService.upload(file, `profile-${userId}`);
    if (profile.profilePicture) {
      await SocialMediaService.deleteByFileId(profile.profilePicture);
    }
    await profile.update({ profilePicture: fileId });
    return { profilePicture: fileId };
  }

  public static async uploadCoverPhoto(userId: string, file: Express.Multer.File) {
    const profile = await UserProfile.findByPk(userId);
    if (!profile) throw new Error('Profile not found');

    const { fileId } = await SocialMediaService.upload(file, `cover-${userId}`);
    if (profile.coverPhoto) {
      await SocialMediaService.deleteByFileId(profile.coverPhoto);
    }
    await profile.update({ coverPhoto: fileId });
    return { coverPhoto: fileId };
  }

  public static async getSuggestedUsers(userId: string, limit = 10) {
    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId'],
    });
    const blocked = await Block.findAll({
      where: {
        [Op.or]: [{ blockerId: userId }, { blockedId: userId }],
      },
    });

    const excludeIds = new Set<string>([userId]);
    following.forEach((f) => excludeIds.add(f.followingId));
    blocked.forEach((b) => {
      excludeIds.add(b.blockerId);
      excludeIds.add(b.blockedId);
    });

    const users = await User.findAll({
      where: { id: { [Op.notIn]: [...excludeIds] } },
      attributes: ['id', 'name'],
      include: [{ model: UserProfile, attributes: ['username', 'farmName', 'profilePicture', 'isVerified'] }],
      limit,
      order: [['createdAt', 'DESC']],
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      profile: u.profile,
    }));
  }
}

export default ProfileService;
