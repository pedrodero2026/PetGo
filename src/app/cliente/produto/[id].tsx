import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/FavoriteButton';
import { ProductImage } from '@/components/ProductImage';
import { StoreAvatar } from '@/components/StoreCard';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EmptyState, Loading } from '@/components/ui/States';
import { categories } from '@/data/seed';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, petService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, spacing } from '@/theme';
import { dateTimeLabel, money, ratingLabel } from '@/utils/format';
import { lifeStageLabels, productFitsPet, sizeLabels } from '@/utils/pets';
import { discountPercent, finalPrice } from '@/utils/products';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuth((s) => s.user!.id);
  const addToCart = useAddToCart();
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data, loading } = useAsync(async () => {
    const product = await catalogService.getProduct(id);
    if (!product) return null;
    const [store, reviews, species, pets] = await Promise.all([
      catalogService.getStore(product.storeId),
      catalogService.listReviews({ productId: id }),
      catalogService.listSpecies(),
      petService.list(userId),
    ]);
    return { product, store, reviews, species, pets };
  }, [id, userId]);

  if (loading) return <Loading />;
  if (!data) return <EmptyState icon="package-variant-remove" title="Produto não encontrado" />;
  const { product: p, store, reviews, species, pets } = data;

  const off = discountPercent(p);
  const fitPets = pets.filter((pet) => productFitsPet(p, pet));
  const canBuy = !!store?.isOpen && p.stock > 0;

  const tags = [
    ...p.speciesIds.map((s) => species.find((x) => x.id === s)?.name ?? s),
    ...(p.sizes?.length && p.sizes.length < 5 ? [`Porte ${p.sizes.map((s) => sizeLabels[s]).join(', ')}`] : []),
    ...(p.lifeStages ?? []).map((l) => lifeStageLabels[l]),
    ...(p.packageKg ? [`${String(p.packageKg).replace('.', ',')} kg`] : []),
  ];

  async function add() {
    setAdding(true);
    const ok = await addToCart(p, qty);
    setAdding(false);
    if (ok) router.back();
  }

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ headerRight: () => <FavoriteButton type="product" id={p.id} /> }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageBox}>
          <ProductImage categoryId={p.categoryId} imageUrl={p.imageUrls[0]} size={220} />
          {off !== undefined && <Text style={styles.offBadge}>-{off}%</Text>}
        </View>

        <Text style={styles.category}>{categories.find((c) => c.id === p.categoryId)?.name} · {p.brand}</Text>
        <Text style={styles.name}>{p.name}</Text>

        <View style={styles.row}>
          <Ionicons name="star" size={15} color={colors.warning} />
          <Text style={styles.rating}>{ratingLabel(p.rating)}</Text>
          <Text style={styles.muted}>({p.ratingCount} avaliações)</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{money(finalPrice(p))}</Text>
          {p.promoPrice !== undefined && <Text style={styles.oldPrice}>{money(p.price)}</Text>}
        </View>

        {fitPets.length > 0 && (
          <View style={styles.fit}>
            <MaterialCommunityIcons name="check-decagram" size={20} color={colors.success} />
            <Text style={styles.fitText}>Ideal para {fitPets.map((x) => x.name).join(' e ')}</Text>
          </View>
        )}

        {p.requiresPrescription && (
          <View style={styles.rx}>
            <MaterialCommunityIcons name="file-document-alert-outline" size={20} color="#6A4BB3" />
            <Text style={styles.rxText}>
              Exige receita veterinária. A loja pode solicitar a receita na entrega.
            </Text>
          </View>
        )}

        <View style={styles.tags}>
          {tags.map((t) => (
            <Text key={t} style={styles.tag}>
              {t}
            </Text>
          ))}
        </View>

        {canBuy && (p.categoryId === 'racao' || p.categoryId === 'higiene') && (
          <Pressable style={styles.subscribe} onPress={() => router.push(`/cliente/assinar/${p.id}`)}>
            <MaterialCommunityIcons name="refresh-circle" size={30} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={styles.subscribeTitle}>Assine e receba sempre</Text>
              <Text style={styles.subscribeText}>Escolha de quanto em quanto tempo e nunca fique sem.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}

        <Text style={styles.section}>Descrição</Text>
        <Text style={styles.description}>{p.description}</Text>

        {store && (
          <Pressable style={styles.store} onPress={() => router.push(`/cliente/loja/${store.id}`)}>
            <StoreAvatar store={store} size={44} />
            <View style={styles.flex}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.muted}>
                {store.isOpen ? `${store.deliveryTimeMin}–${store.deliveryTimeMax} min` : 'Fechada agora'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        )}

        <Text style={styles.section}>Avaliações</Text>
        {reviews.length === 0 ? (
          <Text style={styles.muted}>Este produto ainda não tem comentários.</Text>
        ) : (
          reviews.map((r) => (
            <View key={r.id} style={styles.review}>
              <View style={styles.row}>
                <Text style={styles.reviewAuthor}>{r.authorName}</Text>
                <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
              </View>
              {!!r.comment && <Text style={styles.description}>{r.comment}</Text>}
              <Text style={styles.reviewDate}>{dateTimeLabel(r.createdAt)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {canBuy ? (
          <>
            <QuantityStepper value={qty} onChange={setQty} min={1} max={p.stock} />
            <Button
              title={`Adicionar · ${money(finalPrice(p) * qty)}`}
              onPress={add}
              loading={adding}
              style={styles.flex}
            />
          </>
        ) : (
          <Text style={styles.unavailable}>{p.stock === 0 ? 'Produto esgotado' : 'Loja fechada no momento'}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  imageBox: { alignItems: 'center', marginBottom: spacing.sm },
  offBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: 0,
    backgroundColor: colors.success,
    color: colors.textOnPrimary,
    fontWeight: font.weight.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  category: { color: colors.primary, fontWeight: font.weight.bold, fontSize: font.size.sm },
  name: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { color: colors.warning, fontWeight: font.weight.bold },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  price: { fontSize: font.size.xl, fontWeight: font.weight.black, color: colors.text },
  oldPrice: { color: colors.textMuted, textDecorationLine: 'line-through' },
  fit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#E3F5EA',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
  },
  fitText: { color: colors.success, fontWeight: font.weight.bold, flex: 1 },
  rx: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#ECE5F7',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
  },
  rxText: { color: '#6A4BB3', flex: 1, fontSize: font.size.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  subscribe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    marginTop: spacing.sm,
  },
  subscribeTitle: { color: colors.primaryDark, fontWeight: font.weight.bold },
  subscribeText: { color: colors.primaryDark, fontSize: font.size.xs },
  tag: {
    backgroundColor: colors.secondaryLight,
    color: colors.secondary,
    fontSize: font.size.xs,
    fontWeight: font.weight.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  section: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, marginTop: spacing.md },
  description: { color: colors.text, lineHeight: 22 },
  store: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  storeName: { fontWeight: font.weight.bold, color: colors.text },
  review: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  reviewAuthor: { fontWeight: font.weight.bold, color: colors.text, flex: 1 },
  stars: { color: colors.warning },
  reviewDate: { color: colors.textMuted, fontSize: font.size.xs },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  unavailable: { flex: 1, textAlign: 'center', color: colors.textMuted, fontWeight: font.weight.bold, paddingVertical: spacing.md },
});
