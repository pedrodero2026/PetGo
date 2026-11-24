import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, font, radius, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }: Props) {
  const v = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        v.container,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.text.color} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={20} color={v.text.color} />}
          <Text style={[styles.text, v.text]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const variants = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.textOnPrimary },
  },
  secondary: {
    container: { backgroundColor: colors.primaryLight },
    text: { color: colors.primaryDark },
  },
  outline: {
    container: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
    text: { color: colors.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  },
} as const;

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { fontSize: font.size.md, fontWeight: font.weight.bold },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
