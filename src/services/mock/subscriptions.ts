import type { Subscription } from '@/types/models';
import { ServiceError, type SubscriptionService } from '../types';
import { collection } from './collection';
import { mockOrderService } from './orders';
import { addressesDb } from './pets';

const subscriptionsDb = collection<Subscription>('subscriptions', []);

const addDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 24 * 3600 * 1000).toISOString();

async function createOrderFor(sub: Subscription, customer: { id: string; name: string; phone?: string }) {
  const address = await addressesDb.get(sub.addressId);
  if (!address) throw new ServiceError('O endereço desta assinatura não existe mais.');
  return mockOrderService.create({
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    storeId: sub.storeId,
    items: [{ productId: sub.productId, quantity: sub.quantity }],
    address,
    paymentMethod: sub.paymentMethod,
  });
}

export const mockSubscriptionService: SubscriptionService = {
  async list(customerId) {
    const list = await subscriptionsDb.where((s) => s.customerId === customerId);
    return list.sort((a, b) => a.nextDeliveryDate.localeCompare(b.nextDeliveryDate));
  },

  save: (sub) => subscriptionsDb.upsert({ ...sub, createdAt: sub.createdAt ?? new Date().toISOString() }, 'sub'),

  remove: (id) => subscriptionsDb.remove(id),

  async processDue(customer) {
    const now = new Date().toISOString();
    const due = await subscriptionsDb.where((s) => s.customerId === customer.id && s.active && s.nextDeliveryDate <= now);
    const created = [];
    for (const sub of due) {
      try {
        const order = await createOrderFor(sub, customer);
        created.push(order);
        await subscriptionsDb.update(sub.id, { nextDeliveryDate: addDays(now, sub.intervalDays), lastOrderId: order.id });
      } catch {
        // Loja fechada, sem estoque etc.: tenta de novo amanhã
        await subscriptionsDb.update(sub.id, { nextDeliveryDate: addDays(now, 1) });
      }
    }
    return created;
  },

  async orderNow(id, customer) {
    const sub = await subscriptionsDb.get(id);
    if (!sub) throw new ServiceError('Assinatura não encontrada.');
    const order = await createOrderFor(sub, customer);
    await subscriptionsDb.update(id, {
      nextDeliveryDate: addDays(new Date().toISOString(), sub.intervalDays),
      lastOrderId: order.id,
    });
    return order;
  },
};
