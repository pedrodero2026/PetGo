import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, font, noWebOutline, radius, spacing } from '@/theme';

interface Props extends TextInputProps {
  label: string;
  /** Texto de ajuda abaixo do campo */
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  /** Mostra o botão de exibir/ocultar senha */
  password?: boolean;
}

export function TextField({ label, icon, error, hint, password, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && { borderColor: colors.primary },
          !!error && { borderColor: colors.danger },
        ]}>
        {icon && <Ionicons name={icon} size={20} color={colors.textMuted} />}
        <TextInput
          placeholderTextColor={colors.textMuted}
          secureTextEntry={password && hidden}
          autoCapitalize={password ? 'none' : rest.autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, style]}
          {...rest}
        />
        {password && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : !!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.text },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  // Na web o navegador desenha um contorno no foco; a borda laranja já indica o foco
  input: { flex: 1, fontSize: font.size.md, color: colors.text, height: '100%', ...noWebOutline },
  error: { fontSize: font.size.xs, color: colors.danger },
  hint: { fontSize: font.size.xs, color: colors.textMuted },
});
