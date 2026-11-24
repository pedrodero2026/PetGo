import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, font, radius } from '@/theme';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ value, onChange, min = 0, max = 99, size = 'md' }: Props) {
  const h = size === 'sm' ? 34 : 46;
  const canDec = value > min;
  const canInc = value < max;
  return (
    <View style={[styles.box, { height: h }]}>
      <Pressable
        accessibilityLabel="Diminuir"
        hitSlop={6}
        disabled={!canDec}
        onPress={() => onChange(value - 1)}
        style={[styles.btn, { width: h }]}>
        <Ionicons name={value === 1 && min === 0 ? 'trash-outline' : 'remove'} size={18} color={canDec ? colors.primary : colors.border} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        accessibilityLabel="Aumentar"
        hitSlop={6}
        disabled={!canInc}
        onPress={() => onChange(value + 1)}
        style={[styles.btn, { width: h }]}>
        <Ionicons name="add" size={18} color={canInc ? colors.primary : colors.border} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  btn: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 22, textAlign: 'center', fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
});
