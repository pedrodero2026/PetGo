import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeliveryMap } from '@/components/DeliveryMap';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState, Loading } from '@/components/ui/States';
import { TextField } from '@/components/ui/TextField';
import { useAsync } from '@/hooks/useAsync';
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';
import { catalogService, deliveryService, orderService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Order, Store } from '@/types/models';
import { notify } from '@/utils/confirm';
import { distanceLabel, money } from '@/utils/format';
import { directionsUrl, distanceKm, etaMinutes, type LatLng } from '@/utils/geo';

export default function DeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useAsync(async () => {
    const order = await orderService.get(id);
    const store = order ? await catalogService.getStore(order.storeId) : null;
    return { order, store };
  }, [id]);
  const [live, setLive] = useState<Order | null>(null);
  useEffect(() => orderService.subscribe(id, setLive), [id]);

  if (loading) return <Loading />;
  const order = live ?? data?.order;
  if (!order || !data?.store) return <EmptyState icon="moped-outline" title="Entrega não encontrada" />;
  return <Delivery order={order} store={data.store} />;
}

function Delivery({ order, store }: { order: Order; store: Store }) {
  const user = useAuth((s) => s.user!);
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'simulado' | 'gps'>('simulado');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const storePos: LatLng = { lat: store.address.lat!, lng: store.address.lng! };
  const customerPos: LatLng = { lat: order.address.lat!, lng: order.address.lng! };
  const mine = order.courierId === user.id;
  // Só o entregador responsável envia a localização
  useDeliveryTracking(mine ? order : undefined, storePos, mode);

  const courierPos = order.courierLocation ?? (order.status === 'pronto' ? undefined : storePos);
  const remainingKm = distanceKm(order.status === 'a_caminho' && courierPos ? courierPos : storePos, customerPos);

  if (!mine) return <EmptyState icon="account-cancel-outline" title="Esta entrega é de outro entregador" />;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado.');
    } finally {
      setBusy(false);
    }
  }

  if (order.status === 'entregue') {
    return (
      <EmptyState
        icon="check-decagram"
        title="Entrega concluída!"
        description={`Você ganhou ${money(order.courierFee ?? 5)} nesta entrega.`}
        action={<Button title="Ver novas entregas" onPress={() => router.replace('/entregador')} />}
      />
    );
  }

  const pickingUp = order.status === 'pronto';
  const a = order.address;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <DeliveryMap store={storePos} customer={customerPos} courier={courierPos} />

        {/* Etapas */}
        <View style={styles.steps}>
          <Step n={1} label="Retirar na loja" active={pickingUp} done={!pickingUp} />
          <View style={styles.stepLine} />
          <Step n={2} label="Entregar ao cliente" active={!pickingUp} done={false} />
        </View>

        {pickingUp ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Retire o pedido</Text>
            <Line icon="storefront-outline" text={store.name} bold />
            <Line icon="location-outline" text={`${store.address.street}, ${store.address.number} · ${store.address.district}`} />
            <Text style={styles.code}>Pedido #{order.id.slice(-6).toUpperCase()}</Text>
            {order.items.map((i) => (
              <Text key={i.productId} style={styles.item}>
                {i.quantity}x {i.name}
              </Text>
            ))}
            <Button title="Abrir rota no mapa" variant="outline" icon="navigate-outline" onPress={() => Linking.openURL(directionsUrl(storePos))} />
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.etaRow}>
                <MaterialCommunityIcons name="map-marker-distance" size={22} color={colors.primary} />
                <Text style={styles.eta}>
                  {distanceLabel(remainingKm)} · ~{etaMinutes(remainingKm, user.vehicle)} min até o cliente
                </Text>
              </View>
              <Line icon="person-outline" text={order.customerName ?? 'Cliente'} bold />
              {!!order.customerPhone && (
                <Pressable onPress={() => Linking.openURL(`tel:${order.customerPhone!.replace(/\D/g, '')}`)}>
                  <Line icon="call-outline" text={order.customerPhone} link />
                </Pressable>
              )}
              <Line
                icon="location-outline"
                text={`${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ''}\n${a.district}, ${a.city}`}
              />
              <Button title="Abrir rota no mapa" variant="outline" icon="navigate-outline" onPress={() => Linking.openURL(directionsUrl(customerPos))} />
            </View>

            {order.paymentMethod === 'dinheiro' ? (
              <View style={[styles.card, styles.cash]}>
                <Text style={styles.cashTitle}>Receber {money(order.total)} em dinheiro</Text>
                {order.changeFor !== undefined && (
                  <Text style={styles.cashText}>
                    Cliente paga com {money(order.changeFor)}: troco de {money(order.changeFor - order.total)}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.paid}>✓ Pedido já pago pelo app</Text>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Localização enviada ao cliente</Text>
              <View style={styles.chips}>
                <Chip label="Simulada" icon="play-circle-outline" selected={mode === 'simulado'} onPress={() => setMode('simulado')} />
                <Chip label="GPS do celular" icon="crosshairs-gps" selected={mode === 'gps'} onPress={() => setMode('gps')} />
              </View>
              <Text style={styles.hint}>
                {mode === 'simulado'
                  ? 'Para apresentação: o entregador anda sozinho da loja até o cliente em cerca de 1 minuto e meio.'
                  : 'Usa a localização real do aparelho (pede permissão).'}
              </Text>
            </View>

            <TextField
              label="Código de entrega"
              icon="keypad-outline"
              keyboardType="number-pad"
              maxLength={4}
              placeholder="Peça os 4 dígitos ao cliente"
              value={code}
              onChangeText={setCode}
              hint="O cliente vê o código na tela do pedido."
            />
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {pickingUp ? (
          <Button title="Retirei o pedido" icon="cube-outline" loading={busy} onPress={() => run(() => deliveryService.pickUp(order.id))} />
        ) : (
          <Button
            title="Confirmar entrega"
            icon="checkmark-circle-outline"
            loading={busy}
            disabled={code.length !== 4}
            onPress={() =>
              run(async () => {
                await deliveryService.confirmDelivery(order.id, code);
                notify('Entrega concluída!', `+ ${money(order.courierFee ?? 5)}`);
              })
            }
          />
        )}
      </View>
    </View>
  );
}

function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepCircle, (active || done) && styles.stepCircleOn]}>
        {done ? (
          <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
        ) : (
          <Text style={[styles.stepN, active && { color: colors.textOnPrimary }]}>{n}</Text>
        )}
      </View>
      <Text style={[styles.stepLabel, active && { color: colors.text, fontWeight: font.weight.bold }]}>{label}</Text>
    </View>
  );
}

function Line({ icon, text, bold, link }: { icon: keyof typeof Ionicons.glyphMap; text: string; bold?: boolean; link?: boolean }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.lineText, bold && styles.bold, link && styles.link]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  steps: { flexDirection: 'row', alignItems: 'center' },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepCircleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepN: { fontWeight: font.weight.bold, color: colors.textMuted, fontSize: font.size.sm },
  stepLabel: { color: colors.textMuted, fontSize: font.size.sm },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadow.card },
  cardTitle: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  lineText: { flex: 1, color: colors.text, fontSize: font.size.sm, lineHeight: 20 },
  bold: { fontWeight: font.weight.bold, fontSize: font.size.md },
  link: { color: colors.primary, fontWeight: font.weight.bold },
  code: { fontWeight: font.weight.black, color: colors.text, marginTop: spacing.xs },
  item: { color: colors.text, fontSize: font.size.sm },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eta: { color: colors.primaryDark, fontWeight: font.weight.bold, flex: 1 },
  cash: { backgroundColor: '#FFF6D6' },
  cashTitle: { fontWeight: font.weight.bold, color: colors.secondary, fontSize: font.size.md },
  cashText: { color: colors.secondary },
  paid: { color: colors.success, fontWeight: font.weight.bold, textAlign: 'center' },
  chips: { flexDirection: 'row', gap: spacing.sm },
  hint: { color: colors.textMuted, fontSize: font.size.xs, lineHeight: 18 },
  error: { color: colors.danger, textAlign: 'center' },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
});
