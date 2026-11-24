import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Product } from '@/types/models';
import { money } from '@/utils/format';
import { discountPercent } from '@/utils/products';
import { ProductImage } from './ProductImage';

interface Props {
  product: Product;
  /** row = linha da lista; tile = cartão do carrossel */
  variant?: 'row' | 'tile';
  storeName?: string;
  onAdd?: () => void;
}

export function ProductCard({ product: p, variant = 'row', storeName, onAdd }: Props) {
  const open = () => router.push(`/cliente/produto/${p.id}`);
  const off = discountPercent(p);

  const price = (
    <View style={styles.priceRow}>
      <Text style={styles.price}>{money(p.promoPrice ?? p.price)}</Text>
      {p.promoPrice !== undefined && <Text style={styles.oldPrice}>{money(p.price)}</Text>}
    </View>
  );

  const addButton = onAdd && (
    <Pressable
      accessibilityLabel={`Adicionar ${p.name}`}
      onPress={onAdd}
      hitSlop={8}
      disabled={p.stock === 0}
      style={[styles.add, p.stock === 0 && { opacity: 0.4 }]}>
      <Ionicons name="add" size={22} color={colors.textOnPrimary} />
    </Pressable>
  );

  if (variant === 'tile') {
    return (
      <Pressable onPress={open} style={[styles.tile, shadow.card]}>
        <ProductImage categoryId={p.categoryId} imageUrl={p.imageUrls[0]} size={128} style={{ alignSelf: 'center' }} />
        {off !== undefined && <Text style={[styles.badge, styles.badgeTile]}>-{off}%</Text>}
        <Text style={styles.name} numberOfLines={2}>
          {p.name}
        </Text>
        {!!storeName && (
          <Text style={styles.store} numberOfLines={1}>
            {storeName}
          </Text>
        )}
        <View style={styles.tileFooter}>
          {price}
          {addButton}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={open} style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.name} numberOfLines={2}>
          {p.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {p.brand}
          {storeName ? ` · ${storeName}` : ''}
        </Text>
        <View style={styles.tags}>
          {off !== undefined && <Text style={styles.badge}>-{off}%</Text>}
          {p.requiresPrescription && <Text style={[styles.badge, styles.badgeRx]}>Receita</Text>}
          {p.stock === 0 && <Text style={[styles.badge, styles.badgeOut]}>Esgotado</Text>}
        </View>
        {price}
      </View>
      <View>
        <ProductImage categoryId={p.categoryId} imageUrl={p.imageUrls[0]} size={96} />
        {addButton && <View style={styles.addFloating}>{addButton}</View>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowInfo: { flex: 1, gap: 4 },
  name: { fontSize: font.size.md, fontWeight: font.weight.medium, color: colors.text },
  meta: { fontSize: font.size.sm, color: colors.textMuted },
  store: { fontSize: font.size.xs, color: colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginTop: 'auto' },
  price: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  oldPrice: { fontSize: font.size.xs, color: colors.textMuted, textDecorationLine: 'line-through' },
  tags: { flexDirection: 'row', gap: spacing.xs },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: font.weight.bold,
    color: colors.success,
    backgroundColor: '#E3F5EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  badgeRx: { color: '#6A4BB3', backgroundColor: '#ECE5F7' },
  badgeOut: { color: colors.danger, backgroundColor: '#FBE3E0' },
  badgeTile: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  add: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFloating: { position: 'absolute', right: -6, bottom: -6 },
  tile: {
    width: 168,
    padding: spacing.md,
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tileFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' },
});
