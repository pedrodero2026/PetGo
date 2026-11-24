import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/States';
import { chatService } from '@/services';
import { colors, font, noWebOutline, radius, spacing } from '@/theme';
import type { ChatMessage } from '@/types/models';

const hour = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Conversa em tempo real, usada pelo cliente e pela loja. */
export function ChatView({ chatId, myId, as }: { chatId: string; myId: string; as: 'customer' | 'store' }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const list = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => chatService.subscribeMessages(chatId, setMessages), [chatId]);
  // Ao abrir e a cada mensagem nova, marca como lida
  useEffect(() => {
    chatService.markRead(chatId, as);
  }, [chatId, as, messages.length]);

  async function send() {
    const t = text.trim();
    if (!t) return;
    setText('');
    await chatService.send(chatId, myId, t);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={list}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <EmptyState
            icon="chat-outline"
            title="Comece a conversa"
            description={as === 'customer' ? 'Tire dúvidas sobre produtos, pedidos ou entregas.' : 'Responda o cliente por aqui.'}
          />
        }
        renderItem={({ item: m }) => {
          const mine = m.senderId === myId;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.text, mine && { color: colors.textOnPrimary }]}>{m.text}</Text>
              <Text style={[styles.time, mine && { color: colors.primaryLight }]}>{hour(m.createdAt)}</Text>
            </View>
          );
        }}
      />
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escreva uma mensagem"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onSubmitEditing={send}
          returnKeyType="send"
          multiline
        />
        <Pressable onPress={send} style={[styles.send, !text.trim() && { opacity: 0.5 }]} accessibilityLabel="Enviar" disabled={!text.trim()}>
          <Ionicons name="send" size={20} color={colors.textOnPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  bubble: { maxWidth: '80%', padding: spacing.sm + 2, borderRadius: radius.lg, gap: 2 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  text: { color: colors.text, fontSize: font.size.md, lineHeight: 21 },
  time: { fontSize: 10, color: colors.textMuted, alignSelf: 'flex-end' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: font.size.md,
    color: colors.text,
    ...noWebOutline,
  },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
