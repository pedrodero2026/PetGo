import type {
  Address,
  Category,
  Order,
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
  storeId: string;
  items: { productId: string; quantity: number }[];
  address: Address;
  paymentMethod: PaymentMethod;
  changeFor?: number;
}

export interface OrderService {
  create(input: CreateOrderInput): Promise<Order>;
  get(id: string): Promise<Order | null>;
  listByCustomer(customerId: string): Promise<Order[]>;
  /** Observa mudanças do pedido (status, entregador). Retorna função para parar. */
  subscribe(id: string, onChange: (order: Order) => void): () => void;
}
