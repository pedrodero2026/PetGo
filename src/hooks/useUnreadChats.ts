import { useEffect, useState } from 'react';

import { chatService } from '@/services';

/** Total de mensagens não lidas (para o contador na aba). */
export function useUnreadChats(filter: { customerId?: string; storeId?: string }): number {
  const [count, setCount] = useState(0);
  const { customerId, storeId } = filter;
  useEffect(() => {
    if (!customerId && !storeId) return;
    return chatService.subscribeChats({ customerId, storeId }, (chats) =>
      setCount(chats.reduce((s, c) => s + (customerId ? c.unreadByCustomer : c.unreadByStore), 0)),
    );
  }, [customerId, storeId]);
  return count;
}
