import { Request, Response } from 'express';
import { AuthenticatedRequest, getUserId } from '../interfaces/auth.interface';
import { SocialMediaService } from '../services/social-media.service';
import { StoryService } from '../services/story.service';
import { MarketplaceService } from '../services/marketplace.service';
import { MessageService } from '../services/message.service';
import { SocialNotificationService } from '../services/social-notification.service';
import { SearchService } from '../services/search.service';
import { ExploreService } from '../services/explore.service';
import { SettingsService } from '../services/settings.service';

export class SocialController {
  public static async getMedia(req: Request, res: Response) {
    try {
      const { stream, contentType } = await SocialMediaService.getStream(req.params.fileId);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      stream.pipe(res);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public static async createStory(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }
      const story = await StoryService.createStory(getUserId(req), req.file);
      res.status(201).json(story);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getStories(req: AuthenticatedRequest, res: Response) {
    try {
      const stories = await StoryService.getFeedStories(getUserId(req));
      res.json(stories);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async viewStory(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await StoryService.viewStory(getUserId(req), req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getStoryViews(req: AuthenticatedRequest, res: Response) {
    try {
      const views = await StoryService.getStoryViews(req.params.id, getUserId(req));
      res.json(views);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async reactStory(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await StoryService.reactToStory(getUserId(req), req.params.id, req.body.reactionType);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async createListing(req: AuthenticatedRequest, res: Response) {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const listing = await MarketplaceService.createListing(getUserId(req), req.body, files);
      res.status(201).json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getListings(req: AuthenticatedRequest, res: Response) {
    try {
      const listings = await MarketplaceService.getListings({
        listingType: req.query.listingType as string,
        breed: req.query.breed as string,
        location: req.query.location as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 12,
      });
      res.json(listings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getListing(req: AuthenticatedRequest, res: Response) {
    try {
      const listing = await MarketplaceService.getListingById(req.params.id, req.user?.id);
      res.json(listing);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public static async updateListing(req: AuthenticatedRequest, res: Response) {
    try {
      const listing = await MarketplaceService.updateListing(getUserId(req), req.params.id, req.body);
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async markSold(req: AuthenticatedRequest, res: Response) {
    try {
      const listing = await MarketplaceService.markSold(getUserId(req), req.params.id);
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async saveListing(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await MarketplaceService.saveListing(getUserId(req), req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async contactSeller(req: AuthenticatedRequest, res: Response) {
    try {
      const conversation = await MarketplaceService.contactSeller(
        getUserId(req),
        req.params.id,
        req.body.message
      );
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getUserListings(req: AuthenticatedRequest, res: Response) {
    try {
      const listings = await MarketplaceService.getUserListings(req.params.userId);
      res.json(listings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const conversations = await MessageService.getConversations(getUserId(req));
      res.json(conversations);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const messages = await MessageService.getMessages(getUserId(req), req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const message = await MessageService.sendMessage(getUserId(req), req.params.id, req.body);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async startConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const conversation = await MessageService.getOrCreateConversation(
        getUserId(req),
        req.params.userId
      );
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const notifications = await SocialNotificationService.getForUser(getUserId(req));
      res.json(notifications);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async markNotificationsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await SocialNotificationService.markRead(getUserId(req), req.body.notificationId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await SocialNotificationService.getUnreadCount(getUserId(req));
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async search(req: AuthenticatedRequest, res: Response) {
    try {
      const results = await SearchService.globalSearch(req.query.q as string);
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async explore(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await ExploreService.getExplore(getUserId(req));
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const settings = await SettingsService.getSettings(getUserId(req));
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const settings = await SettingsService.updateSettings(getUserId(req), req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async blockUser(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await SettingsService.blockUser(getUserId(req), req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async unblockUser(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await SettingsService.unblockUser(getUserId(req), req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default SocialController;
