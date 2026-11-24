import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartBar } from '@/components/CartBar';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState, Loading } from '@/components/ui/States';
import { categories } from '@/data/seed';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, petService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, noWebOutline, radius, spacing } from '@/theme';
import type { CategoryId, LifeStage, Pet, PetSize } from '@/types/models';
import { money } from '@/utils/format';
import { lifeStageLabels, lifeStageOf, sizeLabels } from '@/utils/pets';
import { filterProducts, sortProducts, type ProductFilter, type ProductSort } from '@/utils/products';

const sorts: { id: ProductSort; label: string }[] = [
  { id: 'relevancia', label: 'Relevância' },
  { id: 'menor_preco', label: 'Menor preço' },
  { id: 'maior_preco', label: 'Maior preço' },
  { id: 'avaliacao', label: 'Melhor avaliados' },
];

const priceOptions = [30, 60, 100, 200];
const packageOptions: { label: string; min?: number; max?: number }[] = [
  { label: 'Até 3 kg', max: 3 },
  { label: '3 a 10 kg', min: 3, max: 10 },
  { label: 'Acima de 10 kg', min: 10 },
];

type Filters = Omit<ProductFilter, 'query' | 'categoryId' | 'storeId'>;

export default function Buscar() {
  const params = useLocalSearchParams<{ categoria?: CategoryId }>();
  const userId = useAuth((s) => s.user!.id);
  const addToCart = useAddToCart();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | undefined>(params.categoria);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<ProductSort>('relevancia');
  const [petId, setPetId] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Ao tocar numa categoria da home, a busca abre já filtrada
  const [lastParam, setLastParam] = useState(params.categoria);
  if (params.categoria !== lastParam) {
    setLastParam(params.categoria);
    if (params.categoria) setCategory(params.categoria);
  }

  const { data, loading } = useAsync(async () => {
    const [products, stores, species, pets] = await Promise.all([
      catalogService.listProducts(),
      catalogService.listStores(),
      catalogService.listSpecies(),
      petService.list(userId),
    ]);
    return { products, stores, species, pets };
  }, [userId]);

  const pet = data?.pets.find((p) => p.id === petId);

  const results = useMemo(() => {
    if (!data) return [];
    const open = new Set(data.stores.filter((s) => s.isOpen).map((s) => s.id));
    const petFilter: Filters = pet ? { speciesId: pet.speciesId, size: pet.size, lifeStage: lifeStageOf(pet) } : {};
    const list = filterProducts(
      data.products.filter((p) => open.has(p.storeId)),
      { ...filters, ...petFilter, query, categoryId: category },
    );
    return sortProducts(list, sort);
  }, [data, filters, pet, query, category, sort]);

  const storeName = useMemo(
    () => Object.fromEntries((data?.stores ?? []).map((s) => [s.id, s.name])),
    [data?.stores],
  );
  const brands = useMemo(() => [...new Set((data?.products ?? []).map((p) => p.brand))].sort(), [data?.products]);
  const activeCount = Object.values(filters).filter((v) => v !== undefined).length + (sort !== 'relevancia' ? 1 : 0);

  const togglePet = (p: Pet) => setPetId((cur) => (cur === p.id ? undefined : p.id));

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.top}>
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ração, marca, brinquedo..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              returnKeyType="search"
            />
            {!!query && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
          <Pressable style={styles.filterBtn} onPress={() => setShowFilters(true)} accessibilityLabel="Filtros">
            <Ionicons name="options-outline" size={22} color={colors.primary} />
            {activeCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {data?.pets.map((p) => (
            <Chip
              key={p.id}
              label={`Para ${p.name}`}
              icon={p.speciesId === 'gato' ? 'cat' : 'dog'}
              selected={petId === p.id}
              onPress={() => togglePet(p)}
            />
          ))}
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

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.count}>
              {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              {pet ? ` · ideais para ${pet.name}` : ''}
            </Text>
          }
          ListEmptyComponent={
            <EmptyState
              icon="magnify-close"
              title="Nada encontrado"
              description="Tente outra palavra ou remova alguns filtros."
            />
          }
          renderItem={({ item }) => (
            <ProductCard product={item} storeName={storeName[item.storeId]} onAdd={() => addToCart(item)} />
          )}
        />
      )}

      <CartBar />

      {/* Montado só quando aberto, para iniciar com os filtros atuais */}
      {showFilters && (
        <FiltersModal
          onClose={() => setShowFilters(false)}
          initial={filters}
          initialSort={sort}
          species={data?.species ?? []}
          brands={brands}
          onApply={(f, s) => {
            setFilters(f);
            setSort(s);
            setShowFilters(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

interface FiltersModalProps {
  onClose: () => void;
  initial: Filters;
  initialSort: ProductSort;
  species: { id: string; name: string }[];
  brands: string[];
  onApply: (filters: Filters, sort: ProductSort) => void;
}

function FiltersModal({ onClose, initial, initialSort, species, brands, onApply }: FiltersModalProps) {
  const [f, setF] = useState<Filters>(initial);
  const [sort, setSort] = useState(initialSort);

  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setF((cur) => ({ ...cur, [key]: cur[key] === value ? undefined : value }));

  const pkgSelected = (o: (typeof packageOptions)[number]) => f.minPackageKg === o.min && f.maxPackageKg === o.max;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.modalTitle}>Filtros</Text>
          <Pressable
            onPress={() => {
              setF({});
              setSort('relevancia');
            }}>
            <Text style={styles.clear}>Limpar</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          <FilterGroup title="Ordenar por">
            {sorts.map((s) => (
              <Chip key={s.id} label={s.label} selected={sort === s.id} onPress={() => setSort(s.id)} />
            ))}
          </FilterGroup>

          <FilterGroup title="Espécie">
            {species.map((s) => (
              <Chip key={s.id} label={s.name} selected={f.speciesId === s.id} onPress={() => toggle('speciesId', s.id)} />
            ))}
          </FilterGroup>

          <FilterGroup title="Porte">
            {(Object.keys(sizeLabels) as PetSize[]).map((s) => (
              <Chip key={s} label={sizeLabels[s]} selected={f.size === s} onPress={() => toggle('size', s)} />
            ))}
          </FilterGroup>

          <FilterGroup title="Idade">
            {(Object.keys(lifeStageLabels) as LifeStage[]).map((s) => (
              <Chip
                key={s}
                label={lifeStageLabels[s]}
                selected={f.lifeStage === s}
                onPress={() => toggle('lifeStage', s)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Preço máximo">
            {priceOptions.map((p) => (
              <Chip key={p} label={`Até ${money(p)}`} selected={f.maxPrice === p} onPress={() => toggle('maxPrice', p)} />
            ))}
          </FilterGroup>

          <FilterGroup title="Peso do pacote">
            {packageOptions.map((o) => (
              <Chip
                key={o.label}
                label={o.label}
                selected={pkgSelected(o)}
                onPress={() =>
                  setF((cur) =>
                    pkgSelected(o)
                      ? { ...cur, minPackageKg: undefined, maxPackageKg: undefined }
                      : { ...cur, minPackageKg: o.min, maxPackageKg: o.max },
                  )
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Marca">
            {brands.map((b) => (
              <Chip key={b} label={b} selected={f.brand === b} onPress={() => toggle('brand', b)} />
            ))}
          </FilterGroup>

          <FilterGroup title="Outros">
            <Chip label="Só promoções" icon="sale" selected={!!f.onlyPromo} onPress={() => toggle('onlyPromo', true)} />
          </FilterGroup>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button title="Ver resultados" onPress={() => onApply(f, sort)} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupChips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingTop: spacing.sm, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
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
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: colors.textOnPrimary, fontSize: 10, fontWeight: font.weight.bold },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  count: { color: colors.textMuted, fontSize: font.size.sm, paddingTop: spacing.md },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  clear: { color: colors.primary, fontWeight: font.weight.bold },
  modalContent: { padding: spacing.lg, gap: spacing.lg },
  groupTitle: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  groupChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  modalFooter: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
