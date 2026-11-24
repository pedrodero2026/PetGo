import { router } from 'expo-router';

import { ChatList } from '@/components/ChatList';
import { useAuth } from '@/store/auth';

export default function CustomerChats() {
  const userId = useAuth((s) => s.user!.id);
  return <ChatList filter={{ customerId: userId }} as="customer" onOpen={(c) => router.push(`/cliente/chat/${c.storeId}`)} />;
}
