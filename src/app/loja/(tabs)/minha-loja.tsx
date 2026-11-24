import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { StoreAvatar } from '@/components/StoreCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { EmptyState, Loading } from '@/components/ui/States';
import { TextField } from '@/components/ui/TextField';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, storeAdminService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Species, Store } from '@/types/models';
import { lookupCep } from '@/utils/cep';
import { notify } from '@/utils/confirm';
import { maskZip, moneyInput, parseMoney, ratingLabel } from '@/utils/format';

export default function MyStoreScreen() {
  const storeId = useAuth((s) => s.user!.storeId!);
  const { data, loading, reload } = useAsync(async () => {
    const [store, species] = await Promise.all([catalogService.getStore(storeId), catalogService.listSpecies()]);
    return { store, species };
  }, [storeId]);

  if (loading || !data) return <Loading />;
  if (!data.store) return <EmptyState icon="store-alert-outline" title="Loja não encontrada" />;
  // A key força o formulário a recomeçar com os dados salvos após recarregar
  return <StoreForm key={JSON.stringify(data.store)} store={data.store} species={data.species} onSaved={reload} />;
}

function StoreForm({ store, species, onSaved }: { store: Store; species: Species[]; onSaved: () => void }) {
  const a = store.address;
  const [isOpen, setIsOpen] = useState(store.isOpen);
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description ?? '');
  const [zip, setZip] = useState(a.zip);
  const [street, setStreet] = useState(a.street);
  const [number, setNumber] = useState(a.number);
  const [district, setDistrict] = useState(a.district);
  const [city, setCity] = useState(a.city);
  const [uf, setUf] = useState(a.state);
  const [fee, setFee] = useState(moneyInput(store.deliveryFee));
  const [minOrder, setMinOrder] = useState(moneyInput(store.minOrder));
  const [timeMin, setTimeMin] = useState(String(store.deliveryTimeMin));
  const [timeMax, setTimeMax] = useState(String(store.deliveryTimeMax));
  const [speciesIds, setSpeciesIds] = useState(store.speciesIds);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const incomplete = !a.street;

  async function onZip(text: string) {
    const z = maskZip(text);
    setZip(z);
    if (z.length === 9) {
      const found = await lookupCep(z);
      if (found) {
        setStreet(found.street);
        setDistrict(found.district);
        setCity(found.city);
        setUf(found.state);
      }
    }
  }

  // Abrir/fechar salva na hora (é a ação mais usada no dia a dia)
  async function toggleOpen(value: boolean) {
    if (value && incomplete) return notify('Complete o endereço', 'Salve o endereço da loja antes de abrir.');
    setToggling(true);
    setIsOpen(value);
    await storeAdminService.saveStore({ ...store, isOpen: value });
    setToggling(false);
  }

  async function save() {
    const e: Record<string, string> = {};
    const feeN = parseMoney(fee);
    const minN = parseMoney(minOrder);
    const tMin = Number(timeMin);
    const tMax = Number(timeMax);
    if (name.trim().length < 2) e.name = 'Informe o nome da loja.';
    if (zip.length !== 9) e.zip = 'CEP inválido.';
    if (!street.trim()) e.street = 'Informe a rua.';
    if (!number.trim()) e.number = 'Informe o número.';
    if (!district.trim()) e.district = 'Informe o bairro.';
    if (!city.trim()) e.city = 'Informe a cidade.';
    if (!/^[A-Za-z]{2}$/.test(uf.trim())) e.uf = 'UF inválida.';
    if (!(feeN >= 0)) e.fee = 'Valor inválido.';
    if (!(minN >= 0)) e.min = 'Valor inválido.';
    if (!(tMin > 0 && tMax >= tMin)) e.time = 'Tempo inválido.';
    if (speciesIds.length === 0) e.species = 'Escolha ao menos uma.';
    setErrors(e);
    if (Object.keys(e).length) return notify('Confira os campos destacados');

    setSaving(true);
    await storeAdminService.saveStore({
      ...store,
      isOpen,
      name: name.trim(),
      description: description.trim() || undefined,
      address: {
        ...a,
        zip,
        street: street.trim(),
        number: number.trim(),
        district: district.trim(),
        city: city.trim(),
        state: uf.trim().toUpperCase(),
        // CEP novo = coordenada recalculada pelo serviço
        lat: zip === a.zip ? a.lat : undefined,
        lng: zip === a.zip ? a.lng : undefined,
      },
      deliveryFee: feeN,
      minOrder: minN,
      deliveryTimeMin: tMin,
      deliveryTimeMax: tMax,
      speciesIds,
    });
    setSaving(false);
    notify('Dados salvos!');
    onSaved();
  }

  return (
    <Screen scroll edges={[]}>
      {/* Aberta / fechada */}
      <View style={[styles.openCard, { borderColor: isOpen ? colors.success : colors.border }]}>
        <StoreAvatar store={store} size={52} />
        <View style={styles.flex}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={[styles.openLabel, { color: isOpen ? colors.success : colors.danger }]}>
            {isOpen ? 'Aberta, recebendo pedidos' : 'Fechada'}
          </Text>
          {store.ratingCount > 0 && (
            <Text style={styles.muted}>
              ★ {ratingLabel(store.rating)} · {store.ratingCount} avaliações
            </Text>
          )}
        </View>
        <Switch
          value={isOpen}
          onValueChange={toggleOpen}
          disabled={toggling}
          trackColor={{ true: colors.success, false: colors.border }}
          thumbColor={colors.surface}
          accessibilityLabel="Loja aberta"
        />
      </View>

      {incomplete && (
        <View style={styles.warning}>
          <MaterialCommunityIcons name="map-marker-alert-outline" size={22} color={colors.primaryDark} />
          <Text style={styles.warningText}>
            Complete o endereço da loja para aparecer para os clientes e poder abrir.
          </Text>
        </View>
      )}

      <Text style={styles.section}>Informações</Text>
      <TextField label="Nome da loja" value={name} onChangeText={setName} error={errors.name} />
      <TextField label="Descrição" value={description} onChangeText={setDescription} multiline />

      <Text style={styles.section}>Endereço</Text>
      <TextField label="CEP" keyboardType="number-pad" placeholder="00000-000" value={zip} onChangeText={onZip} error={errors.zip} />
      <TextField label="Rua" value={street} onChangeText={setStreet} error={errors.street} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField label="Número" value={number} onChangeText={setNumber} error={errors.number} />
        </View>
        <View style={styles.flex2}>
          <TextField label="Bairro" value={district} onChangeText={setDistrict} error={errors.district} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex3}>
          <TextField label="Cidade" value={city} onChangeText={setCity} error={errors.city} />
        </View>
        <View style={styles.flex}>
          <TextField label="UF" autoCapitalize="characters" maxLength={2} value={uf} onChangeText={setUf} error={errors.uf} />
        </View>
      </View>

      <Text style={styles.section}>Entrega</Text>
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField label="Taxa (R$)" keyboardType="decimal-pad" value={fee} onChangeText={setFee} error={errors.fee} hint="0 = grátis" />
        </View>
        <View style={styles.flex}>
          <TextField label="Pedido mínimo (R$)" keyboardType="decimal-pad" value={minOrder} onChangeText={setMinOrder} error={errors.min} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField label="Tempo mín. (min)" keyboardType="number-pad" value={timeMin} onChangeText={setTimeMin} error={errors.time} />
        </View>
        <View style={styles.flex}>
          <TextField label="Tempo máx. (min)" keyboardType="number-pad" value={timeMax} onChangeText={setTimeMax} />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Animais atendidos</Text>
        <View style={styles.chips}>
          {species.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              icon={s.icon as never}
              selected={speciesIds.includes(s.id)}
              onPress={() =>
                setSpeciesIds((l) => (l.includes(s.id) ? l.filter((x) => x !== s.id) : [...l, s.id]))
              }
            />
          ))}
        </View>
        {!!errors.species && <Text style={styles.error}>{errors.species}</Text>}
      </View>

      <Button title="Salvar dados da loja" onPress={save} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  openCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  storeName: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  openLabel: { fontWeight: font.weight.bold, fontSize: font.size.sm },
  muted: { color: colors.textMuted, fontSize: font.size.xs },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  warningText: { flex: 1, color: colors.primaryDark, fontSize: font.size.sm },
  section: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  group: { gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { fontSize: font.size.xs, color: colors.danger },
});
