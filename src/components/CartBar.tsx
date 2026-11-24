import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cartCount, cartSubtotal, useCart } from '@/store/cart';
import { colors, font, radius, spacing } from '@/theme';
import { money } from '@/utils/format';

/** Barra fixa "Ver sacola", mostrada quando há itens no carrinho. */
export function CartBar() {
  const items = useCart((s) => s.items);
  const insets = useSafeAreaInsets();
  if (items.length === 0) return null;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <Pressable style={styles.bar} onPress={() => router.push('/cliente/carrinho')}>
        <View style={styles.count}>
          <Ionicons name="bag-handle" size={18} color={colors.primary} />
          <Text style={styles.countText}>{cartCount(items)}</Text>
        </View>
        <Text style={styles.label}>Ver sacola</Text>
        <Text style={styles.total}>{money(cartSubtotal(items))}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bar: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  countText: { color: colors.primary, fontWeight: font.weight.bold },
  label: { flex: 1, textAlign: 'center', color: colors.textOnPrimary, fontWeight: font.weight.bold, fontSize: font.size.md },
  total: { color: colors.textOnPrimary, fontWeight: font.weight.bold, fontSize: font.size.md },
});
