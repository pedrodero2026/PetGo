import type {
  Address,
  Category,
  Chat,
  ChatMessage,
  Coupon,
  Favorite,
  Subscription,
  Order,
  OrderStatus,
  PaymentMethod,
  Pet,
  Product,
  Review,
  Role,
  Species,
  Store,
  User,
} from '@/types/models';
import type { ProductFilter } from '@/utils/products';

/**
 * Contratos dos serviços. As telas só conhecem estas interfaces.
 * Hoje a implementação é `mock` (AsyncStorage); depois haverá uma `firebase`
 * com as mesmas assinaturas, trocada em `src/services/index.ts`.
 */

export class ServiceError extends Error {}
/** @deprecated use ServiceError */
export const AuthError = ServiceError;

// ---------- Autenticação ----------

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  storeName?: string;
  vehicle?: User['vehicle'];
}

export interface AuthService {
  /** Usuário da sessão salva, ou null. */
  getCurrentUser(): Promise<User | null>;
  login(email: string, password: string): Promise<User>;
  loginWithGoogle(): Promise<User>;
  register(input: RegisterInput): Promise<User>;
  logout(): Promise<void>;
}

// ---------- Catálogo (lojas e produtos) ----------

export interface CatalogService {
  listSpecies(): Promise<Species[]>;
  listCategories(): Promise<Category[]>;
  listStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | null>;
  listProducts(filter?: ProductFilter): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  listReviews(query: { storeId?: string; productId?: string }): Promise<Review[]>;
}

// ---------- Pets ----------

export type PetInput = Omit<Pet, 'id'> & { id?: string };

export interface PetService {
  list(ownerId: string): Promise<Pet[]>;
  get(id: string): Promise<Pet | null>;
  save(pet: PetInput): Promise<Pet>;
  remove(id: string): Promise<void>;
}

// ---------- Endereços ----------

export type AddressInput = Omit<Address, 'id'> & { id?: string };

export interface AddressService {
  list(userId: string): Promise<Address[]>;
  get(id: string): Promise<Address | null>;
  save(address: AddressInput): Promise<Address>;
  remove(id: string): Promise<void>;
  setDefault(userId: string, id: string): Promise<void>;
}

// ---------- Pedidos ----------

export interface CreateOrderInput {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  storeId: string;
  items: { productId: string; quantity: number }[];
  address: Address;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  couponCode?: string;
}

export interface OrderService {
  create(input: CreateOrderInput): Promise<Order>;
  get(id: string): Promise<Order | null>;
  listByCustomer(customerId: string): Promise<Order[]>;
  /** Observa mudanças do pedido (status, entregador). Retorna função para parar. */
  subscribe(id: string, onChange: (order: Order) => void): () => void;
  /** Lista e observa os pedidos de uma loja (chama onChange já com a lista inicial). */
  subscribeByStore(storeId: string, onChange: (orders: Order[]) => void): () => void;
  /** Muda o status respeitando o fluxo do pedido. Cancelar devolve o estoque. */
  updateStatus(id: string, status: OrderStatus, extra?: { cancelReason?: string }): Promise<Order>;
}

// ---------- Entregas (perfil entregador) ----------

export interface DeliveryService {
  /** Pedidos prontos ainda sem entregador (chama onChange já com a lista inicial). */
  subscribeAvailable(onChange: (orders: Order[]) => void): () => void;
  /** Entregas do entregador, em andamento e concluídas. */
  subscribeByCourier(courierId: string, onChange: (orders: Order[]) => void): () => void;
  /** Assume a entrega. Falha se outro entregador pegou antes ou se já há uma em andamento. */
  accept(orderId: string, courier: Pick<User, 'id' | 'name' | 'vehicle'>): Promise<Order>;
  /** Retirou na loja: o pedido sai para entrega. */
  pickUp(orderId: string): Promise<Order>;
  updateLocation(orderId: string, lat: number, lng: number): Promise<void>;
  /** Confirma com o código que o cliente informa. */
  confirmDelivery(orderId: string, code: string): Promise<Order>;
}

// ---------- Gestão da loja (perfil loja) ----------

export type ProductInput = Omit<Product, 'id' | 'rating' | 'ratingCount'> & {
  id?: string;
  rating?: number;
  ratingCount?: number;
};

export interface StoreAdminService {
  saveStore(store: Store): Promise<Store>;
  saveProduct(product: ProductInput): Promise<Product>;
  removeProduct(id: string): Promise<void>;
}

// ---------- Favoritos ----------

export interface FavoriteService {
  list(userId: string): Promise<Favorite[]>;
  /** Liga/desliga o favorito. Retorna true se ficou favoritado. */
  toggle(userId: string, type: Favorite['type'], targetId: string): Promise<boolean>;
}

// ---------- Avaliações ----------

export interface ReviewInput {
  orderId: string;
  authorId: string;
  authorName: string;
  storeId: string;
  storeRating: number;
  comment?: string;
  /** Nota de cada produto (opcional) */
  productRatings: { productId: string; rating: number }[];
}

export interface ReviewService {
  /** Cria a avaliação da loja (e dos produtos) e atualiza as médias. Uma por pedido. */
  create(input: ReviewInput): Promise<void>;
  getByOrder(orderId: string): Promise<Review | null>;
  listByStore(storeId: string): Promise<Review[]>;
  reply(reviewId: string, text: string): Promise<void>;
}

// ---------- Cupons ----------

export interface CouponResult {
  coupon: Coupon;
  discount: number;
}

export interface CouponService {
  /** Cupons ativos que valem para a loja (do app + da loja). */
  listAvailable(storeId: string): Promise<Coupon[]>;
  listByStore(storeId: string): Promise<Coupon[]>;
  /** Valida o código e calcula o desconto. Lança ServiceError com o motivo se não valer. */
  validate(code: string, storeId: string, subtotal: number, deliveryFee: number): Promise<CouponResult>;
  save(coupon: Omit<Coupon, 'id'> & { id?: string }): Promise<Coupon>;
  remove(id: string): Promise<void>;
}

// ---------- Chat cliente ⇄ loja ----------

export interface ChatService {
  /** Abre (ou cria) a conversa entre cliente e loja. */
  open(customer: { id: string; name: string }, store: { id: string; name: string }): Promise<Chat>;
  get(chatId: string): Promise<Chat | null>;
  subscribeChats(filter: { customerId?: string; storeId?: string }, onChange: (chats: Chat[]) => void): () => void;
  subscribeMessages(chatId: string, onChange: (messages: ChatMessage[]) => void): () => void;
  send(chatId: string, senderId: string, text: string): Promise<void>;
  markRead(chatId: string, by: 'customer' | 'store'): Promise<void>;
}

// ---------- Assinaturas (recompra automática) ----------

export type SubscriptionInput = Omit<Subscription, 'id' | 'createdAt'> & { id?: string; createdAt?: string };

export interface SubscriptionService {
  list(customerId: string): Promise<Subscription[]>;
  save(sub: SubscriptionInput): Promise<Subscription>;
  remove(id: string): Promise<void>;
  /**
   * Gera os pedidos das assinaturas vencidas e agenda a próxima entrega.
   * No Firebase isso vira uma Cloud Function diária; no mock roda ao abrir o app.
   */
  processDue(customer: Pick<User, 'id' | 'name' | 'phone'>): Promise<Order[]>;
  /** Gera o pedido agora, sem esperar a data. */
  orderNow(id: string, customer: Pick<User, 'id' | 'name' | 'phone'>): Promise<Order>;
}
