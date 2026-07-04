import { Op } from 'sequelize';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import User from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import { SocialNotificationService } from './social-notification.service';

export class MessageService {
  public static async getOrCreateConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) throw new Error('Invalid conversation');

    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id: userId, participant2Id: otherUserId },
          { participant1Id: otherUserId, participant2Id: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participant1Id: userId,
        participant2Id: otherUserId,
      });
    }

    return this.getConversationWithUsers(conversation.id, userId);
  }

  private static formatConversation(conv: Conversation, userId: string) {
    const plain = conv.get({ plain: true }) as any;
    const otherUser =
      plain.participant1Id === userId ? plain.participant2 : plain.participant1;
    const lastMessage = plain.messages?.[0] || null;
    return { ...plain, otherUser, lastMessage };
  }

  public static async getConversationWithUsers(conversationId: string, userId: string) {
    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (
      !conversation ||
      (conversation.participant1Id !== userId && conversation.participant2Id !== userId)
    ) {
      throw new Error('Conversation not found');
    }

    return this.formatConversation(conversation, userId);
  }

  public static async getConversations(userId: string) {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
      order: [['lastMessageAt', 'DESC NULLS LAST'], ['updatedAt', 'DESC']],
    });

    return conversations.map((conv) => this.formatConversation(conv, userId));
  }

  public static async getMessages(userId: string, conversationId: string, page = 1, limit = 30) {
    const conversation = await Conversation.findByPk(conversationId);
    if (
      !conversation ||
      (conversation.participant1Id !== userId && conversation.participant2Id !== userId)
    ) {
      throw new Error('Conversation not found');
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await Message.findAndCountAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    await Message.update(
      { readAt: new Date() },
      {
        where: {
          conversationId,
          readAt: null,
          senderId: { [Op.ne]: userId },
        },
      }
    );

    return {
      items: rows.reverse(),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async sendMessage(
    senderId: string,
    conversationId: string,
    data: { content?: string; imageFileId?: string; sharedPostId?: string }
  ) {
    const conversation = await Conversation.findByPk(conversationId);
    if (
      !conversation ||
      (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId)
    ) {
      throw new Error('Conversation not found');
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content: data.content ?? null,
      imageFileId: data.imageFileId ?? null,
      sharedPostId: data.sharedPostId ?? null,
    });

    await conversation.update({ lastMessageAt: new Date() });

    const recipientId =
      conversation.participant1Id === senderId
        ? conversation.participant2Id
        : conversation.participant1Id;

    await SocialNotificationService.create({
      userId: recipientId,
      actorId: senderId,
      type: 'message',
      entityType: 'conversation',
      entityId: conversationId,
      message: 'sent you a message',
    });

    return Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name'],
          include: [{ model: UserProfile, attributes: ['username', 'profilePicture'] }],
        },
      ],
    });
  }
}

export default MessageService;
