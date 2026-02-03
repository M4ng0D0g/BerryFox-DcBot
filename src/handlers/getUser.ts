import { getUserById } from '../services/db.js';

export default async function handle(args: any) {
  const user = await getUserById(args.userId);
  if (!user) return { error: 'user_not_found' };
  return { id: user.id, username: user.username };
}
