import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProductImage } from '@/components/ProductImage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState, Loading } from '@/components/ui/States';
import { categories } from '@/data/seed';
import { useAsync } from '@/hooks/useAsync';
import { catalogService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, noWebOutline, radius, spacing } from '@/theme';
import type { CategoryId } from '@/types/models';
import { money } from '@/utils/format';
import { filterProducts } from '@/utils/products';

const LOW_STOCK = 5;

export default function StoreProducts() {
  const storeId = useAuth((s) => s.user!.storeId!);
  const { data, loading } = useAsync(() => catalogService.listProducts({ storeId }), [storeId]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | undefined>();
  const [onlyLow, setOnlyLow] = useState(false);

  const list = useMemo(() => {
    const filtered = filterProducts(data ?? [], { query, categoryId: category });
    return (onlyLow ? filtered.filter((p) => p.stock <= LOW_STOCK) : filtered).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, query, category, onlyLow]);

  if (loading || !data) return <Loading />;
  const lowCount = data.filter((p) => p.stock <= LOW_STOCK).length;

  return (
    <View style={styles.flex}>
      <View style={styles.top}>
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar nos meus produtos"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
          <Pressable style={styles.add} onPress={() => router.push('/loja/produto/novo')} accessibilityLabel="Novo produto">
            <Ionicons name="add" size={26} color={colors.textOnPrimary} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip
            label={`Estoque baixo (${lowCount})`}
            icon="alert-outline"
            selected={onlyLow}
            onPress={() => setOnlyLow((v) => !v)}
          />
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              selected={category === c.id}
              onPress={() => setCategory((cur) => (cur === c.id ? undefined : c.id))}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.count}>{list.length} produtos</Text>}
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            title={data.length === 0 ? 'Nenhum produto cadastrado' : 'Nada encontrado'}
            description={data.length === 0 ? 'Cadastre seus produtos para começar a vender.' : undefined}
            action={
              data.length === 0 ? (
                <Button title="Cadastrar produto" icon="add" onPress={() => router.push('/loja/produto/novo')} />
              ) : undefined
            }
          />
        }
        renderItem={({ item: p }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/loja/produto/${p.id}`)}>
            <ProductImage categoryId={p.categoryId} imageUrl={p.imageUrls[0]} size={56} />
            <View style={styles.flex}>
              <Text style={styles.name} numberOfLines={2}>
                {p.name}
              </Text>
              <View style={styles.meta}>
                <Text style={styles.price}>{money(p.promoPrice ?? p.price)}</Text>
                {p.promoPrice !== undefined && <Text style={styles.promo}>promoção</Text>}
              </View>
            </View>
            <View style={styles.stockBox}>
              <Text
                style={[
                  styles.stock,
                  p.stock === 0 ? styles.stockOut : p.stock <= LOW_STOCK ? styles.stockLow : undefined,
                ]}>
                {p.stock === 0 ? 'Esgotado' : `${p.stock} un.`}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { paddingTop: spacing.md, gap: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
  search: {
    flex: 1,
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
  input: { flex: 1, fontSize: font.size.md, color: colors.text, height: '100%', ...noWebOutline },
  add: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  count: { color: colors.textMuted, fontSize: font.size.sm, paddingVertical: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { color: colors.text, fontSize: font.size.sm, fontWeight: font.weight.medium },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  price: { color: colors.text, fontWeight: font.weight.bold },
  promo: { color: colors.success, fontSize: font.size.xs, fontWeight: font.weight.bold },
  stockBox: { alignItems: 'flex-end' },
  stock: { fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.textMuted },
  stockLow: { color: colors.warning },
  stockOut: { color: colors.danger },
});
