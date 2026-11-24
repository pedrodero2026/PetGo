import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/store/auth';
import { isFavorite, useFavorites } from '@/store/favorites';
import { colors } from '@/theme';
import type { Favorite } from '@/types/models';

/** Coração de favoritar loja/produto. */
export function FavoriteButton({ type, id, size = 24 }: { type: Favorite['type']; id: string; size?: number }) {
  const userId = useAuth((s) => s.user?.id);
  const { items, load, toggle } = useFavorites();
  useEffect(() => {
    if (userId) load(userId);
  }, [userId, load]);
  const on = isFavorite(items, type, id);

  return (
    <Pressable
      onPress={() => toggle(type, id)}
      hitSlop={10}
      accessibilityLabel={on ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      style={styles.btn}>
      <Ionicons name={on ? 'heart' : 'heart-outline'} size={size} color={on ? colors.danger : colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({ btn: { padding: 4 } });
