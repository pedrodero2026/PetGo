import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { addressService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';

const labelIcon = (label: string): keyof typeof Ionicons.glyphMap =>
  /casa/i.test(label) ? 'home-outline' : /trab/i.test(label) ? 'briefcase-outline' : 'location-outline';

export default function Addresses() {
  const userId = useAuth((s) => s.user!.id);
  const { data, loading, reload } = useAsync(() => addressService.list(userId), [userId]);

  if (loading || !data) return <Loading />;

  async function makeDefault(id: string) {
    await addressService.setDefault(userId, id);
    reload();
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(a) => a.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState icon="map-marker-outline" title="Nenhum endereço" description="Cadastre onde você quer receber seus pedidos." />
      }
      ListFooterComponent={
        <Button
          title="Novo endereço"
          icon="add"
          onPress={() => router.push('/cliente/enderecos/novo')}
          style={{ marginTop: spacing.md }}
        />
      }
      renderItem={({ item: a }) => (
        <View style={[styles.card, a.isDefault && styles.cardDefault]}>
          <Pressable style={styles.main} onPress={() => makeDefault(a.id)} accessibilityLabel={`Usar ${a.label}`}>
            <Ionicons name={labelIcon(a.label)} size={24} color={a.isDefault ? colors.primary : colors.textMuted} />
            <View style={styles.flex}>
              <View style={styles.row}>
                <Text style={styles.label}>{a.label}</Text>
                {a.isDefault && <Text style={styles.badge}>Principal</Text>}
              </View>
              <Text style={styles.muted}>
                {a.street}, {a.number}
                {a.complement ? ` - ${a.complement}` : ''}
              </Text>
              <Text style={styles.muted}>
                {a.district}, {a.city} - {a.state} · {a.zip}
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push(`/cliente/enderecos/${a.id}`)} hitSlop={10} accessibilityLabel="Editar">
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.card,
  },
  cardDefault: { borderColor: colors.primary },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontWeight: font.weight.bold, color: colors.text, fontSize: font.size.md },
  badge: {
    fontSize: 11,
    fontWeight: font.weight.bold,
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
});
