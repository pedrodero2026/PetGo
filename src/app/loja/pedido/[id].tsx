import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStoreOrderActions } from '@/components/StoreOrderCard';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/States';
import { SummaryRow } from '@/components/ui/SummaryRow';
import { useAsync } from '@/hooks/useAsync';
import { orderService } from '@/services';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Order } from '@/types/models';
import { dateTimeLabel, money } from '@/utils/format';
import { paymentLabels, statusFlow, statusInfo, storeCanCancel, storeNextStep } from '@/utils/orders';

export default function StoreOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useAsync(() => orderService.get(id), [id]);
  const [live, setLive] = useState<Order | null>(null);
  useEffect(() => orderService.subscribe(id, setLive), [id]);

  if (loading) return <Loading />;
  const order = live ?? data;
  if (!order) return <EmptyState icon="receipt-text-remove-outline" title="Pedido não encontrado" />;
  return <OrderDetail order={order} />;
}

function OrderDetail({ order }: { order: Order }) {
  const insets = useSafeAreaInsets();
  const { busy, advance, askCancel, modal } = useStoreOrderActions(order);
  const info = statusInfo[order.status];
  const next = storeNextStep(order.status);
  const step = statusFlow.indexOf(order.status);
  const a = order.address;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.status, { borderColor: info.color }]}>
          <MaterialCommunityIcons name={info.icon as never} size={32} color={info.color} />
          <View style={styles.flex}>
            <Text style={[styles.statusLabel, { color: info.color }]}>{info.label}</Text>
            <Text style={styles.muted}>
              Pedido #{order.id.slice(-6).toUpperCase()} · {dateTimeLabel(order.createdAt)}
            </Text>
            {order.status === 'cancelado' && !!order.cancelReason && (
              <Text style={styles.cancel}>Motivo: {order.cancelReason}</Text>
            )}
          </View>
        </View>

        {order.status !== 'cancelado' && (
          <View style={styles.progress}>
            {statusFlow.map((s, i) => (
              <View key={s} style={[styles.bar, i <= step && { backgroundColor: colors.primary }]} />
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.section}>Cliente</Text>
          <View style={styles.line}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.text}>{order.customerName ?? 'Cliente'}</Text>
          </View>
          {!!order.customerPhone && (
            <View style={styles.line}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={styles.text}>{order.customerPhone}</Text>
            </View>
          )}
          <View style={styles.line}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={[styles.text, styles.flex]}>
              {a.street}, {a.number}
              {a.complement ? ` - ${a.complement}` : ''}
              {'\n'}
              {a.district}, {a.city} - {a.state} · {a.zip}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Itens para separar</Text>
          {order.items.map((i) => (
            <View key={i.productId} style={styles.item}>
              <Text style={styles.qty}>{i.quantity}x</Text>
              <Text style={[styles.text, styles.flex]}>{i.name}</Text>
              <Text style={styles.text}>{money(i.unitPrice * i.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <SummaryRow label="Subtotal" value={money(order.subtotal)} />
          <SummaryRow label="Taxa de entrega" value={order.deliveryFee === 0 ? 'Grátis' : money(order.deliveryFee)} />
          {order.discount > 0 && <SummaryRow label="Desconto" value={`- ${money(order.discount)}`} highlight />}
          <SummaryRow label="Total" value={money(order.total)} bold />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Pagamento</Text>
          <Text style={styles.text}>{paymentLabels[order.paymentMethod]}</Text>
          {order.changeFor !== undefined && (
            <Text style={styles.change}>
              Levar troco para {money(order.changeFor)} (troco de {money(order.changeFor - order.total)})
            </Text>
          )}
        </View>
      </ScrollView>

      {(next || storeCanCancel(order.status)) && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          {storeCanCancel(order.status) && (
            <Button
              title={order.status === 'aguardando' ? 'Recusar' : 'Cancelar'}
              variant="outline"
              onPress={askCancel}
              disabled={busy}
              style={styles.flex}
            />
          )}
          {next && <Button title={next.label} onPress={() => advance(next.status)} loading={busy} style={styles.flex2} />}
        </View>
      )}
      {order.status === 'pronto' && (
        <Text style={[styles.waiting, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          Aguardando um entregador retirar o pedido.
        </Text>
      )}
      {modal}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  content: { padding: spacing.lg, gap: spacing.md },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 2,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  statusLabel: { fontSize: font.size.lg, fontWeight: font.weight.bold },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
  cancel: { color: colors.danger, fontSize: font.size.sm, marginTop: 2 },
  progress: { flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadow.card },
  section: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  text: { color: colors.text, fontSize: font.size.sm, lineHeight: 20 },
  item: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  qty: { fontWeight: font.weight.black, color: colors.primary, minWidth: 28 },
  divider: { height: 1, backgroundColor: colors.border },
  change: { color: colors.secondary, fontWeight: font.weight.bold, fontSize: font.size.sm },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  waiting: { textAlign: 'center', color: colors.textMuted, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
