/**
 * Ponto único de escolha da implementação dos serviços.
 *
 * Para ligar o Firebase depois: criar `src/services/firebase/*` implementando
 * as mesmas interfaces de `./types` e trocar as linhas abaixo. Nenhuma tela muda.
 */
import { mockAuthService } from './mock/auth';
import { mockCatalogService } from './mock/catalog';
import { mockOrderService } from './mock/orders';
import { mockAddressService, mockPetService } from './mock/pets';
import type { AddressService, AuthService, CatalogService, OrderService, PetService } from './types';

export const authService: AuthService = mockAuthService;
export const catalogService: CatalogService = mockCatalogService;
export const petService: PetService = mockPetService;
export const addressService: AddressService = mockAddressService;
export const orderService: OrderService = mockOrderService;

export * from './types';
