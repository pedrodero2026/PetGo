/**
 * Modelos de dados do PetGo.
 * Os mesmos tipos são usados pelos dados fictícios (mock) e, futuramente,
 * pelas coleções do Firestore, para que a troca não exija refazer as telas.
 */

export type Role = 'cliente' | 'loja' | 'entregador';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  /** Só para role = 'loja' */
  storeId?: string;
  /** Só para role = 'entregador' */
  vehicle?: 'moto' | 'bicicleta' | 'carro';
  createdAt: string;
}

/** Espécie é dado, não código: novas espécies podem ser cadastradas sem alterar o app. */
export interface Species {
  id: string; // ex.: 'cachorro', 'gato', 'passaro'
  name: string;
  icon: string; // nome do ícone (MaterialCommunityIcons)
}

export type PetSize = 'mini' | 'pequeno' | 'medio' | 'grande' | 'gigante';
export type LifeStage = 'filhote' | 'adulto' | 'senior';

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  speciesId: string;
  breed?: string;
  size: PetSize;
  birthDate?: string;
  weightKg: number;
  photoUrl?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // Casa, Trabalho...
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

/** Endereço da loja: sem os campos que só fazem sentido para o cliente. */
export type StoreAddress = Omit<Address, 'id' | 'userId' | 'label' | 'isDefault'>;

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  address: StoreAddress;
  rating: number;
  ratingCount: number;
  deliveryFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  minOrder: number;
  isOpen: boolean;
  speciesIds: string[];
}

export type CategoryId = 'racao' | 'petiscos' | 'higiene' | 'brinquedos' | 'remedios';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: CategoryId;
  name: string;
  brand: string;
  description: string;
  imageUrls: string[];
  price: number;
  promoPrice?: number;
  stock: number;
  speciesIds: string[];
  sizes?: PetSize[];
  lifeStages?: LifeStage[];
  /** Peso do pacote em kg (ração/areia). Usado no lembrete de recompra. */
  packageKg?: number;
  requiresPrescription?: boolean;
  rating: number;
  ratingCount: number;
}

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export type OrderStatus =
  | 'aguardando' // aguardando a loja aceitar
  | 'aceito'
  | 'preparando'
  | 'pronto' // aguardando entregador
  | 'a_caminho'
  | 'entregue'
  | 'cancelado';

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  courierId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  /** Troco para (pagamento em dinheiro) */
  changeFor?: number;
  address: Address;
  status: OrderStatus;
  /** Data/hora em que cada status foi atingido */
  statusHistory: Partial<Record<OrderStatus, string>>;
  courierLocation?: { lat: number; lng: number; updatedAt: string };
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  storeId: string;
  productId: string;
  petId?: string;
  quantity: number;
  intervalDays: number;
  nextDeliveryDate: string;
  active: boolean;
}

export interface Coupon {
  code: string;
  storeId?: string; // vazio = cupom do app
  type: 'percent' | 'fixed' | 'frete_gratis';
  value: number;
  minOrder?: number;
  expiresAt?: string;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  storeId: string;
  productId?: string;
  orderId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string; // `${customerId}_${storeId}`
  senderId: string;
  text: string;
  createdAt: string;
}
