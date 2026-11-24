import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { StoreAvatar } from '@/components/StoreCard';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Stars } from '@/components/ui/Stars';
import { EmptyState, Loading } from '@/components/ui/States';
import { TextField } from '@/components/ui/TextField';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, orderService, reviewService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, spacing } from '@/theme';
import { notify } from '@/utils/confirm';

const labels = ['', 'Muito ruim', 'Ruim', 'Ok', 'Bom', 'Excelente!'];

/** "Ana Cliente" -> "Ana C." (privacidade nas avaliações públicas). */
function shortName(name: string) {
  const [first, last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
}

export default function RateOrder() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const user = useAuth((s) => s.user!);
  const { data, loading } = useAsync(async () => {
    const order = await orderService.get(orderId);
    if (!order) return null;
    const [store, existing] = await Promise.all([catalogService.getStore(order.storeId), reviewService.getByOrder(orderId)]);
    return { order, store, existing };
  }, [orderId]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);

  if (loading) return <Loading />;
  if (!data || !data.store) return <EmptyState icon="star-off-outline" title="Pedido não encontrado" />;
  if (data.existing) {
    return (
      <EmptyState
        icon="star-check-outline"
        title="Pedido já avaliado"
        description={`Você deu ${data.existing.rating} estrela(s). Obrigado!`}
        action={<Button title="Voltar" onPress={() => router.back()} />}
      />
    );
  }
  const { order, store } = data;

  async function send() {
    if (!rating) return notify('Escolha de 1 a 5 estrelas para a loja');
    setSending(true);
    try {
      await reviewService.create({
        orderId: order.id,
        authorId: user.id,
        authorName: shortName(user.name),
        storeId: order.storeId,
        storeRating: rating,
        comment: comment.trim() || undefined,
        productRatings: Object.entries(productRatings).map(([productId, r]) => ({ productId, rating: r })),
      });
      notify('Obrigado pela avaliação! ⭐');
      router.back();
    } catch (e) {
      notify('Não foi possível enviar', e instanceof Error ? e.message : undefined);
      setSending(false);
    }
  }

  return (
    <Screen scroll edges={['bottom']}>
      <View style={styles.header}>
        <StoreAvatar store={store} size={64} />
        <Text style={styles.title}>Como foi seu pedido na {store.name}?</Text>
        <Stars value={rating} onChange={setRating} size={42} />
        <Text style={styles.label}>{labels[rating]}</Text>
      </View>

      <TextField
        label="Conte mais (opcional)"
        placeholder="Entrega, atendimento, embalagem..."
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <Text style={styles.section}>Avalie os produtos (opcional)</Text>
      {order.items.map((i) => (
        <View key={i.productId} style={styles.product}>
          <Text style={styles.productName} numberOfLines={2}>
            {i.name}
          </Text>
          <Stars
            value={productRatings[i.productId] ?? 0}
            onChange={(v) => setProductRatings((cur) => ({ ...cur, [i.productId]: v }))}
            size={24}
          />
        </View>
      ))}

      <Button title="Enviar avaliação" onPress={send} loading={sending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  title: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, textAlign: 'center' },
  label: { color: colors.textMuted, minHeight: 20 },
  section: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text, marginTop: spacing.sm },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  productName: { flex: 1, color: colors.text, fontSize: font.size.sm },
});
