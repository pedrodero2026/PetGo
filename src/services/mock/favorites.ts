import type { Favorite } from '@/types/models';
import type { FavoriteService } from '../types';
import { collection } from './collection';

const favoritesDb = collection<Favorite>('favorites', []);

export const mockFavoriteService: FavoriteService = {
  list: (userId) => favoritesDb.where((f) => f.userId === userId),
  async toggle(userId, type, targetId) {
    const [existing] = await favoritesDb.where((f) => f.userId === userId && f.type === type && f.targetId === targetId);
    if (existing) {
      await favoritesDb.remove(existing.id);
      return false;
    }
    await favoritesDb.upsert({ userId, type, targetId }, 'fav');
    return true;
  },
};
