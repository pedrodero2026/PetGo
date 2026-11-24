import { create } from 'zustand';

import { favoriteService } from '@/services';
import type { Favorite } from '@/types/models';

interface FavoritesState {
  userId?: string;
  items: Favorite[];
  load(userId: string): Promise<void>;
  toggle(type: Favorite['type'], targetId: string): Promise<void>;
}

/** Favoritos do usuário em memória, para os corações ficarem iguais em todas as telas. */
export const useFavorites = create<FavoritesState>((set, get) => ({
  items: [],
  async load(userId) {
    if (get().userId === userId) return;
    set({ userId, items: await favoriteService.list(userId) });
  },
  async toggle(type, targetId) {
    const { userId } = get();
    if (!userId) return;
    await favoriteService.toggle(userId, type, targetId);
    set({ items: await favoriteService.list(userId) });
  },
}));

export const isFavorite = (items: Favorite[], type: Favorite['type'], id: string) =>
  items.some((f) => f.type === type && f.targetId === id);
