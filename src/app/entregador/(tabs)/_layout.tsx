import { Tabs } from 'expo-router/js-tabs';

import { tabIcon } from '@/components/TabIcon';
import { tabScreenOptions } from '@/components/tabOptions';
import { useAvailableDeliveries } from '@/hooks/useCourierOrders';
import { colors } from '@/theme';

export default function EntregadorTabsLayout() {
  const available = useAvailableDeliveries();
  const n = available?.length ?? 0;
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Entregas',
          tabBarIcon: tabIcon('bicycle'),
          tabBarBadge: n > 0 ? n : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen name="ganhos" options={{ title: 'Ganhos', tabBarIcon: tabIcon('wallet') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
