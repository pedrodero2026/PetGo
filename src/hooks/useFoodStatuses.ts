import { useEffect, useMemo } from 'react';

import { catalogService, orderService, petService } from '@/services';
import type { Pet } from '@/types/models';
import { foodStatusFor, type FoodStatus } from '@/utils/food';
import { scheduleFoodReminders } from '@/utils/notifications';
import { useAsync } from './useAsync';

/**
 * Situação da ração de cada pet do cliente e agendamento dos lembretes locais.
 * Recalcula ao voltar para a tela (ex.: depois de um pedido ser entregue).
 */
export function useFoodStatuses(userId: string, opts: { schedule?: boolean } = {}) {
  const { data, loading, reload } = useAsync(async () => {
    const [pets, orders, products] = await Promise.all([
      petService.list(userId),
      orderService.listByCustomer(userId),
      catalogService.listProducts({ categoryId: 'racao' }),
    ]);
    return { pets, orders, products };
  }, [userId]);

  const statuses = useMemo(() => {
    if (!data) return [];
    return data.pets
      .map((p: Pet) => foodStatusFor(p, data.orders, data.products))
      .filter((s): s is FoodStatus => !!s)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [data]);

  const schedule = opts.schedule;
  useEffect(() => {
    if (schedule && statuses.length) scheduleFoodReminders(statuses);
  }, [schedule, statuses]);

  return { statuses, pets: data?.pets ?? [], loading, reload };
}
