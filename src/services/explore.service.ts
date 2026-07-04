import { Op } from 'sequelize';
import Post from '../models/post.model';
import PostLike from '../models/post-like.model';
import User from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import MarketplaceListing from '../models/marketplace-listing.model';
import { ProfileService } from './profile.service';

export class ExploreService {
  public static async getExplore(userId: string) {
    const [popularPosts, recentListings, suggestedUsers] = await Promise.all([
      Post.findAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name'],
            include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
      MarketplaceListing.findAll({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        limit: 8,
      }),
      ProfileService.getSuggestedUsers(userId, 8),
    ]);

    const postIds = popularPosts.map((p) => p.id);
    const likeCounts = await PostLike.findAll({
      where: { postId: { [Op.in]: postIds } },
      attributes: ['postId'],
    });

    const trendingHashtags = await Post.findAll({
      attributes: ['hashtags'],
      limit: 50,
      order: [['createdAt', 'DESC']],
    });

    const tagMap: Record<string, number> = {};
    trendingHashtags.forEach((post) => {
      post.hashtags.forEach((tag) => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });

    const hashtags = Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      popularPosts: popularPosts.map((post) => ({
        ...post.get({ plain: true }),
        likesCount: likeCounts.filter((l) => l.postId === post.id).length,
      })),
      recentListings,
      suggestedUsers,
      trendingHashtags: hashtags,
      trendingFarms: suggestedUsers.filter((u) => u.profile?.farmName),
    };
  }
}

export default ExploreService;
