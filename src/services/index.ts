/**
 * Ponto único de escolha da implementação dos serviços.
 *
 * Para ligar o Firebase depois: criar `src/services/firebase/auth.ts`
 * implementando `AuthService` e trocar a linha abaixo. Nenhuma tela muda.
 */
import { mockAuthService } from './mock/auth';
import type { AuthService } from './types';

export const authService: AuthService = mockAuthService;

export * from './types';
