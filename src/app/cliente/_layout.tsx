import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/RoleGuard';
import { colors, font } from '@/theme';

export default function ClienteLayout() {
  return (
    <RoleGuard role="cliente">
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: font.weight.bold },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="loja/[id]" options={{ title: '' }} />
        <Stack.Screen name="produto/[id]" options={{ title: '' }} />
        <Stack.Screen name="carrinho" options={{ title: 'Sacola' }} />
        <Stack.Screen name="checkout" options={{ title: 'Finalizar pedido' }} />
        <Stack.Screen name="pedido/[id]" options={{ title: 'Pedido' }} />
        <Stack.Screen name="mapa" options={{ title: 'Lojas no mapa' }} />
        <Stack.Screen name="pets/index" options={{ title: 'Meus pets' }} />
        <Stack.Screen name="pets/[id]" options={{ title: 'Pet' }} />
        <Stack.Screen name="enderecos/index" options={{ title: 'Endereços' }} />
        <Stack.Screen name="enderecos/[id]" options={{ title: 'Endereço' }} />
        <Stack.Screen name="favoritos" options={{ title: 'Favoritos' }} />
        <Stack.Screen name="conversas" options={{ title: 'Conversas' }} />
        <Stack.Screen name="chat/[storeId]" options={{ title: 'Conversa' }} />
        <Stack.Screen name="avaliar/[orderId]" options={{ title: 'Avaliar pedido' }} />
        <Stack.Screen name="assinar/[productId]" options={{ title: 'Assinar e receber sempre' }} />
        <Stack.Screen name="assinaturas" options={{ title: 'Assinaturas' }} />
      </Stack>
    </RoleGuard>
  );
}
