import { useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ProductImage } from '@/components/ProductImage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, petService, subscriptionService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Subscription } from '@/types/models';
import { confirm, notify } from '@/utils/confirm';
import { toBrDate } from '@/utils/format';

export default function Subscriptions() {
  const user = useAuth((s) => s.user!);
  const { data, loading, reload } = useAsync(async () => {
    const [subs, stores, pets] = await Promise.all([
      subscriptionService.list(user.id),
      catalogService.listStores(),
      petService.list(user.id),
    ]);
    return { subs, stores, pets };
  }, [user.id]);
  const [busy, setBusy] = useState<string | undefined>();

  if (loading || !data) return <Loading />;

  async function update(sub: Subscription, patch: Partial<Subscription>) {
    await subscriptionService.save({ ...sub, ...patch });
    reload();
  }

  async function orderNow(sub: Subscription) {
    setBusy(sub.id);
    try {
      const order = await subscriptionService.orderNow(sub.id, user);
      router.push(`/cliente/pedido/${order.id}`);
    } catch (e) {
      notify('Não foi possível pedir', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(undefined);
      reload();
    }
  }

  async function cancel(sub: Subscription) {
    if (await confirm('Cancelar assinatura', `Parar de receber "${sub.productName}"?`, 'Cancelar assinatura')) {
      await subscriptionService.remove(sub.id);
      reload();
    }
  }

  return (
    <FlatList
      data={data.subs}
      keyExtractor={(s) => s.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        data.subs.length > 0 ? (
          <Text style={styles.intro}>Os pedidos são feitos automaticamente na data de cada entrega.</Text>
        ) : undefined
      }
      ListEmptyComponent={
        <EmptyState
          icon="refresh-circle"
          title="Nenhuma assinatura"
          description="Assine a ração do seu pet na página do produto e ela chega sozinha, no intervalo que você escolher."
          action={<Button title="Ver rações" onPress={() => router.push({ pathname: '/cliente/buscar', params: { categoria: 'racao' } })} />}
        />
      }
      renderItem={({ item: s }) => {
        const store = data.stores.find((x) => x.id === s.storeId);
        const pet = data.pets.find((p) => p.id === s.petId);
        return (
          <View style={[styles.card, !s.active && { opacity: 0.7 }]}>
            <View style={styles.row}>
              <ProductImage categoryId={s.categoryId} size={56} />
              <View style={styles.flex}>
                <Text style={styles.name} numberOfLines={2}>
                  {s.quantity}x {s.productName}
                </Text>
                <Text style={styles.muted}>
                  {store?.name}
                  {pet ? ` · para ${pet.name}` : ''}
                </Text>
              </View>
              <Switch
                value={s.active}
                onValueChange={(v) => update(s, { active: v })}
                trackColor={{ true: colors.success, false: colors.border }}
                thumbColor={colors.surface}
                accessibilityLabel="Assinatura ativa"
              />
            </View>
            <Text style={[styles.next, !s.active && { color: colors.textMuted }]}>
              {s.active ? `Próxima entrega: ${toBrDate(s.nextDeliveryDate)}` : 'Pausada'}
            </Text>
            <View style={styles.chips}>
              {[15, 30, 45, 60].map((d) => (
                <Chip key={d} label={`${d} dias`} selected={s.intervalDays === d} onPress={() => update(s, { intervalDays: d })} />
              ))}
            </View>
            <View style={styles.actions}>
              <Button title="Cancelar" variant="ghost" onPress={() => cancel(s)} style={styles.flex} />
              <Button title="Pedir agora" variant="secondary" onPress={() => orderNow(s)} loading={busy === s.id} style={styles.flex} />
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  intro: { color: colors.textMuted, fontSize: font.size.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { color: colors.text, fontWeight: font.weight.bold, fontSize: font.size.sm },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
  next: { color: colors.success, fontWeight: font.weight.bold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
