import { StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme';

interface Props {
  label: string;
  value: string;
  bold?: boolean;
  /** Valor em verde (ex.: entrega grátis, desconto) */
  highlight?: boolean;
}

/** Linha "rótulo ........ valor" dos resumos de pedido. */
export function SummaryRow({ label, value, bold, highlight }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, bold && styles.bold]} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.value, bold && styles.bold, highlight && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { color: colors.textMuted, flex: 1 },
  value: { color: colors.text },
  bold: { fontWeight: font.weight.bold, color: colors.text, fontSize: font.size.md },
});
