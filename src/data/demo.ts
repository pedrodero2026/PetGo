import type { Address, Coupon, Order, Pet } from '@/types/models';

/**
 * Dados de demonstração da cliente Ana (cliente@petgo.com).
 * Datas relativas a "agora" para o lembrete de ração sempre ter algo a mostrar.
 */
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();

export const demoAddresses: Address[] = [
  {
    id: 'addr_casa',
    userId: 'user_cliente',
    label: 'Casa',
    street: 'Alameda Santos',
    number: '1000',
    complement: 'Apto 42',
    district: 'Jardim Paulista',
    city: 'São Paulo',
    state: 'SP',
    zip: '01418-100',
    lat: -23.5651,
    lng: -46.6543,
    isDefault: true,
  },
];

export const demoPets: Pet[] = [
  {
    id: 'pet_thor',
    ownerId: 'user_cliente',
    name: 'Thor',
    speciesId: 'cachorro',
    breed: 'Labrador',
    size: 'grande',
    weightKg: 30,
    birthDate: '2022-03-10T00:00:00.000Z',
  },
  {
    id: 'pet_mia',
    ownerId: 'user_cliente',
    name: 'Mia',
    speciesId: 'gato',
    breed: 'SRD',
    size: 'pequeno',
    weightKg: 4.2,
    birthDate: '2026-05-01T00:00:00.000Z',
    foodPackage: { kg: 1, startedAt: daysAgo(4) },
  },
];

/** Pedido entregue há 30 dias: ração do Thor (alimenta o lembrete e pode ser avaliado). */
export const demoOrders: Order[] = [
  {
    id: 'order_demo_1',
    customerId: 'user_cliente',
    customerName: 'Ana Cliente',
    customerPhone: '(11) 99999-0001',
    storeId: 'store_1',
    courierId: 'user_entregador',
    courierName: 'Bruno Entregador',
    courierVehicle: 'moto',
    courierFee: 5.99,
    deliveryCode: '4321',
    items: [
      {
        productId: 'store_1__nutridog-adulto-mg-15',
        name: 'Ração NutriDog Adulto Raças Médias e Grandes 15 kg',
        unitPrice: 189.9,
        quantity: 1,
      },
    ],
    subtotal: 189.9,
    deliveryFee: 5.99,
    discount: 0,
    total: 195.89,
    paymentMethod: 'pix',
    address: demoAddresses[0],
    status: 'entregue',
    statusHistory: {
      aguardando: daysAgo(30.05),
      aceito: daysAgo(30.04),
      preparando: daysAgo(30.03),
      pronto: daysAgo(30.02),
      a_caminho: daysAgo(30.01),
      entregue: daysAgo(30),
    },
    createdAt: daysAgo(30.05),
    updatedAt: daysAgo(30),
  },
];

/** Cupons do app (valem em qualquer loja) e de exemplo da loja 1. */
export const demoCoupons: Coupon[] = [
  { id: 'cp_petgo10', code: 'PETGO10', type: 'percent', value: 10, minOrder: 50, active: true, description: '10% off em pedidos acima de R$ 50' },
  { id: 'cp_frete', code: 'FRETEGRATIS', type: 'frete_gratis', value: 0, minOrder: 80, active: true, description: 'Entrega grátis acima de R$ 80' },
  { id: 'cp_amigo', code: 'AMIGO15', storeId: 'store_1', type: 'fixed', value: 15, minOrder: 100, active: true, description: 'R$ 15 off no Pet Shop Amigo Fiel' },
];
