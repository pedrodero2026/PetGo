import { useEffect, useState } from 'react';

import { orderService } from '@/services';
import type { Order } from '@/types/models';

/** Pedidos da loja, atualizados em tempo real. `undefined` enquanto carrega. */
export function useStoreOrders(storeId?: string): Order[] | undefined {
  const [orders, setOrders] = useState<Order[] | undefined>();
  useEffect(() => {
    if (!storeId) return;
    return orderService.subscribeByStore(storeId, setOrders);
  }, [storeId]);
  return orders;
}
