import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProductImage } from '@/components/ProductImage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Screen } from '@/components/ui/Screen';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { addressService, catalogService, petService, subscriptionService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Address, Pet, Product, Store, Subscription } from '@/types/models';
import { notify } from '@/utils/confirm';
import { dailyGrams, suggestedInterval } from '@/utils/food';
import { money } from '@/utils/format';
import { productFitsPet } from '@/utils/pets';
import { finalPrice } from '@/utils/products';

const intervals = [15, 30, 45, 60];

export default function SubscribeScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const userId = useAuth((s) => s.user!.id);
  const { data, loading } = useAsync(async () => {
    const product = await catalogService.getProduct(productId);
    if (!product) return null;
    const [store, pets, addresses] = await Promise.all([
      catalogService.getStore(product.storeId),
      petService.list(userId),
      addressService.list(userId),
    ]);
    return { product, store, pets, addresses };
  }, [productId, userId]);

  if (loading) return <Loading />;
  if (!data?.store) return <EmptyState icon="package-variant-remove" title="Produto não encontrado" />;
  if (data.addresses.length === 0) {
    return (
      <EmptyState
        icon="map-marker-outline"
        title="Cadastre um endereço"
        description="A assinatura precisa de um endereço para as entregas."
        action={<Button title="Cadastrar endereço" onPress={() => router.push('/cliente/enderecos/novo')} />}
      />
    );
  }
  return <SubscribeForm {...data} store={data.store} />;
}

function SubscribeForm({ product, store, pets, addresses }: { product: Product; store: Store; pets: Pet[]; addresses: Address[] }) {
  const user = useAuth((s) => s.user!);
  const fitPets = pets.filter((p) => productFitsPet(product, p));
  const [petId, setPetId] = useState<string | undefined>(fitPets[0]?.id);
  const pet = pets.find((p) => p.id === petId);
  const suggestion = pet && product.packageKg ? suggestedInterval(product.packageKg, pet) : undefined;

  const [interval, setIntervalDays] = useState(suggestion ?? 30);
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState<Subscription['paymentMethod']>('pix');
  const [addressId, setAddressId] = useState((addresses.find((a) => a.isDefault) ?? addresses[0]).id);
  const [startNow, setStartNow] = useState(true);
  const [saving, setSaving] = useState(false);

  const options = [...new Set([...(suggestion ? [suggestion] : []), ...intervals])].sort((a, b) => a - b);

  function choosePet(p: Pet) {
    setPetId(p.id);
    if (product.packageKg) setIntervalDays(suggestedInterval(product.packageKg, p));
  }

  async function save() {
    setSaving(true);
    try {
      const next = new Date(Date.now() + (startNow ? 0 : interval) * 24 * 3600 * 1000).toISOString();
      const sub = await subscriptionService.save({
        customerId: user.id,
        storeId: store.id,
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        petId,
        quantity,
        intervalDays: interval,
        nextDeliveryDate: next,
        active: true,
        paymentMethod: payment,
        addressId,
      });
      if (startNow) {
        const order = await subscriptionService.orderNow(sub.id, user);
        notify('Assinatura criada!', 'O primeiro pedido já foi enviado para a loja.');
        router.dismissAll();
        router.push(`/cliente/pedido/${order.id}`);
      } else {
        notify('Assinatura criada!');
        router.replace('/cliente/assinaturas');
      }
    } catch (e) {
      notify('Não foi possível assinar', e instanceof Error ? e.message : undefined);
      setSaving(false);
    }
  }

  return (
    <Screen scroll edges={['bottom']}>
      <View style={styles.product}>
        <ProductImage categoryId={product.categoryId} imageUrl={product.imageUrls[0]} size={64} />
        <View style={styles.flex}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.muted}>
            {store.name} · {money(finalPrice(product))}
          </Text>
        </View>
      </View>

      {fitPets.length > 0 && (
        <Group title="Para qual pet?">
          {fitPets.map((p) => (
            <Chip key={p.id} label={p.name} icon={p.speciesId === 'gato' ? 'cat' : 'dog'} selected={petId === p.id} onPress={() => choosePet(p)} />
          ))}
        </Group>
      )}

      <Group title="Receber a cada">
        {options.map((d) => (
          <Chip key={d} label={d === suggestion ? `${d} dias ★` : `${d} dias`} selected={interval === d} onPress={() => setIntervalDays(d)} />
        ))}
      </Group>
      {pet && suggestion && product.packageKg && (
        <Text style={styles.hint}>
          ★ Sugestão: {pet.name} come cerca de {dailyGrams(pet)} g por dia, então {String(product.packageKg).replace('.', ',')} kg duram ~{Math.round((product.packageKg * 1000) / dailyGrams(pet))} dias.
        </Text>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Quantidade por entrega</Text>
        <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={10} size="sm" />
      </View>

      <Group title="Pagamento (cobrado a cada entrega, simulado)">
        <Chip label="Pix" icon="qrcode" selected={payment === 'pix'} onPress={() => setPayment('pix')} />
        <Chip label="Cartão" icon="credit-card-outline" selected={payment === 'cartao'} onPress={() => setPayment('cartao')} />
      </Group>

      <Group title="Entregar em">
        {addresses.map((a) => (
          <Chip key={a.id} label={`${a.label} · ${a.street}, ${a.number}`} selected={addressId === a.id} onPress={() => setAddressId(a.id)} />
        ))}
      </Group>

      <Pressable style={styles.option} onPress={() => setStartNow((v) => !v)}>
        <Ionicons name={startNow ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
        <Text style={styles.optionText}>Fazer o primeiro pedido agora</Text>
      </Pressable>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {quantity}x a cada {interval} dias · {money(finalPrice(product) * quantity)} + entrega
        </Text>
        <Text style={styles.muted}>Pause ou cancele quando quiser em Perfil › Assinaturas.</Text>
      </View>

      <Button title="Assinar" icon="refresh" onPress={save} loading={saving} />
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, ...shadow.card },
  name: { color: colors.text, fontWeight: font.weight.bold },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
  group: { gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { color: colors.secondary, fontSize: font.size.xs, lineHeight: 18, marginTop: -spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionText: { color: colors.text, fontSize: font.size.md },
  summary: { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  summaryText: { color: colors.primaryDark, fontWeight: font.weight.bold },
});
