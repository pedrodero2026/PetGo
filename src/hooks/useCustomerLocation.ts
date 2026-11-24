import { addressService } from '@/services';
import { useAuth } from '@/store/auth';
import type { Address } from '@/types/models';
import { DEFAULT_LOCATION, type LatLng } from '@/utils/geo';
import { useAsync } from './useAsync';

/**
 * Localização usada para calcular distâncias: o endereço padrão do cliente.
 * Sem endereço, usa o centro padrão (Av. Paulista).
 */
export function useCustomerLocation(): { address?: Address; location: LatLng; loading: boolean } {
  const userId = useAuth((s) => s.user?.id);
  const { data, loading } = useAsync(
    () => (userId ? addressService.list(userId) : Promise.resolve([])),
    [userId],
  );
  const address = data?.find((a) => a.isDefault) ?? data?.[0];
  const location =
    address?.lat !== undefined && address.lng !== undefined
      ? { lat: address.lat, lng: address.lng }
      : DEFAULT_LOCATION;
  return { address, location, loading };
}
