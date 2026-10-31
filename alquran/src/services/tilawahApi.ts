import { TilawahNote } from '../types';
import { currentUserId, getSupabase } from './supabase';
type NoteRow = { id: number; surah_name: string; ayah_count: number; read_date: string; created_at: string };
function mapNote(row: NoteRow): TilawahNote {
  return { id: row.id, surahName: row.surah_name, ayahCount: String(row.ayah_count), readDate: row.read_date, createdAt: row.created_at };
}
export async function getTilawahNotes() {
  const userId = await currentUserId();
  const { data, error } = await getSupabase().from('tilawah_notes').select('*').eq('user_id', userId).order('read_date', { ascending: false }).order('id', { ascending: false });
  if (error) throw error;
  return (data as NoteRow[]).map(mapNote);
}
export async function createTilawahNote(note: Pick<TilawahNote, 'surahName' | 'ayahCount' | 'readDate'>) {
  const { data, error } = await getSupabase().from('tilawah_notes').insert({ user_id: await currentUserId(), surah_name: note.surahName, ayah_count: Number(note.ayahCount), read_date: note.readDate }).select().single();
  if (error) throw error;
  return mapNote(data);
}
export async function updateTilawahNote(id: string | number, note: Pick<TilawahNote, 'surahName' | 'ayahCount' | 'readDate'>) {
  const { data, error } = await getSupabase().from('tilawah_notes').update({ surah_name: note.surahName, ayah_count: Number(note.ayahCount), read_date: note.readDate }).eq('id', id).eq('user_id', await currentUserId()).select().single();
  if (error) throw error;
  return mapNote(data);
}
export async function deleteTilawahNote(id: string | number) {
  const { data, error } = await getSupabase().from('tilawah_notes').delete().eq('id', id).eq('user_id', await currentUserId()).select('id').single();
  if (error || !data) throw error ?? new Error('Catatan tidak ditemukan.');
}
