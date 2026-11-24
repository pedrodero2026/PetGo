import { Tabs } from 'expo-router/js-tabs';

import { RoleGuard } from '@/components/RoleGuard';
import { tabIcon } from '@/components/TabIcon';
import { tabScreenOptions } from '@/components/tabOptions';

export default function LojaLayout() {
  return (
    <RoleGuard role="loja">
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen name="index" options={{ title: 'Pedidos', tabBarIcon: tabIcon('receipt') }} />
        <Tabs.Screen name="produtos" options={{ title: 'Produtos', tabBarIcon: tabIcon('cube') }} />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person') }} />
      </Tabs>
    </RoleGuard>
  );
}
