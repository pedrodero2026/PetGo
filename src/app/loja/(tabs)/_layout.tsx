import { Tabs } from 'expo-router/js-tabs';

import { tabIcon } from '@/components/TabIcon';
import { tabScreenOptions } from '@/components/tabOptions';
import { useStoreOrders } from '@/hooks/useStoreOrders';
import { useUnreadChats } from '@/hooks/useUnreadChats';
import { useAuth } from '@/store/auth';
import { colors } from '@/theme';

export default function LojaTabsLayout() {
  const storeId = useAuth((s) => s.user?.storeId);
  const orders = useStoreOrders(storeId);
  // Número de pedidos novos aguardando a loja aparece na aba
  const pending = orders?.filter((o) => o.status === 'aguardando').length ?? 0;
  const unread = useUnreadChats({ storeId });

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pedidos',
          tabBarIcon: tabIcon('receipt'),
          tabBarBadge: pending > 0 ? pending : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen name="produtos" options={{ title: 'Produtos', tabBarIcon: tabIcon('cube') }} />
      <Tabs.Screen
        name="mensagens"
        options={{
          title: 'Mensagens',
          tabBarIcon: tabIcon('chatbubbles'),
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen name="minha-loja" options={{ title: 'Minha loja', tabBarIcon: tabIcon('storefront') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
