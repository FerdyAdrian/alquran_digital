import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerDay } from './prayerTimes';
import { prayerInstant } from '../utils/prayer';

const prefix = 'salat-';
const sound: string = Constants.expoConfig?.extra?.adhanSound ?? 'default';
const channelId = sound === 'default' ? 'salat-v1' : 'salat-adhan-v1';
export async function cancelPrayerReminders() {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(pending.filter(n => n.identifier.startsWith(prefix)).map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function schedulePrayerReminders(days: PrayerDay[]) {
  if (Platform.OS === 'web') throw new Error('Pengingat tersedia di aplikasi Android dan iOS.');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(channelId, {
    name: 'Pengingat waktu salat', importance: Notifications.AndroidImportance.HIGH, sound,
  });
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('Izinkan notifikasi melalui setelan ponsel terlebih dahulu.');
  const items = days.flatMap(day => day.times.map(prayer => ({ day, prayer, date: prayerInstant(day, prayer.time) }))).filter(item => item.date.getTime() > Date.now());
  if (!items.length) throw new Error('Tidak ada jadwal mendatang. Muat ulang jadwal.');
  await cancelPrayerReminders();
  try {
    for (const { day, prayer, date } of items) await Notifications.scheduleNotificationAsync({
      identifier: `${prefix}${day.date}-${prayer.name}`,
      content: { title: `Waktunya salat ${prayer.name}`, body: `${prayer.time} (${day.timezone}). Mari bersiap untuk salat.`, sound },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId },
    });
  } catch (error) {
    await cancelPrayerReminders();
    throw error;
  }
  return items.length;
}
