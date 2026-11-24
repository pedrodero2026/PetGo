import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, font, radius } from '@/theme';
import type { LatLng } from '@/utils/geo';
import type { DeliveryMapProps } from './DeliveryMap';

/** Versão web: desenho esquemático com loja, cliente, rota e entregador. */
export function DeliveryMap({ store, customer, courier, style }: DeliveryMapProps) {
  const pts = [store, customer];
  const minLat = Math.min(...pts.map((p) => p.lat));
  const maxLat = Math.max(...pts.map((p) => p.lat));
  const minLng = Math.min(...pts.map((p) => p.lng));
  const maxLng = Math.max(...pts.map((p) => p.lng));
  const pos = (p: LatLng) => ({
    left: `${12 + ((p.lng - minLng) / (maxLng - minLng || 1)) * 76}%` as const,
    top: `${12 + ((maxLat - p.lat) / (maxLat - minLat || 1)) * 76}%` as const,
  });

  return (
    <View style={[styles.map, style]}>
      {/* Rota: pontinhos entre loja e cliente */}
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        return (
          <View
            key={i}
            style={[styles.dot, pos({ lat: store.lat + (customer.lat - store.lat) * t, lng: store.lng + (customer.lng - store.lng) * t })]}
          />
        );
      })}
      <Pin at={pos(store)} icon="storefront" color={colors.secondary} label="Loja" />
      <Pin at={pos(customer)} icon="home" color={colors.success} label="Entrega" />
      {courier && <Pin at={pos(courier)} icon="moped" color={colors.primary} />}
    </View>
  );
}

function Pin({ at, icon, color, label }: { at: object; icon: string; color: string; label?: string }) {
  return (
    <View style={[styles.pin, at]}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon as never} size={18} color="#fff" />
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: 260, backgroundColor: '#EEF3E8', borderRadius: radius.lg, overflow: 'hidden' },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, opacity: 0.5, marginLeft: -3, marginTop: -3 },
  pin: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -17 }, { translateY: -17 }] },
  badge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  label: { fontSize: font.size.xs, fontWeight: font.weight.bold, color: colors.text, marginTop: 2 },
});
