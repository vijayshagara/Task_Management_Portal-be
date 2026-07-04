import { NotificationType } from '../models/notification.model';
import Notification from '../models/notification.model';

interface CreateNotificationInput {
  userId: string;
  actorId?: string;
  type: keyof typeof NotificationType extends never ? string : string;
  entityType?: string;
  entityId?: string;
  message: string;
}

export class SocialNotificationService {
  public static async create(input: CreateNotificationInput) {
    if (input.userId === input.actorId) return null;

    return Notification.create({
      userId: input.userId,
      actorId: input.actorId ?? null,
      type: input.type as NotificationType,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      message: input.message,
    });
  }

  public static async getForUser(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Notification.findAndCountAll({
      where: { userId },
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

  public static async markRead(userId: string, notificationId?: string) {
    if (notificationId) {
      await Notification.update(
        { isRead: true },
        { where: { id: notificationId, userId } }
      );
    } else {
      await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
    }
    return { success: true };
  }

  public static async getUnreadCount(userId: string) {
    const count = await Notification.count({ where: { userId, isRead: false } });
    return { count };
  }
}

export default SocialNotificationService;
