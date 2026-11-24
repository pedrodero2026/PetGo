import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { StoreOrderCard } from '@/components/StoreOrderCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { useStoreOrders } from '@/hooks/useStoreOrders';
import { catalogService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { OrderStatus } from '@/types/models';
import { money } from '@/utils/format';

const tabs: { id: string; label: string; statuses: OrderStatus[] }[] = [
  { id: 'novos', label: 'Novos', statuses: ['aguardando'] },
  { id: 'preparo', label: 'Em preparo', statuses: ['aceito', 'preparando'] },
  { id: 'prontos', label: 'Prontos', statuses: ['pronto', 'a_caminho'] },
  { id: 'concluidos', label: 'Concluídos', statuses: ['entregue', 'cancelado'] },
];

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export default function StoreOrders() {
  const storeId = useAuth((s) => s.user?.storeId);
  const orders = useStoreOrders(storeId);
  const { data: store } = useAsync(() => (storeId ? catalogService.getStore(storeId) : Promise.resolve(null)), [storeId]);
  const [tab, setTab] = useState('novos');

  const summary = useMemo(() => {
    const today = (orders ?? []).filter((o) => isToday(o.createdAt) && o.status !== 'cancelado');
    return { count: today.length, revenue: today.reduce((s, o) => s + o.subtotal, 0) };
  }, [orders]);

  if (!orders) return <Loading />;

  const current = tabs.find((t) => t.id === tab)!;
  const list = orders.filter((o) => current.statuses.includes(o.status));
  const countOf = (statuses: OrderStatus[]) => orders.filter((o) => statuses.includes(o.status)).length;

  return (
    <View style={styles.flex}>
      {/* Resumo do dia */}
      <View style={styles.summary}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{summary.count}</Text>
          <Text style={styles.statLabel}>pedidos hoje</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{money(summary.revenue)}</Text>
          <Text style={styles.statLabel}>em vendas hoje</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <View style={[styles.dot, { backgroundColor: store?.isOpen ? colors.success : colors.danger }]} />
          <Text style={styles.statLabel}>{store?.isOpen ? 'Aberta' : 'Fechada'}</Text>
        </View>
      </View>

      {store && !store.isOpen && (
        <View style={styles.closedBanner}>
          <MaterialCommunityIcons name="store-off-outline" size={22} color={colors.danger} />
          <Text style={styles.closedText}>Sua loja está fechada e não recebe pedidos.</Text>
          <Button title="Abrir" variant="secondary" onPress={() => router.navigate('/loja/minha-loja')} style={styles.openBtn} />
        </View>
      )}

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((t) => {
            const n = countOf(t.statuses);
            return (
              <Chip key={t.id} label={n > 0 && t.id !== 'concluidos' ? `${t.label} (${n})` : t.label} selected={tab === t.id} onPress={() => setTab(t.id)} />
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <StoreOrderCard order={item} />}
        ListEmptyComponent={
          <EmptyState
            icon={tab === 'novos' ? 'bell-sleep-outline' : 'clipboard-text-outline'}
            title={tab === 'novos' ? 'Nenhum pedido novo' : 'Nada por aqui'}
            description={tab === 'novos' ? 'Quando um cliente fizer um pedido, ele aparece aqui na hora.' : undefined}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: font.size.lg, fontWeight: font.weight.black, color: colors.text },
  statLabel: { fontSize: font.size.xs, color: colors.textMuted },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  dot: { width: 14, height: 14, borderRadius: 7, marginBottom: 4 },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    paddingLeft: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FBE3E0',
  },
  closedText: { flex: 1, color: colors.danger, fontSize: font.size.sm, fontWeight: font.weight.medium },
  openBtn: { height: 38, paddingHorizontal: spacing.md },
  tabs: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, flexGrow: 1 },
});
