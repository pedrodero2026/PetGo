import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StoreCard } from '@/components/StoreCard';
import { StoresMap } from '@/components/StoresMap';
import { Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { useCustomerLocation } from '@/hooks/useCustomerLocation';
import { catalogService } from '@/services';
import { colors, radius, shadow, spacing } from '@/theme';
import type { Store } from '@/types/models';
import { distanceKm } from '@/utils/geo';

export default function StoresMapScreen() {
  const { location, loading: locLoading } = useCustomerLocation();
  const { data: stores, loading } = useAsync(() => catalogService.listStores(), []);
  const [selected, setSelected] = useState<Store | undefined>();

  if (loading || locLoading || !stores) return <Loading />;

  return (
    <View style={styles.flex}>
      <StoresMap stores={stores} center={location} onSelect={setSelected} />
      {selected && (
        <View style={styles.card}>
          <StoreCard
            store={selected}
            distanceKm={distanceKm(location, { lat: selected.address.lat!, lng: selected.address.lng! })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
});
