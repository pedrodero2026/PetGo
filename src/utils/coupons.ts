import type { Coupon } from '@/types/models';
import { money } from './format';

/** "10% de desconto", "R$ 15,00 de desconto" ou "Entrega grátis". */
export function couponLabel(c: Coupon) {
  if (c.type === 'percent') return `${c.value}% de desconto`;
  if (c.type === 'fixed') return `${money(c.value)} de desconto`;
  return 'Entrega grátis';
}
