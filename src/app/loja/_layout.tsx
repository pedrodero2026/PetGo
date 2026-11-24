import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/RoleGuard';
import { colors, font } from '@/theme';

export default function LojaLayout() {
  return (
    <RoleGuard role="loja">
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
        <Stack.Screen name="pedido/[id]" options={{ title: 'Pedido' }} />
        <Stack.Screen name="produto/[id]" options={{ title: 'Produto' }} />
      </Stack>
    </RoleGuard>
  );
}
