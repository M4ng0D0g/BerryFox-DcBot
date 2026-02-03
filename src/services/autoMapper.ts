import { getUserById } from './db.js';
import { prisma } from '../db.js';

/**
 * Try to satisfy a function call from common DB operations based on parameter names.
 * Returns null if no automatic mapping found.
 */
export async function autoMap(specName: string, args: any) {
  // common heuristics
  if (args?.userId) {
    const u = await getUserById(args.userId);
    return u ? { id: u.id, username: u.username } : { error: 'user_not_found' };
  }

  if (args?.guildId) {
    const g = await prisma.guild.findUnique({ where: { id: args.guildId } });
    return g ? { id: g.id, name: g.name } : { error: 'guild_not_found' };
  }

  // fallback: try to find a table name matching specName and simple query by id
  try {
    const maybe = await (prisma as any)[specName as any]?.findUnique?.({ where: { id: args.id || args[`${specName}Id`] } });
    if (maybe) return maybe;
  } catch (e: any) {
    // ignore
  }

  return null;
}
