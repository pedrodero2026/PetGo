import type { LifeStage, Order, Pet, Product } from '@/types/models';
import { lifeStageOf, productFitsPet } from './pets';

/**
 * Consumo diário estimado de ração seca (gramas).
 * Usa a energia de repouso (RER = 70 × peso^0,75 kcal) × um fator por fase da vida,
 * dividida por ~3,6 kcal por grama de ração seca. É uma estimativa, não orientação veterinária.
 */
const factor: Record<string, Record<LifeStage, number>> = {
  cachorro: { filhote: 2.0, adulto: 1.6, senior: 1.4 },
  gato: { filhote: 2.0, adulto: 1.2, senior: 1.1 },
};
const KCAL_PER_GRAM = 3.6;

export function dailyGrams(pet: Pet): number {
  const rer = 70 * Math.pow(Math.max(pet.weightKg, 0.5), 0.75);
  const f = (factor[pet.speciesId] ?? factor.cachorro)[lifeStageOf(pet)];
  return Math.round((rer * f) / KCAL_PER_GRAM);
}

export interface FoodStatus {
  pet: Pet;
  kg: number;
  startedAt: string;
  /** De onde veio a informação do pacote */
  source: 'pedido' | 'manual';
  product?: Product;
  gramsPerDay: number;
  daysTotal: number;
  daysLeft: number;
  runOutAt: string;
}

const DAY = 24 * 3600 * 1000;

/**
 * Pacote de ração atual de cada pet: o mais recente entre o informado pelo tutor
 * e o último pedido entregue com uma ração que serve para o pet.
 */
export function foodStatusFor(pet: Pet, orders: Order[], products: Product[], now = Date.now()): FoodStatus | undefined {
  const byId = new Map(products.map((p) => [p.id, p]));
  let best: { kg: number; startedAt: string; source: FoodStatus['source']; product?: Product } | undefined;

  if (pet.foodPackage) best = { ...pet.foodPackage, source: 'manual' };

  for (const o of orders) {
    if (o.status !== 'entregue') continue;
    const at = o.statusHistory.entregue ?? o.updatedAt;
    for (const item of o.items) {
      const p = byId.get(item.productId);
      if (!p || p.categoryId !== 'racao' || !p.packageKg || !productFitsPet(p, pet)) continue;
      if (!best || at > best.startedAt) best = { kg: p.packageKg * item.quantity, startedAt: at, source: 'pedido', product: p };
    }
  }
  if (!best) return undefined;

  const gramsPerDay = dailyGrams(pet);
  const daysTotal = (best.kg * 1000) / gramsPerDay;
  const runOut = new Date(best.startedAt).getTime() + daysTotal * DAY;
  return {
    pet,
    ...best,
    gramsPerDay,
    daysTotal: Math.round(daysTotal),
    daysLeft: Math.max(0, Math.ceil((runOut - now) / DAY)),
    runOutAt: new Date(runOut).toISOString(),
  };
}

/** Intervalo sugerido (dias) para assinar a ração, arredondado para múltiplos de 5. */
export function suggestedInterval(packageKg: number, pet: Pet): number {
  const days = (packageKg * 1000) / dailyGrams(pet);
  return Math.min(90, Math.max(7, Math.round(days / 5) * 5));
}
