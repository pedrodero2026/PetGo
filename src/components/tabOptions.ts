import { colors, font } from '@/theme';

/** Estilo comum das barras de abas dos três perfis. */
export const tabScreenOptions = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingTop: 6 },
  tabBarLabelStyle: { fontSize: font.size.xs, fontWeight: font.weight.medium },
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTitleStyle: { color: colors.text, fontWeight: font.weight.bold },
  sceneStyle: { backgroundColor: colors.background },
} as const;
