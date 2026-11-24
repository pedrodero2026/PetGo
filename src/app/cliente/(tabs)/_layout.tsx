import { Tabs } from 'expo-router/js-tabs';

import { tabIcon } from '@/components/TabIcon';
import { tabScreenOptions } from '@/components/tabOptions';

export default function ClienteTabsLayout() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="index" options={{ title: 'Início', headerShown: false, tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="buscar" options={{ title: 'Buscar', tabBarIcon: tabIcon('search') }} />
      <Tabs.Screen name="pedidos" options={{ title: 'Pedidos', tabBarIcon: tabIcon('receipt') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
