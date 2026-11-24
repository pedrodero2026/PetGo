import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/RoleGuard';
import { colors, font } from '@/theme';

export default function EntregadorLayout() {
  return (
    <RoleGuard role="entregador">
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
        <Stack.Screen name="entrega/[id]" options={{ title: 'Entrega' }} />
      </Stack>
    </RoleGuard>
  );
}
