import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { colors, font, radius, spacing } from '@/theme';

const highlights = [
  { icon: 'moped', text: 'Ração e acessórios entregues rapidinho' },
  { icon: 'refresh-circle', text: 'Recompra automática: a ração nunca acaba' },
  { icon: 'heart-circle', text: 'Recomendações para cada pet' },
] as const;

export default function Welcome() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <Logo size="lg" inverted />
        <Text style={styles.tagline}>Tudo pro seu pet,{'\n'}na porta de casa.</Text>
        <View style={styles.pets}>
          <MaterialCommunityIcons name="dog" size={88} color={colors.surface} />
          <MaterialCommunityIcons name="cat" size={72} color={colors.secondaryLight} />
        </View>
      </View>

      <View style={styles.sheet}>
        {highlights.map((h) => (
          <View key={h.icon} style={styles.highlight}>
            <MaterialCommunityIcons name={h.icon} size={26} color={colors.primary} />
            <Text style={styles.highlightText}>{h.text}</Text>
          </View>
        ))}
        <View style={styles.actions}>
          <Button title="Entrar" onPress={() => router.push('/login')} />
          <Button title="Criar conta" variant="secondary" onPress={() => router.push('/register')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.lg },
  tagline: {
    color: colors.surface,
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    textAlign: 'center',
    lineHeight: 34,
  },
  pets: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg + 8,
    borderTopRightRadius: radius.lg + 8,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  highlightText: { flex: 1, fontSize: font.size.md, color: colors.text },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
