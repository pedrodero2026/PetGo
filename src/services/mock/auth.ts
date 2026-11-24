import type { User } from '@/types/models';
import { demoUsers } from '@/data/seed';
import { AuthError, type AuthService, type RegisterInput } from '../types';
import { storesDb } from './catalog';
import { delay, newId, readJSON, remove, writeJSON } from './storage';

const USERS_KEY = '@petgo/users';
const SESSION_KEY = '@petgo/session';

/** Usuário guardado localmente. A senha em texto puro é aceitável só no mock. */
type StoredUser = User & { password: string };

async function getUsers(): Promise<StoredUser[]> {
  const saved = await readJSON<StoredUser[] | null>(USERS_KEY, null);
  if (saved) return saved;
  await writeJSON(USERS_KEY, demoUsers);
  return demoUsers;
}

function strip({ password: _password, ...user }: StoredUser): User {
  return user;
}

export const mockAuthService: AuthService = {
  async getCurrentUser() {
    const id = await readJSON<string | null>(SESSION_KEY, null);
    if (!id) return null;
    const user = (await getUsers()).find((u) => u.id === id);
    return user ? strip(user) : null;
  },

  async login(email, password) {
    await delay();
    const user = (await getUsers()).find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!user || user.password !== password) {
      throw new AuthError('E-mail ou senha incorretos.');
    }
    await writeJSON(SESSION_KEY, user.id);
    return strip(user);
  },

  async loginWithGoogle() {
    await delay();
    throw new AuthError('O login com Google estará disponível quando o Firebase for conectado.');
  },

  async register(input: RegisterInput) {
    await delay();
    const users = await getUsers();
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) {
      throw new AuthError('Já existe uma conta com este e-mail.');
    }
    const user: StoredUser = {
      id: newId('user'),
      name: input.name.trim(),
      email,
      phone: input.phone,
      role: input.role,
      vehicle: input.role === 'entregador' ? input.vehicle : undefined,
      storeId: input.role === 'loja' ? newId('store') : undefined,
      password: input.password,
      createdAt: new Date().toISOString(),
    };
    await writeJSON(USERS_KEY, [...users, user]);
    if (user.role === 'loja' && user.storeId) {
      // Cria a loja fechada e sem endereço; o dono completa os dados no painel
      await storesDb.upsert({
        id: user.storeId,
        ownerId: user.id,
        name: input.storeName?.trim() || user.name,
        address: { street: '', number: '', district: '', city: '', state: '', zip: '' },
        rating: 0,
        ratingCount: 0,
        deliveryFee: 5,
        deliveryTimeMin: 30,
        deliveryTimeMax: 50,
        minOrder: 20,
        isOpen: false,
        speciesIds: ['cachorro', 'gato'],
      });
    }
    await writeJSON(SESSION_KEY, user.id);
    return strip(user);
  },

  async logout() {
    await remove(SESSION_KEY);
  },
};
