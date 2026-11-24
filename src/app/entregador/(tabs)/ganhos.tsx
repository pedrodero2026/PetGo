import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { EmptyState, Loading } from '@/components/ui/States';
import { useMyDeliveries } from '@/hooks/useCourierOrders';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Order } from '@/types/models';
import { dateTimeLabel, money } from '@/utils/format';

const DAY = 24 * 3600 * 1000;
const plural = (n: number) => `${n} ${n === 1 ? 'entrega' : 'entregas'}`;

/** Totais de ganhos: hoje, últimos 7 dias e total (recalculado quando as entregas mudam). */
function earningsStats(orders: Order[], now = Date.now()) {
  const done = orders.filter((o) => o.status === 'entregue');
  const deliveredAt = (o: Order) => new Date(o.statusHistory.entregue ?? o.updatedAt).getTime();
  const today = new Date(now).toDateString();
  const todayList = done.filter((o) => new Date(deliveredAt(o)).toDateString() === today);
  const week = done.filter((o) => now - deliveredAt(o) < 7 * DAY);
  const sum = (l: Order[]) => l.reduce((s, o) => s + (o.courierFee ?? 5), 0);
  return { done, today: sum(todayList), todayCount: todayList.length, week: sum(week), weekCount: week.length, total: sum(done) };
}

export default function Earnings() {
  const userId = useAuth((s) => s.user!.id);
  const mine = useMyDeliveries(userId);

  const stats = useMemo(() => earningsStats(mine ?? []), [mine]);

  if (!mine) return <Loading />;

  return (
    <FlatList
      data={stats.done}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>Ganhos de hoje</Text>
            <Text style={styles.heroValue}>{money(stats.today)}</Text>
            <Text style={styles.heroSub}>{plural(stats.todayCount)}</Text>
          </View>
          <View style={styles.row}>
            <Stat label="Últimos 7 dias" value={money(stats.week)} sub={plural(stats.weekCount)} />
            <Stat label="Total" value={money(stats.total)} sub={plural(stats.done.length)} />
          </View>
          {stats.done.length > 0 && <Text style={styles.section}>Histórico</Text>}
        </View>
      }
      ListEmptyComponent={
        <EmptyState icon="wallet-outline" title="Nenhuma entrega concluída" description="Seus ganhos aparecem aqui." />
      }
      renderItem={({ item: o }) => (
        <View style={styles.item}>
          <MaterialCommunityIcons name="check-circle" size={22} color={colors.success} />
          <View style={styles.flex}>
            <Text style={styles.itemTitle}>
              {o.address.street}, {o.address.number}
            </Text>
            <Text style={styles.muted}>{dateTimeLabel(o.statusHistory.entregue ?? o.updatedAt)}</Text>
          </View>
          <Text style={styles.itemFee}>+ {money(o.courierFee ?? 5)}</Text>
        </View>
      )}
    />
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.muted}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  hero: { backgroundColor: colors.success, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', ...shadow.card },
  heroLabel: { color: '#DDF3E6', fontWeight: font.weight.medium },
  heroValue: { color: colors.textOnPrimary, fontSize: font.size.xxl, fontWeight: font.weight.black },
  heroSub: { color: '#DDF3E6' },
  row: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: 2, ...shadow.card },
  statValue: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
  section: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, marginTop: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  itemTitle: { color: colors.text, fontWeight: font.weight.medium },
  itemFee: { color: colors.success, fontWeight: font.weight.bold },
});
