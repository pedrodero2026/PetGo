import { create } from 'zustand';

import { authService, type RegisterInput } from '@/services';
import type { User } from '@/types/models';

interface AuthState {
  user: User | null;
  /** true até a sessão salva ser carregada na abertura do app */
  initializing: boolean;
  init(): Promise<void>;
  login(email: string, password: string): Promise<void>;
  loginWithGoogle(): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  logout(): Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  initializing: true,

  async init() {
    try {
      set({ user: await authService.getCurrentUser() });
    } finally {
      set({ initializing: false });
    }
  },

  async login(email, password) {
    set({ user: await authService.login(email, password) });
  },

  async loginWithGoogle() {
    set({ user: await authService.loginWithGoogle() });
  },

  async register(input) {
    set({ user: await authService.register(input) });
  },

  async logout() {
    await authService.logout();
    set({ user: null });
  },
}));

/** Rota inicial de cada perfil. */
export const homeByRole = {
  cliente: '/cliente',
  loja: '/loja',
  entregador: '/entregador',
} as const;
