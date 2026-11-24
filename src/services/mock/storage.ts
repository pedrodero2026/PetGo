import AsyncStorage from '@react-native-async-storage/async-storage';

/** Pequeno helper de persistência JSON usado pelos serviços mock. */
export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export function newId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Simula a latência de rede para o app se comportar como terá com o Firebase. */
export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
