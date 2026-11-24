import { Tabs } from 'expo-router/js-tabs';

import { RoleGuard } from '@/components/RoleGuard';
import { tabIcon } from '@/components/TabIcon';
import { tabScreenOptions } from '@/components/tabOptions';

export default function EntregadorLayout() {
  return (
    <RoleGuard role="entregador">
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen name="index" options={{ title: 'Entregas', tabBarIcon: tabIcon('bicycle') }} />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person') }} />
      </Tabs>
    </RoleGuard>
  );
}
