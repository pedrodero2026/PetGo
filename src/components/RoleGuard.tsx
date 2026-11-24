import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';

import { homeByRole, useAuth } from '@/store/auth';
import type { Role } from '@/types/models';

/** Garante que só o perfil certo acessa uma área do app. */
export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Redirect href="/welcome" />;
  if (user.role !== role) return <Redirect href={homeByRole[user.role]} />;
  return children;
}
