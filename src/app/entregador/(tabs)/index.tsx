import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { EmptyState, Loading, SectionHeader } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { isInProgress, useAvailableDeliveries, useMyDeliveries } from '@/hooks/useCourierOrders';
import { catalogService, deliveryService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Order, Store } from '@/types/models';
import { notify } from '@/utils/confirm';
import { distanceLabel, money, timeAgo } from '@/utils/format';
import { distanceKm, etaMinutes } from '@/utils/geo';

/** Distância da loja até o cliente. */
function tripKm(order: Order, store?: Store) {
  if (!store?.address.lat || order.address.lat === undefined) return undefined;
  return distanceKm({ lat: store.address.lat, lng: store.address.lng! }, { lat: order.address.lat, lng: order.address.lng! });
}

export default function Deliveries() {
  const user = useAuth((s) => s.user!);
  const available = useAvailableDeliveries();
  const mine = useMyDeliveries(user.id);
  const { data: stores } = useAsync(() => catalogService.listStores(), []);
  const [accepting, setAccepting] = useState<string | undefined>();

  const storeById = useMemo(() => Object.fromEntries((stores ?? []).map((s) => [s.id, s])), [stores]);
  const current = mine?.find(isInProgress);

  if (!available || !mine || !stores) return <Loading />;

  async function accept(order: Order) {
    setAccepting(order.id);
    try {
      await deliveryService.accept(order.id, { id: user.id, name: user.name, vehicle: user.vehicle });
      router.push(`/entregador/entrega/${order.id}`);
    } catch (e) {
      notify('Não foi possível aceitar', e instanceof Error ? e.message : undefined);
    } finally {
      setAccepting(undefined);
    }
  }

  return (
    <FlatList
      data={available}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          {current && (
            <Pressable style={styles.current} onPress={() => router.push(`/entregador/entrega/${current.id}`)}>
              <MaterialCommunityIcons name="moped" size={32} color={colors.textOnPrimary} />
              <View style={styles.flex}>
                <Text style={styles.currentTitle}>Entrega em andamento</Text>
                <Text style={styles.currentText}>
                  {current.status === 'pronto'
                    ? `Retire na ${storeById[current.storeId]?.name ?? 'loja'}`
                    : `Levando para ${current.customerName ?? 'o cliente'}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textOnPrimary} />
            </Pressable>
          )}
          <SectionHeader title="Disponíveis agora" />
          <Text style={styles.muted}>Pedidos prontos esperando um entregador. A lista atualiza sozinha.</Text>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="moped-outline"
          title="Nenhuma entrega disponível"
          description="Assim que uma loja marcar um pedido como pronto, ele aparece aqui."
        />
      }
      renderItem={({ item: o }) => {
        const store = storeById[o.storeId];
        const km = tripKm(o, store);
        const count = o.items.reduce((s, i) => s + i.quantity, 0);
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.fee}>{money(o.courierFee ?? 5)}</Text>
              <Text style={styles.muted}>pronto {timeAgo(o.statusHistory.pronto ?? o.updatedAt)}</Text>
            </View>
            <View style={styles.route}>
              <View style={styles.routeLine}>
                <MaterialCommunityIcons name="storefront-outline" size={18} color={colors.secondary} />
                <Text style={styles.routeText} numberOfLines={1}>
                  {store?.name ?? 'Loja'} · {store?.address.street}, {store?.address.number}
                </Text>
              </View>
              <View style={styles.routeLine}>
                <MaterialCommunityIcons name="home-outline" size={18} color={colors.success} />
                <Text style={styles.routeText} numberOfLines={1}>
                  {o.address.street}, {o.address.number} · {o.address.district}
                </Text>
              </View>
            </View>
            <Text style={styles.muted}>
              {km !== undefined ? `${distanceLabel(km)} · ~${etaMinutes(km, user.vehicle)} min · ` : ''}
              {count} {count === 1 ? 'volume' : 'volumes'}
            </Text>
            <Button
              title={current ? 'Finalize a entrega atual' : 'Aceitar entrega'}
              onPress={() => accept(o)}
              disabled={!!current || (!!accepting && accepting !== o.id)}
              loading={accepting === o.id}
            />
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  header: { gap: spacing.sm },
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  currentTitle: { color: colors.textOnPrimary, fontWeight: font.weight.bold, fontSize: font.size.md },
  currentText: { color: colors.primaryLight, fontSize: font.size.sm },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fee: { fontSize: font.size.xl, fontWeight: font.weight.black, color: colors.success },
  route: { gap: 6 },
  routeLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  routeText: { flex: 1, color: colors.text, fontSize: font.size.sm },
});
