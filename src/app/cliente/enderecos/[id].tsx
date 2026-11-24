import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Loading } from '@/components/ui/States';
import { TextField } from '@/components/ui/TextField';
import { useAsync } from '@/hooks/useAsync';
import { addressService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, spacing } from '@/theme';
import { confirm } from '@/utils/confirm';
import { lookupCep } from '@/utils/cep';
import { maskZip } from '@/utils/format';
import type { Address } from '@/types/models';
import { goBack } from '@/utils/navigation';

const labels = ['Casa', 'Trabalho', 'Outro'];

type Fields = { street: string; number: string; complement: string; district: string; city: string; state: string; zip: string };
const empty: Fields = { street: '', number: '', complement: '', district: '', city: '', state: '', zip: '' };

export default function AddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'novo';
  const { data, loading } = useAsync(() => (isNew ? Promise.resolve(null) : addressService.get(id)), [id]);

  if (loading) return <Loading />;
  return <AddressForm key={id} id={id} isNew={isNew} data={data ?? null} />;
}

function AddressForm({ id, isNew, data }: { id: string; isNew: boolean; data: Address | null }) {
  const userId = useAuth((s) => s.user!.id);
  const [label, setLabel] = useState(data?.label ?? 'Casa');
  const [f, setF] = useState<Fields>(data ? { ...empty, ...data, complement: data.complement ?? '' } : empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [zipHint, setZipHint] = useState<string | undefined>();

  const set = (key: keyof Fields) => (value: string) => setF((cur) => ({ ...cur, [key]: value }));

  async function onZip(text: string) {
    const zip = maskZip(text);
    set('zip')(zip);
    if (zip.length === 9) {
      setSearching(true);
      const found = await lookupCep(zip);
      setSearching(false);
      if (found) {
        setF((cur) => ({ ...cur, ...found, zip }));
        setZipHint('Endereço encontrado. Confira e informe o número.');
      } else {
        setZipHint('Não encontramos este CEP. Preencha o endereço manualmente.');
      }
    }
  }

  async function save() {
    const e: Record<string, string> = {};
    if (f.zip.length !== 9) e.zip = 'CEP inválido.';
    if (!f.street.trim()) e.street = 'Informe a rua.';
    if (!f.number.trim()) e.number = 'Informe o número.';
    if (!f.district.trim()) e.district = 'Informe o bairro.';
    if (!f.city.trim()) e.city = 'Informe a cidade.';
    if (!/^[A-Za-z]{2}$/.test(f.state.trim())) e.state = 'UF com 2 letras.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    await addressService.save({
      id: isNew ? undefined : id,
      userId,
      label,
      street: f.street.trim(),
      number: f.number.trim(),
      complement: f.complement.trim() || undefined,
      district: f.district.trim(),
      city: f.city.trim(),
      state: f.state.trim().toUpperCase(),
      zip: f.zip,
      isDefault: data?.isDefault,
      // Ao mudar o CEP, recalcula a coordenada
      lat: data && data.zip === f.zip ? data.lat : undefined,
      lng: data && data.zip === f.zip ? data.lng : undefined,
    });
    goBack('/cliente/enderecos');
  }

  async function remove() {
    if (await confirm('Remover endereço', 'Deseja remover este endereço?', 'Remover')) {
      await addressService.remove(id);
      goBack('/cliente/enderecos');
    }
  }

  return (
    <Screen scroll edges={['bottom']}>
      <Stack.Screen options={{ title: isNew ? 'Novo endereço' : 'Editar endereço' }} />

      <View style={styles.group}>
        <Text style={styles.label}>Identificação</Text>
        <View style={styles.chips}>
          {labels.map((l) => (
            <Chip key={l} label={l} selected={label === l} onPress={() => setLabel(l)} />
          ))}
        </View>
      </View>

      <TextField
        label={searching ? 'CEP (buscando...)' : 'CEP'}
        icon="search-outline"
        keyboardType="number-pad"
        placeholder="00000-000"
        value={f.zip}
        onChangeText={onZip}
        error={errors.zip}
        hint={zipHint}
      />
      <TextField label="Rua" value={f.street} onChangeText={set('street')} error={errors.street} />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextField label="Número" keyboardType="number-pad" value={f.number} onChangeText={set('number')} error={errors.number} />
        </View>
        <View style={{ flex: 2 }}>
          <TextField label="Complemento" placeholder="Apto, bloco..." value={f.complement} onChangeText={set('complement')} />
        </View>
      </View>
      <TextField label="Bairro" value={f.district} onChangeText={set('district')} error={errors.district} />
      <View style={styles.row}>
        <View style={{ flex: 3 }}>
          <TextField label="Cidade" value={f.city} onChangeText={set('city')} error={errors.city} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="UF" autoCapitalize="characters" maxLength={2} value={f.state} onChangeText={set('state')} error={errors.state} />
        </View>
      </View>

      <Button title="Salvar endereço" onPress={save} loading={saving} />
      {!isNew && <Button title="Remover endereço" variant="ghost" onPress={remove} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.text },
  chips: { flexDirection: 'row', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
});
