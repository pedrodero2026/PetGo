import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CustomerTracking } from '@/components/CustomerTracking';
import { StoreAvatar } from '@/components/StoreCard';
import { Button } from '@/components/ui/Button';
import { SummaryRow as Row } from '@/components/ui/SummaryRow';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { useReorder } from '@/hooks/useReorder';
import { catalogService, orderService, reviewService } from '@/services';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Order } from '@/types/models';
import { dateTimeLabel, money } from '@/utils/format';
import { isActive, paymentLabels, statusFlow, statusInfo } from '@/utils/orders';

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reorder = useReorder();
  const { data, loading } = useAsync(async () => {
    const order = await orderService.get(id);
    const [store, review] = order
      ? await Promise.all([catalogService.getStore(order.storeId), reviewService.getByOrder(order.id)])
      : [null, null];
    return { order, store, review };
  }, [id]);

  // Atualiza em tempo real quando a loja/entregador mudarem o status
  const [live, setLive] = useState<Order | null>(null);
  useEffect(() => orderService.subscribe(id, setLive), [id]);

  if (loading) return <Loading />;
  const order = live ?? data?.order;
  const store = data?.store;
  if (!order) return <EmptyState icon="receipt-text-remove-outline" title="Pedido não encontrado" />;

  const info = statusInfo[order.status];
  const currentStep = statusFlow.indexOf(order.status);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* Status atual */}
      <View style={[styles.statusCard, { borderColor: info.color }]}>
        <MaterialCommunityIcons
          name={info.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={40}
          color={info.color}
        />
        <View style={styles.flex}>
          <Text style={[styles.statusLabel, { color: info.color }]}>{info.label}</Text>
          <Text style={styles.muted}>{info.desc}</Text>
          {order.status === 'cancelado' && !!order.cancelReason && (
            <Text style={styles.cancelReason}>Motivo: {order.cancelReason}</Text>
          )}
        </View>
      </View>

      {/* Entregador e mapa ao vivo */}
      {store && <CustomerTracking order={order} store={store} />}

      {/* Linha do tempo */}
      {order.status !== 'cancelado' && (
        <View style={styles.card}>
          {statusFlow.map((s, i) => {
            const done = i <= currentStep;
            const at = order.statusHistory?.[s];
            return (
              <View key={s} style={styles.step}>
                <View style={styles.stepTrack}>
                  <View style={[styles.dot, done && { backgroundColor: colors.primary, borderColor: colors.primary }]} />
                  {i < statusFlow.length - 1 && <View style={[styles.line, i < currentStep && { backgroundColor: colors.primary }]} />}
                </View>
                <View style={styles.stepText}>
                  <Text style={[styles.stepLabel, !done && { color: colors.textMuted }]}>{statusInfo[s].label}</Text>
                  {at && <Text style={styles.stepTime}>{dateTimeLabel(at).split(' às ')[1]}</Text>}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Detalhes */}
      <View style={styles.card}>
        {store && (
          <View style={styles.storeRow}>
            <StoreAvatar store={store} size={40} />
            <View style={styles.flex}>
              <Text style={styles.bold}>{store.name}</Text>
              <Text style={styles.muted}>Pedido #{order.id.slice(-6).toUpperCase()} · {dateTimeLabel(order.createdAt)}</Text>
            </View>
          </View>
        )}
        {order.items.map((i) => (
          <Row key={i.productId} label={`${i.quantity}x ${i.name}`} value={money(i.unitPrice * i.quantity)} />
        ))}
        <View style={styles.divider} />
        <Row label="Subtotal" value={money(order.subtotal)} />
        <Row label="Taxa de entrega" value={order.deliveryFee === 0 ? 'Grátis' : money(order.deliveryFee)} />
        {order.discount > 0 && <Row label="Desconto" value={`- ${money(order.discount)}`} highlight />}
        <Row label="Total" value={money(order.total)} bold />
      </View>

      <View style={styles.card}>
        <Text style={styles.bold}>Pagamento</Text>
        <Text style={styles.muted}>
          {paymentLabels[order.paymentMethod]}
          {order.changeFor ? ` · troco para ${money(order.changeFor)}` : ''}
        </Text>
        <Text style={[styles.bold, { marginTop: spacing.sm }]}>Endereço de entrega</Text>
        <Text style={styles.muted}>
          {order.address.street}, {order.address.number}
          {order.address.complement ? ` - ${order.address.complement}` : ''}
          {'\n'}
          {order.address.district}, {order.address.city} - {order.address.state}
        </Text>
      </View>

      {order.status === 'entregue' &&
        (data?.review ? (
          <Text style={styles.reviewed}>
            Você avaliou com {'★'.repeat(data.review.rating)}
            {data.review.reply ? `\nResposta da loja: "${data.review.reply}"` : ''}
          </Text>
        ) : (
          <Button title="Avaliar pedido" icon="star-outline" onPress={() => router.push(`/cliente/avaliar/${order.id}`)} />
        ))}
      {!isActive(order.status) && (
        <Button title="Pedir de novo" variant="secondary" icon="refresh" onPress={() => reorder(order)} />
      )}
      <Button
        title="Falar com a loja"
        variant="outline"
        icon="chatbubbles-outline"
        onPress={() => router.push(`/cliente/chat/${order.storeId}`)}
      />
      <Button title="Voltar ao início" variant="ghost" onPress={() => router.replace('/cliente')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
  },
  statusLabel: { fontSize: font.size.lg, fontWeight: font.weight.bold },
  muted: { color: colors.textMuted, fontSize: font.size.sm, lineHeight: 20 },
  cancelReason: { color: colors.danger, fontSize: font.size.sm, fontWeight: font.weight.bold, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadow.card },
  step: { flexDirection: 'row', gap: spacing.md, minHeight: 40 },
  stepTrack: { alignItems: 'center', width: 16 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  stepText: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  stepLabel: { fontWeight: font.weight.medium, color: colors.text },
  stepTime: { color: colors.textMuted, fontSize: font.size.xs },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  bold: { fontWeight: font.weight.bold, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  reviewed: { textAlign: 'center', color: colors.warning, fontWeight: font.weight.bold, lineHeight: 22 },
});
