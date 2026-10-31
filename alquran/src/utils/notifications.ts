import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { STORAGE_KEYS } from '../storage/keys';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function initializeNotifications() {
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    await Notifications.requestPermissionsAsync();
  }
}

export async function scheduleDailyReminder(hour = 5, minute = 0) {
  await initializeNotifications();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Saatnya tilawah',
      body: 'Luangkan beberapa menit untuk membaca dan merenungi Al-Qur\'an hari ini.',
      sound: true,
    },
    trigger: { hour, minute, repeats: true } as Notifications.NotificationTriggerInput,
  });
  await AsyncStorage.setItem(STORAGE_KEYS.reminder, JSON.stringify({ id, hour, minute, enabled: true }));
  return id;
}

export async function cancelDailyReminder() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.reminder);
  if (raw) {
    const data = JSON.parse(raw);
    if (data.id) await Notifications.cancelScheduledNotificationAsync(data.id);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.reminder, JSON.stringify({ enabled: false }));
}
