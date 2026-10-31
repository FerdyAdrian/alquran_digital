import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { createDeleteHandler } from './handler.ts';

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const url = Deno.env.get('SUPABASE_URL')!;
const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, options);
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, options);
Deno.serve(createDeleteHandler({
  async authenticate(token) {
    const { data, error } = await userClient.auth.getUser(token);
    return error ? null : data.user?.id ?? null;
  },
  async revoke(token) {
    const { error } = await admin.auth.admin.signOut(token, 'global');
    if (error) throw error;
  },
  async remove(userId) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw error;
  },
}));
