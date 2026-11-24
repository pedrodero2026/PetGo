import { newId, readJSON, writeJSON } from './storage';

/**
 * "Coleção" persistida no AsyncStorage, parecida com uma coleção do Firestore.
 * Na primeira leitura é preenchida com os dados iniciais (seed).
 */
export function collection<T extends { id: string }>(name: string, seed: T[] = []) {
  const key = `@petgo/${name}`;
  const listeners = new Set<(items: T[]) => void>();

  async function all(): Promise<T[]> {
    const saved = await readJSON<T[] | null>(key, null);
    if (saved) return saved;
    await writeJSON(key, seed);
    return seed;
  }

  async function saveAll(items: T[]) {
    await writeJSON(key, items);
    listeners.forEach((l) => l(items));
  }

  return {
    all,
    async get(id: string) {
      return (await all()).find((i) => i.id === id) ?? null;
    },
    async where(pred: (item: T) => boolean) {
      return (await all()).filter(pred);
    },
    async upsert(item: Omit<T, 'id'> & { id?: string }, prefix = name): Promise<T> {
      const items = await all();
      const full = { ...item, id: item.id ?? newId(prefix) } as T;
      const idx = items.findIndex((i) => i.id === full.id);
      if (idx >= 0) items[idx] = full;
      else items.push(full);
      await saveAll(items);
      return full;
    },
    async update(id: string, patch: Partial<T>) {
      const items = await all();
      const idx = items.findIndex((i) => i.id === id);
      if (idx < 0) return null;
      items[idx] = { ...items[idx], ...patch };
      await saveAll(items);
      return items[idx];
    },
    async remove(id: string) {
      await saveAll((await all()).filter((i) => i.id !== id));
    },
    async replaceAll(items: T[]) {
      await saveAll(items);
    },
    /** Avisa quando a coleção muda neste aparelho (simula o tempo real do Firestore). */
    onChange(listener: (items: T[]) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
