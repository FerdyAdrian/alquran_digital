import { PrayerDay } from '../services/prayerTimes';

export function localDate(now: Date, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function prayerInstant(day: PrayerDay, time: string) {
  const wall = Date.parse(`${day.date}T${time}:00Z`);
  let instant = wall;
  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: day.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant));
    const part = (name: string) => parts.find(p => p.type === name)!.value;
    const represented = Date.parse(`${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}Z`);
    instant += wall - represented;
  }
  return new Date(instant);
}

export function qiblaBearing(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error('Koordinat tidak valid.');
  const rad = Math.PI / 180;
  const lat = latitude * rad;
  const kaaba = 21.422487 * rad;
  const delta = (39.826206 - longitude) * rad;
  return (Math.atan2(Math.sin(delta), Math.cos(lat) * Math.tan(kaaba) - Math.sin(lat) * Math.cos(delta)) / rad + 360) % 360;
}
