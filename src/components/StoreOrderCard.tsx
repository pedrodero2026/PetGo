import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CancelOrderModal } from '@/components/CancelOrderModal';
import { Button } from '@/components/ui/Button';
import { orderService } from '@/services';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Order, OrderStatus } from '@/types/models';
import { notify } from '@/utils/confirm';
import { money, timeAgo } from '@/utils/format';
import { paymentLabels, statusInfo, storeNextStep } from '@/utils/orders';

/** Hook com as ações da loja sobre um pedido (avançar status e recusar). */
export function useStoreOrderActions(order: Order) {
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function advance(status: OrderStatus, cancelReason?: string) {
    setBusy(true);
    try {
      await orderService.updateStatus(order.id, status, { cancelReason });
    } catch (e) {
      notify('Não foi possível atualizar', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  const modal = cancelling ? (
    <CancelOrderModal
      title={order.status === 'aguardando' ? 'Recusar pedido' : 'Cancelar pedido'}
      onClose={() => setCancelling(false)}
      onConfirm={async (reason) => {
        await advance('cancelado', reason);
        setCancelling(false);
      }}
    />
  ) : null;

  return { busy, advance, askCancel: () => setCancelling(true), modal };
}

export function StoreOrderCard({ order }: { order: Order }) {
  const { busy, advance, askCancel, modal } = useStoreOrderActions(order);
  const info = statusInfo[order.status];
  const next = storeNextStep(order.status);
  const isNew = order.status === 'aguardando';
  const count = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Pressable
      style={[styles.card, isNew && styles.cardNew]}
      onPress={() => router.push(`/loja/pedido/${order.id}`)}>
      <View style={styles.row}>
        <Text style={styles.code}>#{order.id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.time}>{timeAgo(order.createdAt)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.customer}>{order.customerName ?? 'Cliente'}</Text>
        <View style={styles.status}>
          <MaterialCommunityIcons name={info.icon as never} size={14} color={info.color} />
          <Text style={[styles.statusText, { color: info.color }]}>{info.label}</Text>
        </View>
      </View>
      <Text style={styles.items} numberOfLines={2}>
        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' · ')}
      </Text>
      <Text style={styles.meta}>
        {count} {count === 1 ? 'item' : 'itens'} · {money(order.total)} · {paymentLabels[order.paymentMethod]}
      </Text>
      {order.status === 'cancelado' && !!order.cancelReason && (
        <Text style={styles.cancel}>Motivo: {order.cancelReason}</Text>
      )}

      {next && (
        <View style={styles.actions}>
          {isNew && <Button title="Recusar" variant="outline" onPress={askCancel} disabled={busy} style={styles.flex} />}
          <Button title={next.label} onPress={() => advance(next.status)} loading={busy} style={styles.flex2} />
        </View>
      )}
      {modal}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.card,
  },
  cardNew: { borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { fontWeight: font.weight.black, color: colors.text, fontSize: font.size.md },
  time: { color: colors.textMuted, fontSize: font.size.xs },
  customer: { fontWeight: font.weight.bold, color: colors.text },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: font.size.xs, fontWeight: font.weight.bold },
  items: { color: colors.text, fontSize: font.size.sm },
  meta: { color: colors.textMuted, fontSize: font.size.sm },
  cancel: { color: colors.danger, fontSize: font.size.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
});
