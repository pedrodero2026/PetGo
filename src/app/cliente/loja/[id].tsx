import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CartBar } from '@/components/CartBar';
import { ProductCard } from '@/components/ProductCard';
import { StoreAvatar } from '@/components/StoreCard';
import { Chip } from '@/components/ui/Chip';
import { EmptyState, Loading } from '@/components/ui/States';
import { categories } from '@/data/seed';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useAsync } from '@/hooks/useAsync';
import { useCustomerLocation } from '@/hooks/useCustomerLocation';
import { catalogService } from '@/services';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { CategoryId } from '@/types/models';
import { dateTimeLabel, distanceLabel, money, ratingLabel } from '@/utils/format';
import { distanceKm } from '@/utils/geo';

export default function StoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addToCart = useAddToCart();
  const { location } = useCustomerLocation();
  const [category, setCategory] = useState<CategoryId | undefined>();

  const { data, loading } = useAsync(async () => {
    const [store, products, reviews] = await Promise.all([
      catalogService.getStore(id),
      catalogService.listProducts({ storeId: id }),
      catalogService.listReviews({ storeId: id }),
    ]);
    return { store, products, reviews };
  }, [id]);

  const grouped = useMemo(() => {
    const products = data?.products ?? [];
    return categories
      .filter((c) => !category || c.id === category)
      .map((c) => ({ category: c, items: products.filter((p) => p.categoryId === c.id) }))
      .filter((g) => g.items.length > 0);
  }, [data?.products, category]);

  if (loading) return <Loading />;
  const store = data?.store;
  if (!store) return <EmptyState icon="store-off-outline" title="Loja não encontrada" />;

  const km =
    store.address.lat !== undefined ? distanceKm(location, { lat: store.address.lat, lng: store.address.lng! }) : undefined;
  const availableCats = categories.filter((c) => data!.products.some((p) => p.categoryId === c.id));

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: store.name }} />
      <ScrollView contentContainerStyle={styles.content} stickyHeaderIndices={[1]}>
        {/* Cabeçalho da loja */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <StoreAvatar store={store} size={72} />
            <View style={styles.flex}>
              <Text style={styles.name}>{store.name}</Text>
              <View style={styles.row}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.rating}>{ratingLabel(store.rating)}</Text>
                <Text style={styles.muted}>({store.ratingCount} avaliações)</Text>
              </View>
              {!store.isOpen && <Text style={styles.closed}>Fechada no momento</Text>}
            </View>
          </View>
          {!!store.description && <Text style={styles.muted}>{store.description}</Text>}

          <View style={styles.infoBox}>
            <Info icon="time-outline" label="Entrega" value={`${store.deliveryTimeMin}–${store.deliveryTimeMax} min`} />
            <Info
              icon="bicycle-outline"
              label="Taxa"
              value={store.deliveryFee === 0 ? 'Grátis' : money(store.deliveryFee)}
            />
            <Info icon="cash-outline" label="Mínimo" value={money(store.minOrder)} />
            {km !== undefined && <Info icon="location-outline" label="Distância" value={distanceLabel(km)} />}
          </View>
        </View>

        {/* Filtro por categoria (fica grudado no topo ao rolar) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catBar} contentContainerStyle={styles.cats}>
          <Chip label="Tudo" selected={!category} onPress={() => setCategory(undefined)} />
          {availableCats.map((c) => (
            <Chip key={c.id} label={c.name} selected={category === c.id} onPress={() => setCategory(c.id)} />
          ))}
        </ScrollView>

        <View style={styles.products}>
          {grouped.map((g) => (
            <View key={g.category.id}>
              <Text style={styles.groupTitle}>{g.category.name}</Text>
              {g.items.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={store.isOpen ? () => addToCart(p) : undefined} />
              ))}
            </View>
          ))}

          {data!.reviews.length > 0 && (
            <View style={styles.reviews}>
              <Text style={styles.groupTitle}>O que dizem os clientes</Text>
              {data!.reviews.slice(0, 3).map((r) => (
                <View key={r.id} style={styles.review}>
                  <View style={styles.row}>
                    <Text style={styles.reviewAuthor}>{r.authorName}</Text>
                    <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
                  </View>
                  {!!r.comment && <Text style={styles.reviewText}>{r.comment}</Text>}
                  <Text style={styles.reviewDate}>{dateTimeLabel(r.createdAt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <CartBar />
    </View>
  );
}

function Info({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  header: { padding: spacing.lg, gap: spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { color: colors.warning, fontWeight: font.weight.bold },
  muted: { color: colors.textMuted, fontSize: font.size.sm, lineHeight: 20 },
  closed: { color: colors.danger, fontWeight: font.weight.bold, marginTop: 2 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    ...shadow.card,
  },
  info: { flex: 1, alignItems: 'center', gap: 2 },
  infoLabel: { fontSize: 11, color: colors.textMuted },
  infoValue: { fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.text },
  catBar: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  cats: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  products: { paddingHorizontal: spacing.lg },
  groupTitle: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, marginTop: spacing.lg },
  reviews: { gap: spacing.sm },
  review: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  reviewAuthor: { fontWeight: font.weight.bold, color: colors.text, flex: 1 },
  stars: { color: colors.warning },
  reviewText: { color: colors.text },
  reviewDate: { color: colors.textMuted, fontSize: font.size.xs },
});
