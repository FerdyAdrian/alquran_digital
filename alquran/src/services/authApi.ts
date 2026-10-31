import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '../context/AuthContext';
import { getSupabase } from './supabase';

export function mapAuthUser(user: User): AuthUser {
  return { id: user.id, name: String(user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna'), email: user.email ?? '', accountType: user.app_metadata?.account_type === 'premium' ? 'premium' : 'free' };
}
export async function loginUser(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return mapAuthUser(data.user);
}
export async function registerUser(name: string, email: string, password: string) {
  const { data, error } = await getSupabase().auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw new Error(error.message);
  return Boolean(data.session);
}
export async function requestPasswordReset(email: string) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}
export async function updateUserProfile(_userId: string, name: string, email: string) {
  const { data, error } = await getSupabase().auth.updateUser({ email, data: { name } });
  if (error) throw new Error(error.message);
  return mapAuthUser(data.user);
}
export async function deleteAccount() {
  const { data, error } = await getSupabase().functions.invoke('delete-account');
  if (error || !data?.deleted) throw new Error('Akun belum berhasil dihapus. Coba lagi atau hubungi dukungan.');
  await getSupabase().auth.signOut({ scope: 'local' });
}
