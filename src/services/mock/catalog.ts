import { seedProducts, seedReviews, seedStores } from '@/data/catalog';
import { categories, species } from '@/data/seed';
import type { Product, Review, Species, Store } from '@/types/models';
import { filterProducts } from '@/utils/products';
import type { CatalogService } from '../types';
import { collection } from './collection';
import { delay } from './storage';

// Lojas e produtos ficam em coleções editáveis porque a loja vai alterá-los na Fase 3.
export const storesDb = collection<Store>('stores', seedStores);
export const productsDb = collection<Product>('products', seedProducts);
export const reviewsDb = collection<Review>('reviews', seedReviews);
export const speciesDb = collection<Species>('species', species);

export const mockCatalogService: CatalogService = {
  listSpecies: () => speciesDb.all(),
  async listCategories() {
    return categories;
  },
  async listStores() {
    await delay(250);
    // Lojas recém-cadastradas só aparecem para clientes depois de informar o endereço
    return storesDb.where((s) => !!s.address.street);
  },
  getStore: (id) => storesDb.get(id),
  async listProducts(filter) {
    await delay(200);
    return filterProducts(await productsDb.all(), filter);
  },
  getProduct: (id) => productsDb.get(id),
  async listReviews({ storeId, productId }) {
    const list = await reviewsDb.where(
      (r) => (!storeId || r.storeId === storeId) && (!productId || r.productId === productId),
    );
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
