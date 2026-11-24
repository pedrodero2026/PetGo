import type { Order, OrderItem } from '@/types/models';
import { finalPrice } from '@/utils/products';
import { ServiceError, type OrderService } from '../types';
import { productsDb, storesDb } from './catalog';
import { collection } from './collection';
import { delay } from './storage';

export const ordersDb = collection<Order>('orders', []);

export const mockOrderService: OrderService = {
  async create(input) {
    await delay(700); // simula o processamento do pagamento
    const store = await storesDb.get(input.storeId);
    if (!store) throw new ServiceError('Loja não encontrada.');
    if (!store.isOpen) throw new ServiceError('A loja está fechada no momento.');

    const products = await productsDb.all();
    const items: OrderItem[] = input.items.map(({ productId, quantity }) => {
      const p = products.find((x) => x.id === productId);
      if (!p) throw new ServiceError('Um dos produtos não está mais disponível.');
      if (p.stock < quantity) throw new ServiceError(`Estoque insuficiente de "${p.name}".`);
      return { productId, name: p.name, imageUrl: p.imageUrls[0], unitPrice: finalPrice(p), quantity };
    });

    const subtotal = round(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0));
    if (subtotal < store.minOrder) {
      throw new ServiceError(`O pedido mínimo desta loja é R$ ${store.minOrder.toFixed(2).replace('.', ',')}.`);
    }

    // Baixa o estoque
    await productsDb.replaceAll(
      products.map((p) => {
        const item = items.find((i) => i.productId === p.id);
        return item ? { ...p, stock: p.stock - item.quantity } : p;
      }),
    );

    const now = new Date().toISOString();
    const discount = 0; // cupons entram na Fase 5
    return ordersDb.upsert(
      {
        customerId: input.customerId,
        storeId: store.id,
        items,
        subtotal,
        deliveryFee: store.deliveryFee,
        discount,
        total: round(subtotal + store.deliveryFee - discount),
        paymentMethod: input.paymentMethod,
        changeFor: input.changeFor,
        address: input.address,
        status: 'aguardando',
        statusHistory: { aguardando: now },
        createdAt: now,
        updatedAt: now,
      },
      'order',
    );
  },

  get: (id) => ordersDb.get(id),

  async listByCustomer(customerId) {
    const list = await ordersDb.where((o) => o.customerId === customerId);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  subscribe(id, onChange) {
    return ordersDb.onChange((orders) => {
      const order = orders.find((o) => o.id === id);
      if (order) onChange(order);
    });
  },
};

const round = (v: number) => Math.round(v * 100) / 100;
