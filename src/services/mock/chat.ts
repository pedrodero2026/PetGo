import type { Chat, ChatMessage } from '@/types/models';
import { ServiceError, type ChatService } from '../types';
import { collection } from './collection';

const chatsDb = collection<Chat>('chats', []);
const messagesDb = collection<ChatMessage>('messages', []);

const byRecent = (list: Chat[]) => [...list].sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));

export const mockChatService: ChatService = {
  async open(customer, store) {
    const id = `${customer.id}_${store.id}`;
    const existing = await chatsDb.get(id);
    if (existing) return existing;
    return chatsDb.upsert({
      id,
      customerId: customer.id,
      customerName: customer.name,
      storeId: store.id,
      storeName: store.name,
      unreadByCustomer: 0,
      unreadByStore: 0,
    });
  },

  get: (chatId) => chatsDb.get(chatId),

  subscribeChats({ customerId, storeId }, onChange) {
    let active = true;
    const pick = (all: Chat[]) =>
      byRecent(all.filter((c) => c.lastAt && (!customerId || c.customerId === customerId) && (!storeId || c.storeId === storeId)));
    chatsDb.all().then((all) => active && onChange(pick(all)));
    const off = chatsDb.onChange((all) => onChange(pick(all)));
    return () => {
      active = false;
      off();
    };
  },

  subscribeMessages(chatId, onChange) {
    let active = true;
    const pick = (all: ChatMessage[]) =>
      all.filter((m) => m.chatId === chatId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    messagesDb.all().then((all) => active && onChange(pick(all)));
    const off = messagesDb.onChange((all) => onChange(pick(all)));
    return () => {
      active = false;
      off();
    };
  },

  async send(chatId, senderId, text) {
    const chat = await chatsDb.get(chatId);
    if (!chat) throw new ServiceError('Conversa não encontrada.');
    const now = new Date().toISOString();
    await messagesDb.upsert({ chatId, senderId, text: text.trim(), createdAt: now }, 'msg');
    const fromCustomer = senderId === chat.customerId;
    await chatsDb.update(chatId, {
      lastMessage: text.trim(),
      lastAt: now,
      unreadByStore: chat.unreadByStore + (fromCustomer ? 1 : 0),
      unreadByCustomer: chat.unreadByCustomer + (fromCustomer ? 0 : 1),
    });
  },

  async markRead(chatId, by) {
    const chat = await chatsDb.get(chatId);
    if (!chat) return;
    if (by === 'customer' && chat.unreadByCustomer) await chatsDb.update(chatId, { unreadByCustomer: 0 });
    if (by === 'store' && chat.unreadByStore) await chatsDb.update(chatId, { unreadByStore: 0 });
  },
};
