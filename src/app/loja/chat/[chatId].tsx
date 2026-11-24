import { Stack, useLocalSearchParams } from 'expo-router';

import { ChatView } from '@/components/ChatView';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { chatService } from '@/services';
import { useAuth } from '@/store/auth';

/** Conversa da loja com um cliente. As mensagens da loja usam o id da loja como remetente. */
export default function StoreChat() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const storeId = useAuth((s) => s.user!.storeId!);
  const { data: chat, loading } = useAsync(() => chatService.get(chatId), [chatId]);

  if (loading) return <Loading />;
  if (!chat || chat.storeId !== storeId) return <EmptyState icon="chat-remove-outline" title="Conversa não encontrada" />;
  return (
    <>
      <Stack.Screen options={{ title: chat.customerName }} />
      <ChatView chatId={chat.id} myId={storeId} as="store" />
    </>
  );
}
