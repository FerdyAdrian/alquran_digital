import 'react-native-url-polyfill/auto';
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js';
import sessionStorage from '../storage/sessionStorage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isSupabaseConfigured = Boolean(url && key);
let client: SupabaseClient | undefined;
export function getSupabase() {
  if (!url || !key) throw new Error('Layanan akun belum dihubungkan. Bacaan Al-Qur’an dan jadwal salat tetap bisa digunakan.');
  client ??= createClient(url, key, { auth: { storage: sessionStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, lock: processLock } });
  return client;
}
export async function currentUserId() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error('Silakan login untuk mengakses data akun.');
  return data.user.id;
}
