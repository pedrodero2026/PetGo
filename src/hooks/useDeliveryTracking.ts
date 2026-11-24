import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

import { deliveryService } from '@/services';
import type { Order } from '@/types/models';
import { interpolate, type LatLng } from '@/utils/geo';

/** Duração do trajeto simulado (loja → cliente), em segundos. */
export const SIMULATED_TRIP_SECONDS = 90;
const SEND_EVERY_MS = 3000;

/**
 * Enquanto o pedido está "a caminho", envia a posição do entregador.
 * - modo "simulado": anda em linha reta da loja até o cliente (bom para apresentar);
 * - modo "gps": usa o GPS do celular (permissão de localização).
 */
export function useDeliveryTracking(order: Order | undefined, store: LatLng | undefined, mode: 'simulado' | 'gps') {
  const active = order?.status === 'a_caminho';
  const orderId = order?.id;
  const startedAt = order?.statusHistory.a_caminho;
  const customer = order && order.address.lat !== undefined ? { lat: order.address.lat, lng: order.address.lng! } : undefined;
  const cLat = customer?.lat;
  const cLng = customer?.lng;
  const sLat = store?.lat;
  const sLng = store?.lng;

  useEffect(() => {
    if (!active || !orderId) return;

    if (mode === 'gps' && Platform.OS !== 'web') {
      let sub: Location.LocationSubscription | undefined;
      let cancelled = false;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 15, timeInterval: SEND_EVERY_MS },
          (pos) => deliveryService.updateLocation(orderId, pos.coords.latitude, pos.coords.longitude),
        );
      })();
      return () => {
        cancelled = true;
        sub?.remove();
      };
    }

    if (sLat === undefined || sLng === undefined || cLat === undefined || cLng === undefined || !startedAt) return;
    const tick = () => {
      const t = (Date.now() - new Date(startedAt).getTime()) / (SIMULATED_TRIP_SECONDS * 1000);
      const p = interpolate({ lat: sLat, lng: sLng }, { lat: cLat, lng: cLng }, t);
      deliveryService.updateLocation(orderId, p.lat, p.lng);
    };
    tick();
    const timer = setInterval(tick, SEND_EVERY_MS);
    return () => clearInterval(timer);
  }, [active, orderId, mode, startedAt, sLat, sLng, cLat, cLng]);
}
