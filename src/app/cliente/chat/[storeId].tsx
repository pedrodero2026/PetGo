import { Stack, useLocalSearchParams } from 'expo-router';

import { ChatView } from '@/components/ChatView';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, chatService } from '@/services';
import { useAuth } from '@/store/auth';

/** Conversa do cliente com uma loja (cria a conversa na primeira vez). */
export default function CustomerChat() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const user = useAuth((s) => s.user!);
  const { data: chat, loading } = useAsync(async () => {
    const store = await catalogService.getStore(storeId);
    if (!store) return null;
    return chatService.open({ id: user.id, name: user.name }, { id: store.id, name: store.name });
  }, [storeId, user.id]);

  if (loading) return <Loading />;
  if (!chat) return <EmptyState icon="store-off-outline" title="Loja não encontrada" />;
  return (
    <>
      <Stack.Screen options={{ title: chat.storeName }} />
      <ChatView chatId={chat.id} myId={user.id} as="customer" />
    </>
  );
}
