import { useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { StoreAvatar } from '@/components/StoreCard';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { useReorder } from '@/hooks/useReorder';
import { catalogService, orderService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { dateTimeLabel, money } from '@/utils/format';
import { isActive, statusInfo } from '@/utils/orders';

export default function Orders() {
  const userId = useAuth((s) => s.user!.id);
  const reorder = useReorder();
  const { data, loading } = useAsync(async () => {
    const [orders, stores] = await Promise.all([orderService.listByCustomer(userId), catalogService.listStores()]);
    return { orders, stores };
  }, [userId]);

  const sections = useMemo(() => {
    const orders = data?.orders ?? [];
    return [
      { title: 'Em andamento', data: orders.filter((o) => isActive(o.status)) },
      { title: 'Histórico', data: orders.filter((o) => !isActive(o.status)) },
    ].filter((s) => s.data.length > 0);
  }, [data?.orders]);

  if (loading) return <Loading />;
  if (sections.length === 0) {
    return (
      <EmptyState
        icon="receipt-text-outline"
        title="Nenhum pedido ainda"
        description="Quando você fizer um pedido, ele aparece aqui."
        action={<Button title="Começar a comprar" onPress={() => router.navigate('/cliente')} />}
      />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
      renderItem={({ item: o }) => {
        const store = data!.stores.find((s) => s.id === o.storeId);
        const info = statusInfo[o.status];
        const itemsCount = o.items.reduce((s, i) => s + i.quantity, 0);
        return (
          <Pressable style={styles.card} onPress={() => router.push(`/cliente/pedido/${o.id}`)}>
            <View style={styles.row}>
              {store && <StoreAvatar store={store} size={40} />}
              <View style={styles.flex}>
                <Text style={styles.store}>{store?.name ?? 'Loja'}</Text>
                <Text style={styles.muted}>{dateTimeLabel(o.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <MaterialCommunityIcons
                name={info.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={18}
                color={info.color}
              />
              <Text style={[styles.status, { color: info.color }]}>{info.label}</Text>
            </View>
            <Text style={styles.muted} numberOfLines={1}>
              {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.total}>
                {money(o.total)} · {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
              </Text>
              {!isActive(o.status) && (
                <Pressable onPress={() => reorder(o)} hitSlop={8}>
                  <Text style={styles.link}>Pedir de novo</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md },
  section: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  store: { fontWeight: font.weight.bold, color: colors.text },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
  status: { fontWeight: font.weight.bold, fontSize: font.size.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontWeight: font.weight.bold, color: colors.text },
  link: { color: colors.primary, fontWeight: font.weight.bold },
});
