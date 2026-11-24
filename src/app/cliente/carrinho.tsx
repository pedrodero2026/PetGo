import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductImage } from '@/components/ProductImage';
import { StoreAvatar } from '@/components/StoreCard';
import { Button } from '@/components/ui/Button';
import { SummaryRow as Row } from '@/components/ui/SummaryRow';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EmptyState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { catalogService } from '@/services';
import { cartSubtotal, useCart } from '@/store/cart';
import { colors, font, radius, spacing } from '@/theme';
import { confirm } from '@/utils/confirm';
import { money } from '@/utils/format';

export default function Cart() {
  const { items, storeId, setQuantity, clear } = useCart();
  const insets = useSafeAreaInsets();
  const { data: store } = useAsync(
    () => (storeId ? catalogService.getStore(storeId) : Promise.resolve(null)),
    [storeId],
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon="shopping-outline"
        title="Sua sacola está vazia"
        description="Que tal escolher uma ração gostosa para o seu pet?"
        action={<Button title="Explorar produtos" onPress={() => router.replace('/cliente/buscar')} />}
      />
    );
  }

  const subtotal = cartSubtotal(items);
  const fee = store?.deliveryFee ?? 0;
  const missing = store ? Math.max(0, store.minOrder - subtotal) : 0;

  async function askClear() {
    if (await confirm('Limpar sacola', 'Remover todos os itens da sacola?', 'Limpar')) clear();
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {store && (
          <Pressable style={styles.store} onPress={() => router.push(`/cliente/loja/${store.id}`)}>
            <StoreAvatar store={store} size={44} />
            <View style={styles.flex}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.link}>Adicionar mais itens</Text>
            </View>
            <Pressable onPress={askClear} hitSlop={8}>
              <Text style={styles.clear}>Limpar</Text>
            </Pressable>
          </Pressable>
        )}

        {items.map((i) => (
          <View key={i.productId} style={styles.item}>
            <ProductImage categoryId={i.categoryId} imageUrl={i.imageUrl} size={64} />
            <View style={styles.flex}>
              <Text style={styles.itemName} numberOfLines={2}>
                {i.name}
              </Text>
              <Text style={styles.itemPrice}>{money(i.unitPrice * i.quantity)}</Text>
            </View>
            <QuantityStepper
              size="sm"
              value={i.quantity}
              max={i.maxQuantity}
              onChange={(q) => setQuantity(i.productId, q)}
            />
          </View>
        ))}

        <View style={styles.summary}>
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="Taxa de entrega" value={fee === 0 ? 'Grátis' : money(fee)} highlight={fee === 0} />
          <View style={styles.divider} />
          <Row label="Total" value={money(subtotal + fee)} bold />
        </View>

        {missing > 0 && (
          <Text style={styles.warning}>
            Faltam {money(missing)} para o pedido mínimo da loja ({money(store!.minOrder)}).
          </Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          title="Continuar"
          disabled={missing > 0 || !store?.isOpen}
          onPress={() => router.push('/cliente/checkout')}
        />
        {store && !store.isOpen && <Text style={styles.warning}>A loja está fechada no momento.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  store: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  storeName: { fontWeight: font.weight.bold, fontSize: font.size.md, color: colors.text },
  link: { color: colors.primary, fontSize: font.size.sm, fontWeight: font.weight.medium },
  clear: { color: colors.danger, fontWeight: font.weight.bold },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  itemName: { color: colors.text, fontSize: font.size.sm },
  itemPrice: { color: colors.text, fontWeight: font.weight.bold, marginTop: 4 },
  summary: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border },
  warning: { color: colors.danger, fontSize: font.size.sm, textAlign: 'center' },
  footer: { padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
});
