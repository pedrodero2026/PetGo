import type { Product } from '@/types/models';
import { fakeGeocode } from '@/utils/geo';
import type { StoreAdminService } from '../types';
import { productsDb, storesDb } from './catalog';
import { delay } from './storage';

export const mockStoreAdminService: StoreAdminService = {
  async saveStore(store) {
    await delay(300);
    const old = await storesDb.get(store.id);
    // Recalcula a coordenada quando o CEP muda (geocodificação fictícia)
    const address =
      store.address.zip && (old?.address.zip !== store.address.zip || store.address.lat === undefined)
        ? { ...store.address, ...fakeGeocode(store.address.zip) }
        : store.address;
    return storesDb.upsert({ ...store, address });
  },

  async saveProduct(input) {
    await delay(300);
    const old = input.id ? await productsDb.get(input.id) : null;
    const product: Omit<Product, 'id'> & { id?: string } = {
      ...input,
      rating: old?.rating ?? input.rating ?? 0,
      ratingCount: old?.ratingCount ?? input.ratingCount ?? 0,
    };
    return productsDb.upsert(product, `${input.storeId}__prod`);
  },

  removeProduct: (id) => productsDb.remove(id),
};
