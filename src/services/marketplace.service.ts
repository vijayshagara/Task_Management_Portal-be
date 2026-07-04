import { Op } from 'sequelize';
import { z } from 'zod';
import MarketplaceListing, { ListingStatus, ListingType } from '../models/marketplace-listing.model';
import SavedItem, { SavedItemType } from '../models/saved-item.model';
import User from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import Cow from '../models/cow.model';
import { SocialMediaService } from './social-media.service';
import { MessageService } from './message.service';

const listingSchema = z.object({
  listingType: z.enum(['cow', 'calf', 'bull', 'fodder', 'equipment', 'dairy_product']),
  title: z.string().min(3).max(150),
  description: z.string().max(2000).optional(),
  breed: z.string().optional(),
  age: z.string().optional(),
  weight: z.coerce.number().optional(),
  milkProduction: z.string().optional(),
  pregnancyStatus: z.string().optional(),
  healthInfo: z.string().optional(),
  vaccinationStatus: z.string().optional(),
  price: z.coerce.number().positive(),
  negotiable: z.coerce.boolean().optional(),
  location: z.string().optional(),
  cowId: z.string().uuid().optional(),
});

export class MarketplaceService {
  public static async createListing(
    sellerId: string,
    data: unknown,
    files: Express.Multer.File[] = []
  ) {
    const validated = listingSchema.parse(data);
    const photos: string[] = [];

    for (const file of files) {
      const uploaded = await SocialMediaService.upload(file, `listing-${sellerId}`);
      photos.push(uploaded.fileId);
    }

    return MarketplaceListing.create({
      sellerId,
      ...validated,
      listingType: validated.listingType as ListingType,
      photos,
      status: ListingStatus.ACTIVE,
    });
  }

  public static async getListings(filters: {
    listingType?: string;
    breed?: string;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;
    const where: any = { status: ListingStatus.ACTIVE };

    if (filters.listingType) where.listingType = filters.listingType;
    if (filters.breed) where.breed = { [Op.iLike]: `%${filters.breed}%` };
    if (filters.location) where.location = { [Op.iLike]: `%${filters.location}%` };
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { rows, count } = await MarketplaceListing.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'farmName', 'profilePicture', 'location'] }],
        },
        { model: Cow, as: 'cow', attributes: ['id', 'name', 'breed', 'image'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      items: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async getListingById(id: string, viewerId?: string) {
    const listing = await MarketplaceListing.findByPk(id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'farmName', 'profilePicture', 'location', 'contactPhone'] }],
        },
        { model: Cow, as: 'cow' },
      ],
    });

    if (!listing) throw new Error('Listing not found');

    const saved = viewerId
      ? !!(await SavedItem.findOne({
          where: { userId: viewerId, itemType: SavedItemType.LISTING, itemId: id },
        }))
      : false;

    return { ...listing.get({ plain: true }), savedByMe: saved };
  }

  public static async updateListing(sellerId: string, id: string, data: unknown) {
    const listing = await MarketplaceListing.findByPk(id);
    if (!listing || listing.sellerId !== sellerId) throw new Error('Listing not found');
    const validated = listingSchema.partial().parse(data);
    await listing.update(validated as any);
    return this.getListingById(id, sellerId);
  }

  public static async markSold(sellerId: string, id: string) {
    const listing = await MarketplaceListing.findByPk(id);
    if (!listing || listing.sellerId !== sellerId) throw new Error('Listing not found');
    await listing.update({ status: ListingStatus.SOLD });
    return listing;
  }

  public static async saveListing(userId: string, listingId: string) {
    await SavedItem.findOrCreate({
      where: { userId, itemType: SavedItemType.LISTING, itemId: listingId },
      defaults: { userId, itemType: SavedItemType.LISTING, itemId: listingId },
    });
    return { saved: true };
  }

  public static async contactSeller(buyerId: string, listingId: string, message: string) {
    const listing = await MarketplaceListing.findByPk(listingId);
    if (!listing) throw new Error('Listing not found');

    const conversation = await MessageService.getOrCreateConversation(buyerId, listing.sellerId);
    await MessageService.sendMessage(buyerId, conversation.id, {
      content: message || `Hi, I'm interested in your listing: ${listing.title}`,
    });

    return MessageService.getConversationWithUsers(conversation.id, buyerId);
  }

  public static async getUserListings(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { rows, count } = await MarketplaceListing.findAndCountAll({
      where: { sellerId: userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      items: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export default MarketplaceService;
