import { Op } from 'sequelize';
import User from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import Post from '../models/post.model';
import MarketplaceListing from '../models/marketplace-listing.model';
import Cow from '../models/cow.model';

export class SearchService {
  public static async globalSearch(query: string, limit = 10) {
    const q = query.trim();
    if (!q) {
      return { users: [], farms: [], breeds: [], listings: [], hashtags: [], locations: [] };
    }

    const [users, listings, cows, posts] = await Promise.all([
      User.findAll({
        attributes: ['id', 'name'],
        include: [
          {
            model: UserProfile,
            where: {
              [Op.or]: [
                { username: { [Op.iLike]: `%${q}%` } },
                { farmName: { [Op.iLike]: `%${q}%` } },
              ],
            },
          },
        ],
        limit,
      }),
      MarketplaceListing.findAll({
        where: {
          status: 'active',
          [Op.or]: [
            { title: { [Op.iLike]: `%${q}%` } },
            { breed: { [Op.iLike]: `%${q}%` } },
            { location: { [Op.iLike]: `%${q}%` } },
          ],
        },
        limit,
      }),
      Cow.findAll({
        where: {
          [Op.or]: [{ name: { [Op.iLike]: `%${q}%` } }, { breed: { [Op.iLike]: `%${q}%` } }],
        },
        limit,
      }),
      Post.findAll({
        where: {
          hashtags: { [Op.contains]: [q.replace('#', '').toLowerCase()] },
        },
        limit,
      }),
    ]);

    const farms = users.filter((u) => u.profile?.farmName);
    const breeds = [...new Set(cows.map((c) => c.breed))];
    const hashtags = [...new Set(posts.flatMap((p) => p.hashtags))];
    const locations = [
      ...new Set(
        listings
          .map((l) => l.location)
          .filter(Boolean)
          .concat(users.map((u) => u.profile?.location).filter(Boolean) as string[])
      ),
    ];

    return {
      users: users.map((u) => ({ id: u.id, name: u.name, profile: u.profile })),
      farms: farms.map((u) => ({
        id: u.id,
        farmName: u.profile?.farmName,
        location: u.profile?.location,
      })),
      breeds,
      listings,
      hashtags,
      locations,
    };
  }
}

export default SearchService;
