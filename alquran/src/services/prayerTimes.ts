import { create } from 'axios';

export type PrayerTime = {
  name: string;
  time: string;
};

export const INDONESIAN_PRAYER_CITIES = [
  'Jakarta',
  'Bandung',
  'Bekasi',
  'Bogor',
  'Depok',
  'Tangerang',
  'Surabaya',
  'Sidoarjo',
  'Malang',
  'Yogyakarta',
  'Semarang',
  'Solo',
  'Medan',
  'Padang',
  'Pekanbaru',
  'Palembang',
  'Bandar Lampung',
  'Pontianak',
  'Banjarmasin',
  'Balikpapan',
  'Makassar',
  'Manado',
  'Denpasar',
  'Mataram',
  'Kupang',
  'Ambon',
  'Jayapura',
];

const prayerApi = create({
  baseURL: 'https://api.aladhan.com/v1',
  timeout: 10000,
});

export type PrayerDay = { times: PrayerTime[]; date: string; timezone: string };

type PrayerLocation = { city: string } | { latitude: number; longitude: number };

export async function getPrayerDay(location: PrayerLocation, date: string): Promise<PrayerDay> {
  const [year, month, day] = date.split('-');
  const byCity = 'city' in location;
  const { data } = await prayerApi.get(`/${byCity ? 'timingsByCity' : 'timings'}/${day}-${month}-${year}`, {
    params: { ...location, ...(byCity ? { country: 'Indonesia' } : {}), method: 20 },
  });
  const result = data?.data;
  const names = [['Subuh', 'Fajr'], ['Dzuhur', 'Dhuhr'], ['Asar', 'Asr'], ['Maghrib', 'Maghrib'], ['Isya', 'Isha']];
  const times = names.map(([name, key]) => ({ name, time: String(result?.timings?.[key] ?? '').split(' ')[0] }));
  if (data?.code !== 200 || !result?.meta?.timezone || times.some(({ time }) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) {
    throw new Error('Jadwal tidak valid. Coba lagi atau pilih kota lain.');
  }
  new Intl.DateTimeFormat('id-ID', { timeZone: result.meta.timezone }).format(new Date());
  return { times, date, timezone: result.meta.timezone };
}
