import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { SummaryRow as Row } from '@/components/ui/SummaryRow';
import { Loading } from '@/components/ui/States';
import { TextField } from '@/components/ui/TextField';
import { useAsync } from '@/hooks/useAsync';
import { addressService, catalogService, orderService } from '@/services';
import { useAuth } from '@/store/auth';
import { cartSubtotal, useCart } from '@/store/cart';
import { colors, font, radius, spacing } from '@/theme';
import type { PaymentMethod } from '@/types/models';
import { money } from '@/utils/format';

const methods: { id: PaymentMethod; label: string; desc: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'pix', label: 'Pix', desc: 'Aprovação na hora', icon: 'qrcode' },
  { id: 'cartao', label: 'Cartão de crédito', desc: 'Final 4242 (simulado)', icon: 'credit-card-outline' },
  { id: 'dinheiro', label: 'Dinheiro', desc: 'Pague na entrega', icon: 'cash' },
];

export default function Checkout() {
  const user = useAuth((s) => s.user!);
  const { items, storeId, clear } = useCart();
  const insets = useSafeAreaInsets();

  const [addressId, setAddressId] = useState<string | undefined>();
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [change, setChange] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const { data, loading } = useAsync(async () => {
    const [addresses, store] = await Promise.all([
      addressService.list(user.id),
      storeId ? catalogService.getStore(storeId) : null,
    ]);
    return { addresses, store };
  }, [user.id, storeId]);

  if (loading || !data) return <Loading />;
  const { addresses, store } = data;
  const address = addresses.find((a) => a.id === addressId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];

  const subtotal = cartSubtotal(items);
  const fee = store?.deliveryFee ?? 0;
  const total = subtotal + fee;

  async function placeOrder() {
    setError('');
    if (!store || items.length === 0) return setError('Sua sacola está vazia.');
    if (!address) return setError('Cadastre um endereço de entrega.');
    const changeFor = method === 'dinheiro' && change ? Number(change.replace(',', '.')) : undefined;
    if (changeFor !== undefined && (isNaN(changeFor) || changeFor < total)) {
      return setError('O valor do troco deve ser maior que o total do pedido.');
    }

    setPlacing(true);
    try {
      const order = await orderService.create({
        customerId: user.id,
        storeId: store.id,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        address,
        paymentMethod: method,
        changeFor,
      });
      clear();
      router.dismissAll();
      router.push(`/cliente/pedido/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível fazer o pedido.');
      setPlacing(false);
    }
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Endereço */}
        <Text style={styles.section}>Entregar em</Text>
        {addresses.length === 0 ? (
          <Button title="Cadastrar endereço" variant="secondary" icon="add" onPress={() => router.push('/cliente/enderecos/novo')} />
        ) : (
          <>
            {addresses.map((a) => {
              const selected = a.id === address?.id;
              return (
                <Pressable key={a.id} style={[styles.option, selected && styles.optionSelected]} onPress={() => setAddressId(a.id)}>
                  <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.textMuted} />
                  <View style={styles.flex}>
                    <Text style={styles.optionTitle}>{a.label}</Text>
                    <Text style={styles.optionDesc}>
                      {a.street}, {a.number}
                      {a.complement ? ` - ${a.complement}` : ''} · {a.district}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
            <Pressable onPress={() => router.push('/cliente/enderecos/novo')}>
              <Text style={styles.link}>+ Novo endereço</Text>
            </Pressable>
          </>
        )}

        {/* Pagamento */}
        <Text style={styles.section}>Pagamento</Text>
        <Text style={styles.simulated}>Pagamento simulado: nenhuma cobrança real é feita.</Text>
        {methods.map((m) => {
          const selected = m.id === method;
          return (
            <Pressable key={m.id} style={[styles.option, selected && styles.optionSelected]} onPress={() => setMethod(m.id)}>
              <MaterialCommunityIcons name={m.icon} size={24} color={selected ? colors.primary : colors.textMuted} />
              <View style={styles.flex}>
                <Text style={styles.optionTitle}>{m.label}</Text>
                <Text style={styles.optionDesc}>{m.desc}</Text>
              </View>
              <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.textMuted} />
            </Pressable>
          );
        })}
        {method === 'dinheiro' && (
          <TextField
            label="Troco para quanto? (opcional)"
            icon="cash-outline"
            keyboardType="decimal-pad"
            placeholder={`Ex.: ${Math.ceil(total / 50) * 50}`}
            value={change}
            onChangeText={setChange}
          />
        )}

        {/* Resumo */}
        <Text style={styles.section}>Resumo</Text>
        <View style={styles.summary}>
          {items.map((i) => (
            <Row key={i.productId} label={`${i.quantity}x ${i.name}`} value={money(i.unitPrice * i.quantity)} />
          ))}
          <View style={styles.divider} />
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="Taxa de entrega" value={fee === 0 ? 'Grátis' : money(fee)} highlight={fee === 0} />
          <Row label="Total" value={money(total)} bold />
        </View>
        {store && (
          <Text style={styles.eta}>
            Previsão de entrega: {store.deliveryTimeMin}–{store.deliveryTimeMax} min
          </Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title={`Fazer pedido · ${money(total)}`} onPress={placeOrder} loading={placing} disabled={!address} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  section: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, marginTop: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionTitle: { fontWeight: font.weight.bold, color: colors.text },
  optionDesc: { color: colors.textMuted, fontSize: font.size.sm },
  link: { color: colors.primary, fontWeight: font.weight.bold, paddingVertical: spacing.xs },
  simulated: { color: colors.textMuted, fontSize: font.size.xs },
  summary: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border },
  eta: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  footer: { padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  error: { color: colors.danger, textAlign: 'center' },
});
