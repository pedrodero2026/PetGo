import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, font, radius } from '@/theme';

interface Props {
  size?: 'md' | 'lg';
  /** Versão branca para fundos laranja */
  inverted?: boolean;
}

export function Logo({ size = 'md', inverted }: Props) {
  const big = size === 'lg';
  const badge = big ? 72 : 44;
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          { width: badge, height: badge, backgroundColor: inverted ? colors.surface : colors.primary },
        ]}>
        <MaterialCommunityIcons name="paw" size={badge * 0.58} color={inverted ? colors.primary : colors.surface} />
      </View>
      <Text
        style={[
          styles.text,
          { fontSize: big ? font.size.xxl + 6 : font.size.xl },
          { color: inverted ? colors.surface : colors.text },
        ]}>
        Pet<Text style={{ color: inverted ? colors.secondaryLight : colors.primary }}>Go</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: font.weight.black, letterSpacing: -0.5 },
});
