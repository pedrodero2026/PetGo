import type { Category, Species, User } from '@/types/models';

/** Dados fictícios iniciais. Na Fase 2 entram lojas e produtos. */

export const species: Species[] = [
  { id: 'cachorro', name: 'Cachorro', icon: 'dog' },
  { id: 'gato', name: 'Gato', icon: 'cat' },
];

export const categories: Category[] = [
  { id: 'racao', name: 'Ração', icon: 'food-drumstick' },
  { id: 'petiscos', name: 'Petiscos', icon: 'bone' },
  { id: 'higiene', name: 'Areia e Higiene', icon: 'shower' },
  { id: 'brinquedos', name: 'Brinquedos', icon: 'tennis-ball' },
  { id: 'remedios', name: 'Remédios', icon: 'pill' },
];

const now = new Date('2026-01-01T12:00:00Z').toISOString();

/** Contas de demonstração (senha de todas: 123456). */
export const demoUsers: (User & { password: string })[] = [
  {
    id: 'user_cliente',
    name: 'Ana Cliente',
    email: 'cliente@petgo.com',
    phone: '(11) 99999-0001',
    role: 'cliente',
    password: '123456',
    createdAt: now,
  },
  {
    id: 'user_loja',
    name: 'Carlos Pet Shop',
    email: 'loja@petgo.com',
    phone: '(11) 99999-0002',
    role: 'loja',
    storeId: 'store_1',
    password: '123456',
    createdAt: now,
  },
  {
    id: 'user_entregador',
    name: 'Bruno Entregador',
    email: 'entregador@petgo.com',
    phone: '(11) 99999-0003',
    role: 'entregador',
    vehicle: 'moto',
    password: '123456',
    createdAt: now,
  },
];
