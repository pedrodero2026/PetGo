import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, font, spacing } from '@/theme';

interface Props {
  title: string;
  description: string;
  phase: number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

/** Placeholder das telas que serão construídas nas próximas fases. */
export function ComingSoon({ title, description, phase, icon = 'paw' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <MaterialCommunityIcons name={icon} size={48} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      <Text style={styles.tag}>Em construção · Fase {phase}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  circle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, textAlign: 'center' },
  desc: { fontSize: font.size.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  tag: {
    marginTop: spacing.sm,
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
