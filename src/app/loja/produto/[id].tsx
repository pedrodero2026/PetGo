import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { ProductImage } from '@/components/ProductImage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Loading } from '@/components/ui/States';
import { TextField } from '@/components/ui/TextField';
import { categories } from '@/data/seed';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, storeAdminService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, spacing } from '@/theme';
import type { CategoryId, LifeStage, PetSize, Product, Species } from '@/types/models';
import { confirm, notify } from '@/utils/confirm';
import { moneyInput, parseMoney } from '@/utils/format';
import { lifeStageLabels, sizeLabels } from '@/utils/pets';
import { goBack } from '@/utils/navigation';

export default function StoreProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'novo';
  const { data, loading } = useAsync(async () => {
    const [species, product] = await Promise.all([
      catalogService.listSpecies(),
      isNew ? null : catalogService.getProduct(id),
    ]);
    return { species, product };
  }, [id]);

  if (loading || !data) return <Loading />;
  return <ProductForm key={id} id={id} product={data.product} species={data.species} />;
}

/** Liga/desliga um valor numa lista (seleção múltipla de chips). */
function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Categorias em que faz sentido informar o peso do pacote. */
const weighted: CategoryId[] = ['racao', 'higiene'];

function ProductForm({ id, product: p, species }: { id: string; product: Product | null; species: Species[] }) {
  const storeId = useAuth((s) => s.user!.storeId!);
  const isNew = !p;

  const [name, setName] = useState(p?.name ?? '');
  const [brand, setBrand] = useState(p?.brand ?? '');
  const [categoryId, setCategoryId] = useState<CategoryId>(p?.categoryId ?? 'racao');
  const [description, setDescription] = useState(p?.description ?? '');
  const [price, setPrice] = useState(moneyInput(p?.price));
  const [promoPrice, setPromoPrice] = useState(moneyInput(p?.promoPrice));
  const [stock, setStock] = useState(p ? String(p.stock) : '');
  const [speciesIds, setSpeciesIds] = useState<string[]>(p?.speciesIds ?? ['cachorro']);
  const [sizes, setSizes] = useState<PetSize[]>(p?.sizes ?? []);
  const [lifeStages, setLifeStages] = useState<LifeStage[]>(p?.lifeStages ?? []);
  const [packageKg, setPackageKg] = useState(p?.packageKg ? String(p.packageKg).replace('.', ',') : '');
  const [requiresPrescription, setRequiresPrescription] = useState(!!p?.requiresPrescription);
  const [imageUrl, setImageUrl] = useState<string | undefined>(p?.imageUrls[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) setImageUrl(result.assets[0].uri);
  }

  async function save() {
    const e: Record<string, string> = {};
    const priceN = parseMoney(price);
    const promoN = promoPrice.trim() ? parseMoney(promoPrice) : undefined;
    const stockN = Number(stock);
    const kgN = packageKg.trim() ? parseMoney(packageKg) : undefined;
    if (name.trim().length < 3) e.name = 'Informe o nome do produto.';
    if (!brand.trim()) e.brand = 'Informe a marca.';
    if (!(priceN > 0)) e.price = 'Preço inválido.';
    if (promoN !== undefined && !(promoN > 0 && promoN < priceN)) e.promo = 'A promoção deve ser menor que o preço.';
    if (!Number.isInteger(stockN) || stockN < 0) e.stock = 'Estoque inválido.';
    if (kgN !== undefined && !(kgN > 0)) e.kg = 'Peso inválido.';
    if (speciesIds.length === 0) e.species = 'Escolha ao menos uma espécie.';
    setErrors(e);
    if (Object.keys(e).length) return notify('Confira os campos destacados');

    setSaving(true);
    try {
      await storeAdminService.saveProduct({
        id: p?.id,
        storeId,
        name: name.trim(),
        brand: brand.trim(),
        categoryId,
        description: description.trim(),
        imageUrls: imageUrl ? [imageUrl] : [],
        price: priceN,
        promoPrice: promoN,
        stock: stockN,
        speciesIds,
        // Lista vazia = serve para todos
        sizes: sizes.length ? sizes : undefined,
        lifeStages: lifeStages.length ? lifeStages : undefined,
        packageKg: weighted.includes(categoryId) ? kgN : undefined,
        requiresPrescription: categoryId === 'remedios' ? requiresPrescription : undefined,
      });
      goBack('/loja/produtos');
    } catch (err) {
      notify('Não foi possível salvar', err instanceof Error ? err.message : undefined);
      setSaving(false);
    }
  }

  async function remove() {
    if (await confirm('Excluir produto', `Excluir "${name}" do catálogo?`, 'Excluir')) {
      await storeAdminService.removeProduct(id);
      goBack('/loja/produtos');
    }
  }

  return (
    <Screen scroll edges={['bottom']}>
      <Stack.Screen options={{ title: isNew ? 'Novo produto' : 'Editar produto' }} />

      <Pressable style={styles.photo} onPress={pickPhoto}>
        <ProductImage categoryId={categoryId} imageUrl={imageUrl} size={120} />
        <View style={styles.camera}>
          <Ionicons name="camera" size={18} color={colors.textOnPrimary} />
        </View>
      </Pressable>
      {imageUrl && (
        <Pressable onPress={() => setImageUrl(undefined)}>
          <Text style={styles.removePhoto}>Remover foto</Text>
        </Pressable>
      )}

      <Group title="Categoria">
        {categories.map((c) => (
          <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
        ))}
      </Group>

      <TextField label="Nome do produto" value={name} onChangeText={setName} error={errors.name} />
      <TextField label="Marca" value={brand} onChangeText={setBrand} error={errors.brand} />
      <TextField
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.multiline}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField label="Preço (R$)" keyboardType="decimal-pad" placeholder="0,00" value={price} onChangeText={setPrice} error={errors.price} />
        </View>
        <View style={styles.flex}>
          <TextField
            label="Promoção (opcional)"
            keyboardType="decimal-pad"
            placeholder="0,00"
            value={promoPrice}
            onChangeText={setPromoPrice}
            error={errors.promo}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField label="Estoque (un.)" keyboardType="number-pad" value={stock} onChangeText={setStock} error={errors.stock} />
        </View>
        {weighted.includes(categoryId) && (
          <View style={styles.flex}>
            <TextField
              label="Peso do pacote (kg)"
              keyboardType="decimal-pad"
              value={packageKg}
              onChangeText={setPackageKg}
              error={errors.kg}
            />
          </View>
        )}
      </View>

      <Group title="Para quais animais?" error={errors.species}>
        {species.map((s) => (
          <Chip
            key={s.id}
            label={s.name}
            icon={s.icon as never}
            selected={speciesIds.includes(s.id)}
            onPress={() => setSpeciesIds((l) => toggleIn(l, s.id))}
          />
        ))}
      </Group>

      <Group title="Porte (vazio = todos)">
        {(Object.keys(sizeLabels) as PetSize[]).map((s) => (
          <Chip key={s} label={sizeLabels[s]} selected={sizes.includes(s)} onPress={() => setSizes((l) => toggleIn(l, s))} />
        ))}
      </Group>

      <Group title="Fase da vida (vazio = todas)">
        {(Object.keys(lifeStageLabels) as LifeStage[]).map((s) => (
          <Chip
            key={s}
            label={lifeStageLabels[s]}
            selected={lifeStages.includes(s)}
            onPress={() => setLifeStages((l) => toggleIn(l, s))}
          />
        ))}
      </Group>

      {categoryId === 'remedios' && (
        <View style={styles.switchRow}>
          <View style={styles.flex}>
            <Text style={styles.switchTitle}>Exige receita veterinária</Text>
            <Text style={styles.hint}>O cliente verá um aviso na página do produto.</Text>
          </View>
          <Switch
            value={requiresPrescription}
            onValueChange={setRequiresPrescription}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.surface}
          />
        </View>
      )}

      <Button title={isNew ? 'Cadastrar produto' : 'Salvar alterações'} onPress={save} loading={saving} />
      {!isNew && <Button title="Excluir produto" variant="ghost" onPress={remove} />}
    </Screen>
  );
}

function Group({ title, error, children }: { title: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.chips}>{children}</View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  photo: { alignSelf: 'center' },
  camera: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  removePhoto: { textAlign: 'center', color: colors.danger, fontSize: font.size.sm },
  group: { gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { fontSize: font.size.xs, color: colors.danger },
  multiline: { paddingVertical: spacing.sm, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.md },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  switchTitle: { fontWeight: font.weight.bold, color: colors.text },
  hint: { color: colors.textMuted, fontSize: font.size.xs },
});
