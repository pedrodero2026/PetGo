import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodReminderCard } from '@/components/FoodReminderCard';
import { ProductCard } from '@/components/ProductCard';
import { StoreCard } from '@/components/StoreCard';
import { Chip } from '@/components/ui/Chip';
import { Loading, SectionHeader } from '@/components/ui/States';
import { categories } from '@/data/seed';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useAsync } from '@/hooks/useAsync';
import { useCustomerLocation } from '@/hooks/useCustomerLocation';
import { useFoodStatuses } from '@/hooks/useFoodStatuses';
import { catalogService, petService, subscriptionService } from '@/services';
import { useAuth } from '@/store/auth';
import { cartCount, useCart } from '@/store/cart';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { notify } from '@/utils/confirm';
import { distanceKm } from '@/utils/geo';
import { notifyNow } from '@/utils/notifications';
import { productFitsPet } from '@/utils/pets';

export default function Home() {
  const user = useAuth((s) => s.user)!;
  const cartItems = useCart((s) => s.items);
  const addToCart = useAddToCart();
  const { address, location } = useCustomerLocation();

  const { data, loading } = useAsync(async () => {
    const [stores, products, pets] = await Promise.all([
      catalogService.listStores(),
      catalogService.listProducts(),
      petService.list(user.id),
    ]);
    return { stores, products, pets };
  }, [user.id]);

  const [petId, setPetId] = useState<string | undefined>();

  // Lembretes de ração (e agendamento das notificações locais)
  const { statuses } = useFoodStatuses(user.id, { schedule: true });
  const reminders = statuses.filter((st) => st.daysLeft <= 10);

  // Assinaturas vencidas viram pedidos ao abrir o app (no Firebase: Cloud Function diária)
  useEffect(() => {
    subscriptionService.processDue(user).then((created) => {
      if (created.length === 0) return;
      const msg = `${created.length} pedido(s) da sua assinatura foram enviados para a loja.`;
      notify('Assinatura', msg);
      notifyNow('Pedido da assinatura enviado 🐾', msg);
    });
  }, [user]);

  const view = useMemo(() => {
    if (!data) return undefined;
    const openStoreIds = new Set(data.stores.filter((s) => s.isOpen).map((s) => s.id));
    const storeName = Object.fromEntries(data.stores.map((s) => [s.id, s.name]));
    const available = data.products.filter((p) => openStoreIds.has(p.storeId) && p.stock > 0);

    const stores = data.stores
      .map((s) => ({
        store: s,
        km: s.address.lat !== undefined ? distanceKm(location, { lat: s.address.lat, lng: s.address.lng! }) : undefined,
      }))
      .sort((a, b) => Number(b.store.isOpen) - Number(a.store.isOpen) || (a.km ?? 99) - (b.km ?? 99));

    const pet = data.pets.find((p) => p.id === petId) ?? data.pets[0];
    const recommended = pet
      ? available
          .filter((p) => productFitsPet(p, pet) && p.categoryId === 'racao')
          .concat(available.filter((p) => productFitsPet(p, pet) && p.categoryId !== 'racao'))
          .slice(0, 10)
      : [];
    const promos = available.filter((p) => p.promoPrice !== undefined).slice(0, 10);

    return { stores, pet, recommended, promos, storeName };
  }, [data, location, petId]);

  const count = cartCount(cartItems);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable style={styles.addressBtn} onPress={() => router.push('/cliente/enderecos')}>
          <Text style={styles.deliverTo}>Entregar em</Text>
          <View style={styles.addressRow}>
            <Text style={styles.address} numberOfLines={1}>
              {address ? `${address.street}, ${address.number}` : 'Cadastre um endereço'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </View>
        </Pressable>
        <Pressable style={styles.cartBtn} onPress={() => router.push('/cliente/carrinho')} accessibilityLabel="Sacola">
          <Ionicons name="bag-handle-outline" size={24} color={colors.text} />
          {count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {loading || !view ? (
        <Loading />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.search} onPress={() => router.push('/cliente/buscar')}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={styles.searchText}>Buscar ração, petiscos, lojas...</Text>
          </Pressable>

          {/* Pets */}
          <View style={styles.block}>
            <Text style={styles.hello}>Olá, {user.name.split(' ')[0]}! Para quem é a compra hoje?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {data!.pets.map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  icon={p.speciesId === 'gato' ? 'cat' : p.speciesId === 'cachorro' ? 'dog' : 'paw'}
                  selected={view.pet?.id === p.id}
                  onPress={() => setPetId(p.id)}
                />
              ))}
              <Chip label="Adicionar pet" icon="plus" onPress={() => router.push('/cliente/pets/novo')} />
            </ScrollView>
          </View>

          {/* Lembretes de ração */}
          {reminders.length > 0 && (
            <View style={styles.block}>
              {reminders.map((st) => (
                <FoodReminderCard key={st.pet.id} status={st} />
              ))}
            </View>
          )}

          {/* Categorias */}
          <View style={styles.categories}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                style={styles.category}
                onPress={() => router.push({ pathname: '/cliente/buscar', params: { categoria: c.id } })}>
                <View style={styles.categoryIcon}>
                  <MaterialCommunityIcons
                    name={c.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.categoryText} numberOfLines={2}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Recomendados */}
          {view.pet && view.recommended.length > 0 && (
            <View style={styles.block}>
              <SectionHeader title={`Recomendados para ${view.pet.name}`} />
              <FlatList
                horizontal
                data={view.recommended}
                keyExtractor={(p) => p.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    variant="tile"
                    storeName={view.storeName[item.storeId]}
                    onAdd={() => addToCart(item)}
                  />
                )}
              />
            </View>
          )}

          {/* Ofertas */}
          {view.promos.length > 0 && (
            <View style={styles.block}>
              <View style={styles.promoBanner}>
                <MaterialCommunityIcons name="sale" size={30} color={colors.textOnPrimary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>Ofertas da semana</Text>
                  <Text style={styles.promoText}>Descontos de até 15% em produtos selecionados</Text>
                </View>
              </View>
              <FlatList
                horizontal
                data={view.promos}
                keyExtractor={(p) => p.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    variant="tile"
                    storeName={view.storeName[item.storeId]}
                    onAdd={() => addToCart(item)}
                  />
                )}
              />
            </View>
          )}

          {/* Lojas */}
          <View style={styles.block}>
            <SectionHeader
              title="Lojas perto de você"
              action={
                <Pressable onPress={() => router.push('/cliente/mapa')} style={styles.mapLink}>
                  <Ionicons name="map-outline" size={16} color={colors.primary} />
                  <Text style={styles.link}>Ver no mapa</Text>
                </Pressable>
              }
            />
            {view.stores.map(({ store, km }) => (
              <StoreCard key={store.id} store={store} distanceKm={km} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  addressBtn: { flex: 1 },
  deliverTo: { fontSize: font.size.xs, color: colors.textMuted },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  address: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text, flexShrink: 1 },
  cartBtn: { padding: spacing.xs },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.textOnPrimary, fontSize: 11, fontWeight: font.weight.bold },
  content: { paddingBottom: spacing.xl, gap: spacing.lg },
  search: {
    marginHorizontal: spacing.lg,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  searchText: { color: colors.textMuted, fontSize: font.size.md },
  block: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  hello: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  hRow: { gap: spacing.sm, paddingRight: spacing.lg },
  categories: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  category: { width: 64, alignItems: 'center', gap: spacing.xs },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: { fontSize: 11, textAlign: 'center', color: colors.text, fontWeight: font.weight.medium },
  carousel: { gap: spacing.md, paddingVertical: spacing.sm, paddingRight: spacing.lg },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  promoTitle: { color: colors.textOnPrimary, fontSize: font.size.md, fontWeight: font.weight.bold },
  promoText: { color: colors.secondaryLight, fontSize: font.size.sm },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  link: { color: colors.primary, fontWeight: font.weight.bold },
});
