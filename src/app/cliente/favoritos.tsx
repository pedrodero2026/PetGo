import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { StoreCard } from '@/components/StoreCard';
import { Chip } from '@/components/ui/Chip';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useAsync } from '@/hooks/useAsync';
import { catalogService } from '@/services';
import { useAuth } from '@/store/auth';
import { isFavorite, useFavorites } from '@/store/favorites';
import { colors, spacing } from '@/theme';

export default function Favorites() {
  const userId = useAuth((s) => s.user!.id);
  const { items, load } = useFavorites();
  const addToCart = useAddToCart();
  const [tab, setTab] = useState<'store' | 'product'>('product');
  useEffect(() => {
    load(userId);
  }, [userId, load]);

  const { data, loading } = useAsync(async () => {
    const [stores, products] = await Promise.all([catalogService.listStores(), catalogService.listProducts()]);
    return { stores, products };
  }, []);

  const lists = useMemo(() => {
    if (!data) return { stores: [], products: [] };
    return {
      stores: data.stores.filter((s) => isFavorite(items, 'store', s.id)),
      products: data.products.filter((p) => isFavorite(items, 'product', p.id)),
    };
  }, [data, items]);

  if (loading || !data) return <Loading />;
  const storeName = Object.fromEntries(data.stores.map((s) => [s.id, s.name]));

  return (
    <View style={styles.flex}>
      <View style={styles.tabs}>
        <Chip label={`Produtos (${lists.products.length})`} selected={tab === 'product'} onPress={() => setTab('product')} />
        <Chip label={`Lojas (${lists.stores.length})`} selected={tab === 'store'} onPress={() => setTab('store')} />
      </View>
      {tab === 'product' ? (
        <FlatList
          data={lists.products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="heart-outline" title="Nenhum produto favorito" description="Toque no coração na página do produto." />}
          renderItem={({ item }) => <ProductCard product={item} storeName={storeName[item.storeId]} onAdd={() => addToCart(item)} />}
        />
      ) : (
        <FlatList
          data={lists.stores}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="heart-outline" title="Nenhuma loja favorita" description="Toque no coração na página da loja." />}
          renderItem={({ item }) => <StoreCard store={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  list: { paddingHorizontal: spacing.lg, flexGrow: 1 },
});
