import { ServiceError, type ReviewService } from '../types';
import { productsDb, reviewsDb, storesDb } from './catalog';
import { delay } from './storage';

/** Nova média incluindo uma nota. */
const addToAverage = (avg: number, count: number, rating: number) =>
  Math.round(((avg * count + rating) / (count + 1)) * 10) / 10;

export const mockReviewService: ReviewService = {
  async create(input) {
    await delay(400);
    if ((await reviewsDb.where((r) => r.orderId === input.orderId)).length) {
      throw new ServiceError('Este pedido já foi avaliado.');
    }
    const now = new Date().toISOString();
    // Avaliação da loja (com o comentário)
    await reviewsDb.upsert(
      {
        orderId: input.orderId,
        authorId: input.authorId,
        authorName: input.authorName,
        storeId: input.storeId,
        rating: input.storeRating,
        comment: input.comment,
        createdAt: now,
      },
      'rev',
    );
    const store = await storesDb.get(input.storeId);
    if (store) {
      await storesDb.update(store.id, {
        rating: addToAverage(store.rating, store.ratingCount, input.storeRating),
        ratingCount: store.ratingCount + 1,
      });
    }
    // Notas dos produtos
    for (const pr of input.productRatings) {
      await reviewsDb.upsert(
        {
          orderId: input.orderId,
          authorId: input.authorId,
          authorName: input.authorName,
          storeId: input.storeId,
          productId: pr.productId,
          rating: pr.rating,
          createdAt: now,
        },
        'rev',
      );
      const p = await productsDb.get(pr.productId);
      if (p) {
        await productsDb.update(p.id, {
          rating: addToAverage(p.rating, p.ratingCount, pr.rating),
          ratingCount: p.ratingCount + 1,
        });
      }
    }
  },

  async getByOrder(orderId) {
    const [review] = await reviewsDb.where((r) => r.orderId === orderId && !r.productId);
    return review ?? null;
  },

  async listByStore(storeId) {
    const list = await reviewsDb.where((r) => r.storeId === storeId && !r.productId);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async reply(reviewId, text) {
    await reviewsDb.update(reviewId, { reply: text.trim() || undefined });
  },
};
