import { useEffect, useState } from 'react';

import { deliveryService } from '@/services';
import type { Order } from '@/types/models';

/** Entregas disponíveis (prontas e sem entregador), em tempo real. */
export function useAvailableDeliveries(): Order[] | undefined {
  const [orders, setOrders] = useState<Order[] | undefined>();
  useEffect(() => deliveryService.subscribeAvailable(setOrders), []);
  return orders;
}

/** Entregas do entregador logado, em tempo real. */
export function useMyDeliveries(courierId?: string): Order[] | undefined {
  const [orders, setOrders] = useState<Order[] | undefined>();
  useEffect(() => {
    if (!courierId) return;
    return deliveryService.subscribeByCourier(courierId, setOrders);
  }, [courierId]);
  return orders;
}

export const isInProgress = (o: Order) => o.status === 'pronto' || o.status === 'a_caminho';
