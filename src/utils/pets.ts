import type { LifeStage, Pet, PetSize, Product } from '@/types/models';

export const sizeLabels: Record<PetSize, string> = {
  mini: 'Mini',
  pequeno: 'Pequeno',
  medio: 'Médio',
  grande: 'Grande',
  gigante: 'Gigante',
};

export const sizeHints: Record<PetSize, string> = {
  mini: 'até 5 kg',
  pequeno: '5–10 kg',
  medio: '10–25 kg',
  grande: '25–45 kg',
  gigante: '+45 kg',
};

export const lifeStageLabels: Record<LifeStage, string> = {
  filhote: 'Filhote',
  adulto: 'Adulto',
  senior: 'Sênior',
};

/** Idade a partir da qual cada espécie é considerada sênior (anos). */
const seniorAge: Record<string, number> = { cachorro: 7, gato: 10 };

export function ageInYears(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  const ms = Date.now() - new Date(birthDate).getTime();
  return ms / (365.25 * 24 * 3600 * 1000);
}

export function ageLabel(birthDate?: string): string | undefined {
  const years = ageInYears(birthDate);
  if (years === undefined) return undefined;
  if (years < 1) {
    const months = Math.max(1, Math.floor(years * 12));
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  const y = Math.floor(years);
  return `${y} ${y === 1 ? 'ano' : 'anos'}`;
}

export function lifeStageOf(pet: Pet): LifeStage {
  const years = ageInYears(pet.birthDate);
  if (years === undefined) return 'adulto';
  if (years < 1) return 'filhote';
  return years >= (seniorAge[pet.speciesId] ?? 8) ? 'senior' : 'adulto';
}

/** O produto serve para este pet? (espécie, porte e fase da vida) */
export function productFitsPet(product: Product, pet: Pet): boolean {
  if (!product.speciesIds.includes(pet.speciesId)) return false;
  if (product.sizes?.length && !product.sizes.includes(pet.size)) return false;
  if (product.lifeStages?.length && !product.lifeStages.includes(lifeStageOf(pet))) return false;
  return true;
}
