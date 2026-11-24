import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, Loading } from '@/components/ui/States';
import { chatService } from '@/services';
import { colors, font, spacing } from '@/theme';
import type { Chat } from '@/types/models';
import { timeAgo } from '@/utils/format';

interface Props {
  filter: { customerId?: string; storeId?: string };
  as: 'customer' | 'store';
  onOpen: (chat: Chat) => void;
}

/** Lista de conversas (cliente vê as lojas; loja vê os clientes). */
export function ChatList({ filter, as, onOpen }: Props) {
  const [chats, setChats] = useState<Chat[] | undefined>();
  const { customerId, storeId } = filter;
  useEffect(() => chatService.subscribeChats({ customerId, storeId }, setChats), [customerId, storeId]);

  if (!chats) return <Loading />;
  return (
    <FlatList
      data={chats}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState
          icon="chat-processing-outline"
          title="Nenhuma conversa"
          description={as === 'customer' ? 'Fale com uma loja pela página dela ou pelo pedido.' : 'Quando um cliente mandar mensagem, ela aparece aqui.'}
        />
      }
      renderItem={({ item: c }) => {
        const name = as === 'customer' ? c.storeName : c.customerName;
        const unread = as === 'customer' ? c.unreadByCustomer : c.unreadByStore;
        return (
          <Pressable style={styles.row} onPress={() => onOpen(c)}>
            <View style={styles.avatar}>
              <Text style={styles.initial}>{name[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.flex}>
              <View style={styles.top}>
                <Text style={[styles.name, unread > 0 && styles.bold]} numberOfLines={1}>
                  {name}
                </Text>
                {!!c.lastAt && <Text style={styles.time}>{timeAgo(c.lastAt)}</Text>}
              </View>
              <View style={styles.top}>
                <Text style={[styles.last, unread > 0 && { color: colors.text }]} numberOfLines={1}>
                  {c.lastMessage}
                </Text>
                {unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.primary, fontWeight: font.weight.black, fontSize: font.size.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { flex: 1, fontSize: font.size.md, color: colors.text, fontWeight: font.weight.medium },
  bold: { fontWeight: font.weight.black },
  time: { fontSize: font.size.xs, color: colors.textMuted },
  last: { flex: 1, color: colors.textMuted, fontSize: font.size.sm },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: colors.textOnPrimary, fontSize: 11, fontWeight: font.weight.bold },
});
