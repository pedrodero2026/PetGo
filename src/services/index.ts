/**
 * Ponto único de escolha da implementação dos serviços.
 *
 * Para ligar o Firebase depois: criar `src/services/firebase/*` implementando
 * as mesmas interfaces de `./types` e trocar as linhas abaixo. Nenhuma tela muda.
 */
import { mockAuthService } from './mock/auth';
import { mockCatalogService } from './mock/catalog';
import { mockChatService } from './mock/chat';
import { mockCouponService } from './mock/coupons';
import { mockDeliveryService } from './mock/delivery';
import { mockFavoriteService } from './mock/favorites';
import { mockOrderService } from './mock/orders';
import { mockAddressService, mockPetService } from './mock/pets';
import { mockReviewService } from './mock/reviews';
import { mockStoreAdminService } from './mock/storeAdmin';
import { mockSubscriptionService } from './mock/subscriptions';
import type {
  AddressService,
  AuthService,
  CatalogService,
  ChatService,
  CouponService,
  DeliveryService,
  FavoriteService,
  OrderService,
  PetService,
  ReviewService,
  StoreAdminService,
  SubscriptionService,
} from './types';

export const authService: AuthService = mockAuthService;
export const catalogService: CatalogService = mockCatalogService;
export const petService: PetService = mockPetService;
export const addressService: AddressService = mockAddressService;
export const orderService: OrderService = mockOrderService;
export const storeAdminService: StoreAdminService = mockStoreAdminService;
export const deliveryService: DeliveryService = mockDeliveryService;
export const favoriteService: FavoriteService = mockFavoriteService;
export const reviewService: ReviewService = mockReviewService;
export const couponService: CouponService = mockCouponService;
export const chatService: ChatService = mockChatService;
export const subscriptionService: SubscriptionService = mockSubscriptionService;

export * from './types';
