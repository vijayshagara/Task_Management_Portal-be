import { WhereOptions } from 'sequelize';
import { Cow } from '../models/cow.model';

export type FarmRole = 'admin' | 'developer' | 'farmer';

export function isAdmin(role: string): boolean {
  return role === 'admin';
}

export function cowScopeWhere(userId: string, role: string): WhereOptions<Cow> {
  if (isAdmin(role)) return {};
  return { ownerId: userId };
}

export async function assertCowAccess(
  cowId: string,
  userId: string,
  role: string
): Promise<Cow> {
  const cow = await Cow.findByPk(cowId);
  if (!cow) throw new Error('Cow not found');
  if (!isAdmin(role) && cow.ownerId !== userId) {
    throw new Error('You do not have access to this cow');
  }
  return cow;
}
