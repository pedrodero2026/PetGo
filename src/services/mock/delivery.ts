import type { Order } from '@/types/models';
import { ServiceError, type DeliveryService } from '../types';
import { ordersDb } from './orders';
import { delay } from './storage';

const newestFirst = (list: Order[]) => [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

/** Observa a coleção de pedidos aplicando um filtro (lista inicial + mudanças). */
function watch(filter: (o: Order) => boolean, onChange: (orders: Order[]) => void) {
  let active = true;
  const emit = (all: Order[]) => onChange(newestFirst(all.filter(filter)));
  ordersDb.all().then((all) => active && emit(all));
  const off = ordersDb.onChange(emit);
  return () => {
    active = false;
    off();
  };
}

async function mustGet(id: string) {
  const order = await ordersDb.get(id);
  if (!order) throw new ServiceError('Pedido não encontrado.');
  return order;
}

export const mockDeliveryService: DeliveryService = {
  subscribeAvailable: (onChange) => watch((o) => o.status === 'pronto' && !o.courierId, onChange),

  subscribeByCourier: (courierId, onChange) => watch((o) => o.courierId === courierId, onChange),

  async accept(orderId, courier) {
    await delay(400);
    const all = await ordersDb.all();
    const busy = all.some((o) => o.courierId === courier.id && (o.status === 'pronto' || o.status === 'a_caminho'));
    if (busy) throw new ServiceError('Finalize a entrega em andamento antes de aceitar outra.');
    const order = await mustGet(orderId);
    if (order.courierId || order.status !== 'pronto') throw new ServiceError('Outro entregador já pegou este pedido.');
    return (await ordersDb.update(orderId, {
      courierId: courier.id,
      courierName: courier.name,
      courierVehicle: courier.vehicle,
      updatedAt: new Date().toISOString(),
    }))!;
  },

  async pickUp(orderId) {
    await delay(300);
    const order = await mustGet(orderId);
    if (order.status !== 'pronto') throw new ServiceError('O pedido ainda não está pronto.');
    const now = new Date().toISOString();
    return (await ordersDb.update(orderId, {
      status: 'a_caminho',
      statusHistory: { ...order.statusHistory, a_caminho: now },
      updatedAt: now,
    }))!;
  },

  async updateLocation(orderId, lat, lng) {
    await ordersDb.update(orderId, { courierLocation: { lat, lng, updatedAt: new Date().toISOString() } });
  },

  async confirmDelivery(orderId, code) {
    await delay(400);
    const order = await mustGet(orderId);
    if (order.status !== 'a_caminho') throw new ServiceError('Este pedido não está em rota de entrega.');
    if (code.trim() !== order.deliveryCode) throw new ServiceError('Código incorreto. Peça o código ao cliente.');
    const now = new Date().toISOString();
    return (await ordersDb.update(orderId, {
      status: 'entregue',
      statusHistory: { ...order.statusHistory, entregue: now },
      updatedAt: now,
    }))!;
  },
};
