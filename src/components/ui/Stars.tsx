import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme';

/** Estrelas de 1 a 5. Com `onChange` vira seletor; sem, só exibe. */
export function Stars({ value, onChange, size = 36 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange?.(n)} disabled={!onChange} hitSlop={4} accessibilityLabel={`${n} estrelas`}>
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={size} color={colors.warning} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ stars: { flexDirection: 'row', gap: 4 } });
