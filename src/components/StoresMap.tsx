import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { colors } from '@/theme';
import type { Store } from '@/types/models';
import type { LatLng } from '@/utils/geo';

export interface StoresMapProps {
  stores: Store[];
  center: LatLng;
  onSelect: (store: Store) => void;
}

/** Mapa das lojas (Android/iOS). Na web é usado StoresMap.web.tsx. */
export function StoresMap({ stores, center, onSelect }: StoresMapProps) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude: center.lat, longitude: center.lng, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
      showsUserLocation>
      <Marker coordinate={{ latitude: center.lat, longitude: center.lng }} title="Você" pinColor={colors.secondary} />
      {stores.map((s) =>
        s.address.lat !== undefined && s.address.lng !== undefined ? (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.address.lat, longitude: s.address.lng }}
            title={s.name}
            description={s.isOpen ? 'Aberta' : 'Fechada'}
            pinColor={s.isOpen ? colors.primary : colors.textMuted}
            onPress={() => onSelect(s)}
          />
        ) : null,
      )}
    </MapView>
  );
}
