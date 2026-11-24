import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DeliveryMap } from '@/components/DeliveryMap';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Order, Store } from '@/types/models';
import { distanceLabel } from '@/utils/format';
import { distanceKm, etaMinutes } from '@/utils/geo';

const vehicleLabel = { moto: 'de moto', bicicleta: 'de bicicleta', carro: 'de carro' } as const;

/** Bloco de acompanhamento da entrega na tela do pedido do cliente. */
export function CustomerTracking({ order, store }: { order: Order; store: Store }) {
  const waitingCourier = order.status === 'pronto' && !order.courierId;
  const toStore = order.status === 'pronto' && !!order.courierId;
  const onTheWay = order.status === 'a_caminho';
  if (!waitingCourier && !toStore && !onTheWay) return null;

  const storePos = store.address.lat !== undefined ? { lat: store.address.lat, lng: store.address.lng! } : undefined;
  const home = order.address.lat !== undefined ? { lat: order.address.lat, lng: order.address.lng! } : undefined;
  const courier = onTheWay ? (order.courierLocation ?? storePos) : undefined;
  const km = courier && home ? distanceKm(courier, home) : undefined;
  const vehicle = order.courierVehicle ?? 'moto';

  return (
    <View style={styles.card}>
      {storePos && home && <DeliveryMap store={storePos} customer={home} courier={courier} />}

      {waitingCourier && <Text style={styles.text}>Procurando um entregador para o seu pedido...</Text>}

      {(toStore || onTheWay) && (
        <View style={styles.courier}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name={vehicle === 'bicicleta' ? 'bicycle' : vehicle === 'carro' ? 'car' : 'moped'} size={24} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.name}>
              {order.courierName ?? 'Entregador'} {vehicleLabel[vehicle]}
            </Text>
            <Text style={styles.text}>
              {toStore
                ? 'Indo até a loja para retirar seu pedido'
                : km !== undefined && km > 0.05
                  ? `A ${distanceLabel(km)} · chega em ~${etaMinutes(km, vehicle)} min`
                  : 'Chegando!'}
            </Text>
          </View>
        </View>
      )}

      {!!order.deliveryCode && (
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Código de entrega</Text>
          <Text style={styles.code}>{order.deliveryCode.split('').join(' ')}</Text>
          <Text style={styles.codeHint}>Informe ao entregador só quando receber o pedido.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, ...shadow.card },
  courier: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontWeight: font.weight.bold, color: colors.text, fontSize: font.size.md },
  text: { color: colors.textMuted, fontSize: font.size.sm },
  codeBox: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  codeLabel: { color: colors.primaryDark, fontWeight: font.weight.medium, fontSize: font.size.sm },
  code: { fontSize: font.size.xxl, fontWeight: font.weight.black, color: colors.primaryDark, letterSpacing: 4 },
  codeHint: { color: colors.primaryDark, fontSize: font.size.xs, textAlign: 'center' },
});
