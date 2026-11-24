import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Product } from '@/types/models';
import { finalPrice } from '@/utils/products';

export interface CartItem {
  productId: string;
  name: string;
  categoryId: Product['categoryId'];
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  /** Como no iFood, a sacola tem itens de uma única loja por vez. */
  storeId: string | null;
  items: CartItem[];
  /** Retorna false se o produto é de outra loja (a tela pergunta se quer limpar). */
  add(product: Product, quantity?: number): boolean;
  setQuantity(productId: string, quantity: number): void;
  remove(productId: string): void;
  clear(): void;
  /** Esvazia a sacola e adiciona o produto (troca de loja). */
  replaceWith(product: Product, quantity?: number): void;
}

const toItem = (p: Product, quantity: number): CartItem => ({
  productId: p.id,
  name: p.name,
  categoryId: p.categoryId,
  imageUrl: p.imageUrls[0],
  unitPrice: finalPrice(p),
  quantity: Math.min(quantity, p.stock),
  maxQuantity: p.stock,
});

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      storeId: null,
      items: [],

      add(product, quantity = 1) {
        const { storeId, items } = get();
        if (storeId && storeId !== product.storeId && items.length > 0) return false;
        const existing = items.find((i) => i.productId === product.id);
        set({
          storeId: product.storeId,
          items: existing
            ? items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                  : i,
              )
            : [...items, toItem(product, quantity)],
        });
        return true;
      },

      setQuantity(productId, quantity) {
        if (quantity <= 0) return get().remove(productId);
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i,
          ),
        });
      },

      remove(productId) {
        const items = get().items.filter((i) => i.productId !== productId);
        set({ items, storeId: items.length ? get().storeId : null });
      },

      clear() {
        set({ items: [], storeId: null });
      },

      replaceWith(product, quantity = 1) {
        set({ storeId: product.storeId, items: [toItem(product, quantity)] });
      },
    }),
    { name: '@petgo/cart', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) =>
  Math.round(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100) / 100;
