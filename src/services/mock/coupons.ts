import { demoCoupons } from '@/data/demo';
import type { Coupon } from '@/types/models';
import { money } from '@/utils/format';
import { ServiceError, type CouponService } from '../types';
import { collection } from './collection';

export const couponsDb = collection<Coupon>('coupons', demoCoupons);

const isValidNow = (c: Coupon) => c.active && (!c.expiresAt || new Date(c.expiresAt) > new Date());

/** Regra do desconto, usada pela tela (prévia) e na criação do pedido (valor final). */
export function computeDiscount(c: Coupon, subtotal: number, deliveryFee: number): number {
  const d = c.type === 'percent' ? (subtotal * c.value) / 100 : c.type === 'fixed' ? c.value : deliveryFee;
  return Math.round(Math.min(d, subtotal + deliveryFee) * 100) / 100;
}

export async function validateCoupon(code: string, storeId: string, subtotal: number, deliveryFee: number) {
  const normalized = code.trim().toUpperCase();
  const coupon = (await couponsDb.all()).find((c) => c.code === normalized);
  if (!coupon || !isValidNow(coupon)) throw new ServiceError('Cupom inválido ou expirado.');
  if (coupon.storeId && coupon.storeId !== storeId) throw new ServiceError('Este cupom não vale para esta loja.');
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    throw new ServiceError(`Este cupom vale para pedidos a partir de ${money(coupon.minOrder)}.`);
  }
  if (coupon.type === 'frete_gratis' && deliveryFee === 0) throw new ServiceError('A entrega desta loja já é grátis.');
  return { coupon, discount: computeDiscount(coupon, subtotal, deliveryFee) };
}

export const mockCouponService: CouponService = {
  listAvailable: (storeId) => couponsDb.where((c) => isValidNow(c) && (!c.storeId || c.storeId === storeId)),
  listByStore: (storeId) => couponsDb.where((c) => c.storeId === storeId),
  validate: validateCoupon,
  async save(coupon) {
    const code = coupon.code.trim().toUpperCase();
    const clash = (await couponsDb.all()).find((c) => c.code === code && c.id !== coupon.id);
    if (clash) throw new ServiceError('Já existe um cupom com esse código.');
    return couponsDb.upsert({ ...coupon, code }, 'cp');
  },
  remove: (id) => couponsDb.remove(id),
};
