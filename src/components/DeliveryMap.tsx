import { StyleSheet, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { colors } from '@/theme';
import type { LatLng } from '@/utils/geo';

export interface DeliveryMapProps {
  store: LatLng;
  customer: LatLng;
  courier?: LatLng;
  style?: ViewStyle;
}

const toCoord = (p: LatLng) => ({ latitude: p.lat, longitude: p.lng });

/** Mapa da entrega: loja, cliente, rota e entregador (Android/iOS). */
export function DeliveryMap({ store, customer, courier, style }: DeliveryMapProps) {
  const points = [store, customer, ...(courier ? [courier] : [])];
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const region = {
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    latitudeDelta: Math.max(0.01, (Math.max(...lats) - Math.min(...lats)) * 1.8),
    longitudeDelta: Math.max(0.01, (Math.max(...lngs) - Math.min(...lngs)) * 1.8),
  };

  return (
    <MapView style={[styles.map, style]} initialRegion={region}>
      <Polyline coordinates={[toCoord(store), toCoord(customer)]} strokeColor={colors.primary} strokeWidth={4} lineDashPattern={[8, 6]} />
      <Marker coordinate={toCoord(store)} title="Loja" pinColor={colors.secondary} />
      <Marker coordinate={toCoord(customer)} title="Entrega" pinColor={colors.success} />
      {courier && <Marker coordinate={toCoord(courier)} title="Entregador" pinColor={colors.primary} />}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { width: '100%', height: 260 } });
