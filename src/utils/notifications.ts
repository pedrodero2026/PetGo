import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';

import type { FoodStatus } from './food';

const enabled = Platform.OS !== 'web';
let configured = false;

/** Mostra notificações também com o app aberto e cria o canal no Android. */
async function setup(): Promise<boolean> {
  if (!enabled) return false;
  if (!configured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('lembretes', {
        name: 'Lembretes de ração',
        importance: AndroidImportance.DEFAULT,
      });
    }
    configured = true;
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

const DAY = 24 * 3600 * 1000;
const REMIND_DAYS_BEFORE = 3;

/**
 * Agenda (de novo) os lembretes locais "a ração do X está acabando".
 * Cancela os anteriores para não duplicar. Na web não faz nada.
 */
export async function scheduleFoodReminders(statuses: FoodStatus[]) {
  try {
    if (!(await setup())) return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.content.data?.kind === 'food')
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
    for (const s of statuses) {
      const at = new Date(new Date(s.runOutAt).getTime() - REMIND_DAYS_BEFORE * DAY);
      at.setHours(10, 0, 0, 0);
      if (at.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `A ração de ${s.pet.name} está acabando 🐾`,
          body: `Faltam cerca de ${REMIND_DAYS_BEFORE} dias. Peça agora e receba sem correria.`,
          data: { kind: 'food', petId: s.pet.id },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'lembretes' },
      });
    }
  } catch {
    // Notificação é um extra: se falhar (ex.: permissão negada), o app segue normalmente
  }
}

/** Notificação imediata (ex.: pedido da assinatura criado). */
export async function notifyNow(title: string, body: string) {
  try {
    if (!(await setup())) return;
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch {
    // ignora
  }
}
