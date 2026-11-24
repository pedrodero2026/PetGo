import { Tabs } from 'expo-router/js-tabs';

import { RoleGuard } from '@/components/RoleGuard';
import { tabIcon } from '@/components/TabIcon';
import { tabScreenOptions } from '@/components/tabOptions';

export default function ClienteLayout() {
  return (
    <RoleGuard role="cliente">
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: tabIcon('home') }} />
        <Tabs.Screen name="buscar" options={{ title: 'Buscar', tabBarIcon: tabIcon('search') }} />
        <Tabs.Screen name="pedidos" options={{ title: 'Pedidos', tabBarIcon: tabIcon('receipt') }} />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person') }} />
      </Tabs>
    </RoleGuard>
  );
}
