import type { Address, Pet } from '@/types/models';
import { fakeGeocode } from '@/utils/geo';
import type { AddressService, PetService } from '../types';
import { collection } from './collection';
import { delay } from './storage';

const demoPets: Pet[] = [
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
  },
];

const demoAddresses: Address[] = [
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

const petsDb = collection<Pet>('pets', demoPets);
const addressesDb = collection<Address>('addresses', demoAddresses);

export const mockPetService: PetService = {
  list: (ownerId) => petsDb.where((p) => p.ownerId === ownerId),
  get: (id) => petsDb.get(id),
  async save(pet) {
    await delay(250);
    return petsDb.upsert(pet, 'pet');
  },
  remove: (id) => petsDb.remove(id),
};

export const mockAddressService: AddressService = {
  async list(userId) {
    const list = await addressesDb.where((a) => a.userId === userId);
    return list.sort((a, b) => Number(!!b.isDefault) - Number(!!a.isDefault));
  },
  get: (id) => addressesDb.get(id),
  async save(address) {
    await delay(250);
    const coords = address.lat !== undefined ? {} : fakeGeocode(address.zip);
    const existing = await addressesDb.where((a) => a.userId === address.userId);
    // O primeiro endereço vira o padrão automaticamente
    const isDefault = address.isDefault ?? (existing.length === 0 || undefined);
    return addressesDb.upsert({ ...address, ...coords, isDefault }, 'addr');
  },
  async remove(id) {
    const removed = await addressesDb.get(id);
    await addressesDb.remove(id);
    if (removed?.isDefault) {
      const [first] = await addressesDb.where((a) => a.userId === removed.userId);
      if (first) await addressesDb.update(first.id, { isDefault: true });
    }
  },
  async setDefault(userId, id) {
    const all = await addressesDb.all();
    await addressesDb.replaceAll(
      all.map((a) => (a.userId === userId ? { ...a, isDefault: a.id === id } : a)),
    );
  },
};
