import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, font, radius, spacing } from '@/theme';
import type { StoresMapProps } from './StoresMap';

/**
 * react-native-maps não funciona no navegador. Aqui desenhamos um "mapa"
 * esquemático com as lojas posicionadas pela coordenada, só para a versão web.
 */
export function StoresMap({ stores, center, onSelect }: StoresMapProps) {
  const span = 0.03; // ~3 km para cada lado
  const pos = (lat: number, lng: number) => ({
    left: `${50 + ((lng - center.lng) / span) * 45}%` as const,
    top: `${50 - ((lat - center.lat) / span) * 45}%` as const,
  });

  return (
    <View style={styles.map}>
      <View style={[styles.grid, { top: '50%', left: 0, right: 0, height: 1 }]} />
      <View style={[styles.grid, { left: '50%', top: 0, bottom: 0, width: 1 }]} />
      <View style={[styles.pin, pos(center.lat, center.lng)]}>
        <MaterialCommunityIcons name="home-circle" size={34} color={colors.secondary} />
      </View>
      {stores.map((s) =>
        s.address.lat !== undefined && s.address.lng !== undefined ? (
          <Pressable key={s.id} onPress={() => onSelect(s)} style={[styles.pin, pos(s.address.lat, s.address.lng)]}>
            <MaterialCommunityIcons name="map-marker" size={40} color={s.isOpen ? colors.primary : colors.textMuted} />
            <Text style={styles.label} numberOfLines={1}>
              {s.name}
            </Text>
          </Pressable>
        ) : null,
      )}
      <Text style={styles.note}>Mapa simplificado (versão web)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#EEF3E8', overflow: 'hidden' },
  grid: { position: 'absolute', backgroundColor: '#D9E3CF' },
  pin: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -20 }, { translateY: -40 }] },
  label: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.text,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    maxWidth: 120,
  },
  note: { position: 'absolute', top: spacing.sm, alignSelf: 'center', fontSize: font.size.xs, color: colors.textMuted },
});
