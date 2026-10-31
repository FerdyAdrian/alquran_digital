import { getSupabase } from './supabase';
import { localDate } from '../utils/prayer';
export type TilawahScheduleDto = { id: number; title: string; time: string; doneDate?: string };
export type KhatamTargetDto = { days: number; dailyPages: number; pagesRead: number; startDate: string };
export type WorshipReminderDto = { id: number; title: string; time: string; enabled: boolean };
type ScheduleRow = { id: number; title: string; time: string; done_date: string | null };
type TargetRow = { days: number; daily_pages: number; pages_read: number; start_date: string };
type ReminderRow = { id: number; title: string; time: string; enabled: boolean };
const today = () => localDate(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone);
const mapSchedule = (row: ScheduleRow): TilawahScheduleDto => ({ id: row.id, title: row.title, time: row.time.slice(0, 5), doneDate: row.done_date ?? undefined });
const mapTarget = (row: TargetRow): KhatamTargetDto => ({ days: row.days, dailyPages: row.daily_pages, pagesRead: row.pages_read, startDate: row.start_date });
const mapReminder = (row: ReminderRow): WorshipReminderDto => ({ ...row, time: row.time.slice(0, 5) });
export async function getUserFeatures(userId: string) {
  const client = getSupabase();
  const [schedules, target, reminders] = await Promise.all([
    client.from('tilawah_schedules').select('*').eq('user_id', userId).order('time'),
    client.from('khatam_targets').select('*').eq('user_id', userId).maybeSingle(),
    client.from('worship_reminders').select('*').eq('user_id', userId).order('time'),
  ]);
  for (const result of [schedules, target, reminders]) if (result.error) throw result.error;
  return { schedules: (schedules.data as ScheduleRow[]).map(mapSchedule), target: target.data ? mapTarget(target.data) : { days: 30, dailyPages: 20, pagesRead: 0, startDate: today() }, reminders: (reminders.data as ReminderRow[]).map(mapReminder) };
}
export async function createTilawahSchedule(userId: string, title: string, time: string) {
  const { data, error } = await getSupabase().from('tilawah_schedules').insert({ user_id: userId, title, time }).select().single();
  if (error) throw error;
  return mapSchedule(data);
}
export async function toggleTilawahSchedule(_userId: string, scheduleId: number) {
  const { data, error } = await getSupabase().rpc('toggle_tilawah_schedule', { schedule_id: scheduleId, today_date: today() }).single();
  if (error) throw error;
  return mapSchedule(data as ScheduleRow);
}
export async function saveKhatamTarget(userId: string, days: number, dailyPages: number) {
  const { data, error } = await getSupabase().from('khatam_targets').upsert({ user_id: userId, days, daily_pages: dailyPages, pages_read: 0, start_date: today() }).select().single();
  if (error) throw error;
  return mapTarget(data);
}
export async function createKhatamProgress(_userId: string, pagesRead: number) {
  const { error } = await getSupabase().rpc('add_khatam_progress', { pages: pagesRead });
  if (error) throw error;
}
export async function createWorshipReminder(userId: string, title: string, time: string) {
  const { data, error } = await getSupabase().from('worship_reminders').insert({ user_id: userId, title, time }).select().single();
  if (error) throw error;
  return mapReminder(data);
}
export async function toggleWorshipReminder(_userId: string, reminderId: number) {
  const { data, error } = await getSupabase().rpc('toggle_worship_reminder', { reminder_id: reminderId }).single();
  if (error) throw error;
  return mapReminder(data as ReminderRow);
}
