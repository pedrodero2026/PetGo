import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { couponService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { couponLabel } from '@/utils/coupons';
import { money, toBrDate } from '@/utils/format';

export default function StoreCoupons() {
  const storeId = useAuth((s) => s.user!.storeId!);
  const { data, loading } = useAsync(() => couponService.listByStore(storeId), [storeId]);
  if (loading || !data) return <Loading />;

  return (
    <FlatList
      data={data}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState icon="ticket-percent-outline" title="Nenhum cupom" description="Crie cupons para atrair clientes e aumentar as vendas." />
      }
      ListFooterComponent={<Button title="Novo cupom" icon="add" onPress={() => router.push('/loja/cupom/novo')} style={{ marginTop: spacing.md }} />}
      renderItem={({ item: c }) => {
        const expired = !!c.expiresAt && new Date(c.expiresAt) < new Date();
        const on = c.active && !expired;
        return (
          <Pressable style={[styles.card, !on && { opacity: 0.6 }]} onPress={() => router.push(`/loja/cupom/${c.id}`)}>
            <MaterialCommunityIcons name="ticket-percent" size={32} color={on ? colors.primary : colors.textMuted} />
            <View style={styles.flex}>
              <Text style={styles.code}>{c.code}</Text>
              <Text style={styles.desc}>
                {couponLabel(c)}
                {c.minOrder ? ` · mínimo ${money(c.minOrder)}` : ''}
              </Text>
              <Text style={[styles.status, { color: on ? colors.success : colors.textMuted }]}>
                {expired ? 'Expirado' : c.active ? (c.expiresAt ? `Ativo até ${toBrDate(c.expiresAt)}` : 'Ativo') : 'Pausado'}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadow.card },
  code: { fontSize: font.size.lg, fontWeight: font.weight.black, color: colors.text, letterSpacing: 1 },
  desc: { color: colors.text, fontSize: font.size.sm },
  status: { fontSize: font.size.xs, fontWeight: font.weight.bold, marginTop: 2 },
});
