import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Loading } from '@/components/ui/States';
import { TextField } from '@/components/ui/TextField';
import { useAsync } from '@/hooks/useAsync';
import { couponService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, spacing } from '@/theme';
import type { Coupon } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { couponLabel } from '@/utils/coupons';
import { maskDate, moneyInput, parseMoney, toBrDate } from '@/utils/format';
import { goBack } from '@/utils/navigation';

const types: { id: Coupon['type']; label: string }[] = [
  { id: 'percent', label: 'Porcentagem' },
  { id: 'fixed', label: 'Valor fixo' },
  { id: 'frete_gratis', label: 'Entrega grátis' },
];

/** Converte dd/mm/aaaa em data (fim do dia), aceitando datas futuras. */
function parseFutureDate(text: string): string | undefined {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!m) return undefined;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 23, 59, 59);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function CouponScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const storeId = useAuth((s) => s.user!.storeId!);
  const { data, loading } = useAsync(async () => {
    if (id === 'novo') return null;
    return (await couponService.listByStore(storeId)).find((c) => c.id === id) ?? null;
  }, [id, storeId]);
  if (loading) return <Loading />;
  return <CouponForm key={id} coupon={data ?? null} storeId={storeId} />;
}

function CouponForm({ coupon: c, storeId }: { coupon: Coupon | null; storeId: string }) {
  const [code, setCode] = useState(c?.code ?? '');
  const [type, setType] = useState<Coupon['type']>(c?.type ?? 'percent');
  const [value, setValue] = useState(c ? (c.type === 'fixed' ? moneyInput(c.value) : String(c.value)) : '');
  const [minOrder, setMinOrder] = useState(moneyInput(c?.minOrder));
  const [expires, setExpires] = useState(toBrDate(c?.expiresAt));
  const [active, setActive] = useState(c?.active ?? true);
  const [description, setDescription] = useState(c?.description ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function save() {
    const e: Record<string, string> = {};
    const v = type === 'frete_gratis' ? 0 : parseMoney(value);
    const min = minOrder.trim() ? parseMoney(minOrder) : undefined;
    const exp = expires.trim() ? parseFutureDate(expires) : undefined;
    if (!/^[A-Z0-9]{4,15}$/.test(code.trim().toUpperCase())) e.code = 'Use de 4 a 15 letras ou números, sem espaços.';
    if (type === 'percent' && !(v > 0 && v <= 90)) e.value = 'Entre 1% e 90%.';
    if (type === 'fixed' && !(v > 0)) e.value = 'Valor inválido.';
    if (min !== undefined && !(min >= 0)) e.min = 'Valor inválido.';
    if (expires.trim() && !exp) e.expires = 'Data inválida.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await couponService.save({
        id: c?.id,
        storeId,
        code,
        type,
        value: v,
        minOrder: min,
        expiresAt: exp,
        active,
        description: description.trim() || undefined,
      });
      goBack('/loja/cupons');
    } catch (err) {
      setErrors({ code: err instanceof Error ? err.message : 'Erro ao salvar.' });
      setSaving(false);
    }
  }

  async function remove() {
    if (c && (await confirm('Excluir cupom', `Excluir o cupom ${c.code}?`, 'Excluir'))) {
      await couponService.remove(c.id);
      goBack('/loja/cupons');
    }
  }

  const preview: Coupon = { id: '', code, type, value: type === 'fixed' ? parseMoney(value) || 0 : Number(value) || 0, active };

  return (
    <Screen scroll edges={['bottom']}>
      <Stack.Screen options={{ title: c ? 'Editar cupom' : 'Novo cupom' }} />
      <TextField
        label="Código"
        icon="pricetag-outline"
        autoCapitalize="characters"
        placeholder="Ex.: BEMVINDO10"
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase().replace(/\s/g, ''))}
        error={errors.code}
      />
      <View style={styles.group}>
        <Text style={styles.label}>Tipo de desconto</Text>
        <View style={styles.chips}>
          {types.map((t) => (
            <Chip key={t.id} label={t.label} selected={type === t.id} onPress={() => setType(t.id)} />
          ))}
        </View>
      </View>
      {type !== 'frete_gratis' && (
        <TextField
          label={type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={setValue}
          error={errors.value}
        />
      )}
      <TextField label="Pedido mínimo (R$, opcional)" keyboardType="decimal-pad" value={minOrder} onChangeText={setMinOrder} error={errors.min} />
      <TextField
        label="Válido até (opcional)"
        keyboardType="number-pad"
        placeholder="dd/mm/aaaa"
        value={expires}
        onChangeText={(t) => setExpires(maskDate(t))}
        error={errors.expires}
      />
      <TextField label="Descrição para o cliente (opcional)" value={description} onChangeText={setDescription} />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Cupom ativo</Text>
        <Switch value={active} onValueChange={setActive} trackColor={{ true: colors.success, false: colors.border }} thumbColor={colors.surface} />
      </View>
      <View style={styles.preview}>
        <Text style={styles.previewCode}>{code || 'CODIGO'}</Text>
        <Text style={styles.previewText}>{couponLabel(preview)}</Text>
      </View>
      <Button title={c ? 'Salvar cupom' : 'Criar cupom'} onPress={save} loading={saving} />
      {c && <Button title="Excluir cupom" variant="ghost" onPress={remove} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md },
  switchLabel: { fontWeight: font.weight.bold, color: colors.text },
  preview: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  previewCode: { fontSize: font.size.xl, fontWeight: font.weight.black, color: colors.primaryDark, letterSpacing: 2 },
  previewText: { color: colors.primaryDark },
});
