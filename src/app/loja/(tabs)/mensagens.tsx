import { router } from 'expo-router';

import { ChatList } from '@/components/ChatList';
import { useAuth } from '@/store/auth';

export default function StoreChats() {
  const storeId = useAuth((s) => s.user!.storeId!);
  return <ChatList filter={{ storeId }} as="store" onOpen={(c) => router.push(`/loja/chat/${c.id}`)} />;
}
