import { router } from 'expo-router';

import { catalogService } from '@/services';
import { useCart } from '@/store/cart';
import type { Order } from '@/types/models';
import { confirm, notify } from '@/utils/confirm';

/** "Pedir de novo": recoloca na sacola os itens de um pedido antigo que ainda estão disponíveis. */
export function useReorder() {
  const cart = useCart();

  return async (order: Order) => {
    if (cart.items.length > 0) {
      const ok = await confirm('Pedir de novo', 'Sua sacola atual será substituída pelos itens deste pedido.', 'Continuar');
      if (!ok) return;
    }
    const products = await Promise.all(order.items.map((i) => catalogService.getProduct(i.productId)));
    cart.clear();
    let skipped = 0;
    order.items.forEach((item, idx) => {
      const p = products[idx];
      if (p && p.stock > 0) cart.add(p, item.quantity);
      else skipped++;
    });
    if (skipped === order.items.length) return notify('Indisponível', 'Os produtos deste pedido não estão mais disponíveis.');
    if (skipped > 0) notify('Atenção', `${skipped} item(ns) não estão mais disponíveis e ficaram de fora.`);
    router.push('/cliente/carrinho');
  };
}
