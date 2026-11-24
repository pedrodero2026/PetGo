import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, font, radius, spacing } from '@/theme';
import type { Store } from '@/types/models';
import { distanceLabel, money, ratingLabel } from '@/utils/format';

const palette = ['#FF7A00', '#6B4E3D', '#2E9E5B', '#3C7DD9', '#B4489B'];

/** Logo da loja, ou as iniciais num círculo colorido. */
export function StoreAvatar({ store, size = 56 }: { store: Store; size?: number }) {
  const initials = store.name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const bg = palette[Number(store.id.replace(/\D/g, '') || 0) % palette.length];
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

export function StoreCard({ store, distanceKm }: { store: Store; distanceKm?: number }) {
  return (
    <Pressable
      onPress={() => router.push(`/cliente/loja/${store.id}`)}
      style={[styles.card, !store.isOpen && { opacity: 0.55 }]}>
      <StoreAvatar store={store} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {store.name}
        </Text>
        <View style={styles.line}>
          <Ionicons name="star" size={13} color={colors.warning} />
          <Text style={styles.rating}>{ratingLabel(store.rating)}</Text>
          {distanceKm !== undefined && <Text style={styles.meta}>· {distanceLabel(distanceKm)}</Text>}
        </View>
        <Text style={styles.meta}>
          {store.isOpen ? `${store.deliveryTimeMin}–${store.deliveryTimeMax} min` : 'Fechada agora'} ·{' '}
          <Text style={store.deliveryFee === 0 && styles.free}>
            {store.deliveryFee === 0 ? 'Entrega grátis' : money(store.deliveryFee)}
          </Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: font.weight.black },
  info: { flex: 1, gap: 2 },
  name: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  line: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.warning },
  meta: { fontSize: font.size.sm, color: colors.textMuted },
  free: { color: colors.success, fontWeight: font.weight.bold },
});

export const storeCardRadius = radius.lg;
