import Block from '../models/block.model';
import UserSettings from '../models/user-settings.model';

export class SettingsService {
  public static async getSettings(userId: string) {
    const [settings] = await UserSettings.findOrCreate({
      where: { userId },
      defaults: { userId },
    });
    return settings;
  }

  public static async updateSettings(userId: string, data: Partial<UserSettings>) {
    const settings = await this.getSettings(userId);
    await settings.update(data);
    return settings;
  }

  public static async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new Error('Invalid action');
    await Block.findOrCreate({
      where: { blockerId, blockedId },
      defaults: { blockerId, blockedId },
    });
    return { blocked: true };
  }

  public static async unblockUser(blockerId: string, blockedId: string) {
    await Block.destroy({ where: { blockerId, blockedId } });
    return { blocked: false };
  }
}

export default SettingsService;
