import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAddToCart } from '@/hooks/useAddToCart';
import { colors, font, radius, spacing } from '@/theme';
import type { FoodStatus } from '@/utils/food';

/** Cartão "a ração do Thor acaba em X dias", com atalhos para pedir ou assinar. */
export function FoodReminderCard({ status: s }: { status: FoodStatus }) {
  const addToCart = useAddToCart();
  const urgent = s.daysLeft <= 3;
  const pct = Math.max(0, Math.min(1, s.daysLeft / Math.max(1, s.daysTotal)));

  async function reorder() {
    if (s.product) {
      if (await addToCart(s.product)) router.push('/cliente/carrinho');
    } else {
      router.push({ pathname: '/cliente/buscar', params: { categoria: 'racao' } });
    }
  }

  return (
    <View style={[styles.card, urgent && styles.urgent]}>
      <View style={styles.row}>
        <MaterialCommunityIcons
          name={s.pet.speciesId === 'gato' ? 'cat' : 'dog'}
          size={28}
          color={urgent ? colors.danger : colors.primary}
        />
        <View style={styles.flex}>
          <Text style={[styles.title, urgent && { color: colors.danger }]}>
            {s.daysLeft === 0
              ? `A ração de ${s.pet.name} acabou!`
              : `A ração de ${s.pet.name} acaba em ~${s.daysLeft} ${s.daysLeft === 1 ? 'dia' : 'dias'}`}
          </Text>
          <Text style={styles.sub}>
            {String(s.kg).replace('.', ',')} kg · ~{s.gramsPerDay} g por dia
            {s.source === 'pedido' ? ' · comprado no PetGo' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: urgent ? colors.danger : colors.primary }]} />
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={reorder}>
          <Text style={styles.btnText}>{s.product ? 'Pedir de novo' : 'Comprar ração'}</Text>
        </Pressable>
        {s.product && (
          <Pressable style={[styles.btn, styles.btnOutline]} onPress={() => router.push(`/cliente/assinar/${s.product!.id}`)}>
            <Text style={[styles.btnText, { color: colors.primary }]}>Assinar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  urgent: { backgroundColor: '#FBE3E0' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { fontWeight: font.weight.bold, color: colors.primaryDark, fontSize: font.size.md },
  sub: { color: colors.secondary, fontSize: font.size.xs },
  bar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 38, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { backgroundColor: colors.surface },
  btnText: { color: colors.textOnPrimary, fontWeight: font.weight.bold },
});
