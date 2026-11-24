import { Redirect, Stack } from 'expo-router';

import { homeByRole, useAuth } from '@/store/auth';
import { colors, font } from '@/theme';

export default function AuthLayout() {
  const user = useAuth((s) => s.user);
  // Já logado: vai direto para a área do perfil
  if (user) return <Redirect href={homeByRole[user.role]} />;

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: font.weight.bold },
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Entrar' }} />
      <Stack.Screen name="register" options={{ title: 'Criar conta' }} />
    </Stack>
  );
}
