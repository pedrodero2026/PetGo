import { Redirect } from 'expo-router';

import { homeByRole, useAuth } from '@/store/auth';

/** Decide para onde ir ao abrir o app. */
export default function Index() {
  const user = useAuth((s) => s.user);
  return <Redirect href={user ? homeByRole[user.role] : '/welcome'} />;
}
