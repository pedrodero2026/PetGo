import { useCart } from '@/store/cart';
import type { Product } from '@/types/models';
import { confirm } from '@/utils/confirm';

/** Adiciona ao carrinho; se for de outra loja, pergunta se pode esvaziar a sacola. */
export function useAddToCart() {
  const add = useCart((s) => s.add);
  const replaceWith = useCart((s) => s.replaceWith);

  return async (product: Product, quantity = 1): Promise<boolean> => {
    if (add(product, quantity)) return true;
    const ok = await confirm(
      'Sacola de outra loja',
      'Sua sacola tem itens de outra loja. Deseja esvaziá-la e adicionar este produto?',
      'Esvaziar e adicionar',
    );
    if (ok) replaceWith(product, quantity);
    return ok;
  };
}
