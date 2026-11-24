import type { Role, User } from '@/types/models';

/**
 * Contratos dos serviços. As telas só conhecem estas interfaces.
 * Hoje a implementação é `mock` (AsyncStorage); depois haverá uma `firebase`
 * com as mesmas assinaturas, trocada em `src/services/index.ts`.
 */

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

export class AuthError extends Error {}
