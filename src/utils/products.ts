import type { CategoryId, LifeStage, PetSize, Product } from '@/types/models';

export interface ProductFilter {
  storeId?: string;
  categoryId?: CategoryId;
  speciesId?: string;
  size?: PetSize;
  lifeStage?: LifeStage;
  brand?: string;
  maxPrice?: number;
  minPackageKg?: number;
  maxPackageKg?: number;
  query?: string;
  onlyPromo?: boolean;
}

export type ProductSort = 'relevancia' | 'menor_preco' | 'maior_preco' | 'avaliacao';

export const finalPrice = (p: Product) => p.promoPrice ?? p.price;

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * Filtro em memória, compartilhado entre a implementação mock e a futura do
 * Firebase (o Firestore não faz busca textual nem vários filtros de intervalo).
 */
export function filterProducts(products: Product[], f: ProductFilter = {}): Product[] {
  const q = f.query ? normalize(f.query.trim()) : '';
  return products.filter((p) => {
    if (f.storeId && p.storeId !== f.storeId) return false;
    if (f.categoryId && p.categoryId !== f.categoryId) return false;
    if (f.speciesId && !p.speciesIds.includes(f.speciesId)) return false;
    if (f.size && p.sizes?.length && !p.sizes.includes(f.size)) return false;
    if (f.lifeStage && p.lifeStages?.length && !p.lifeStages.includes(f.lifeStage)) return false;
    if (f.brand && p.brand !== f.brand) return false;
    if (f.maxPrice !== undefined && finalPrice(p) > f.maxPrice) return false;
    if (f.minPackageKg !== undefined && (p.packageKg ?? 0) < f.minPackageKg) return false;
    if (f.maxPackageKg !== undefined && (p.packageKg ?? Infinity) > f.maxPackageKg) return false;
    if (f.onlyPromo && p.promoPrice === undefined) return false;
    if (q && !normalize(`${p.name} ${p.brand} ${p.description}`).includes(q)) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const list = [...products];
  switch (sort) {
    case 'menor_preco':
      return list.sort((a, b) => finalPrice(a) - finalPrice(b));
    case 'maior_preco':
      return list.sort((a, b) => finalPrice(b) - finalPrice(a));
    case 'avaliacao':
      return list.sort((a, b) => b.rating - a.rating);
    default:
      return list;
  }
}

export function discountPercent(p: Product): number | undefined {
  if (p.promoPrice === undefined) return undefined;
  return Math.round((1 - p.promoPrice / p.price) * 100);
}
