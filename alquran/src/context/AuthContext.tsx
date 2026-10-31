import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { loginUser, mapAuthUser, registerUser, requestPasswordReset, updateUserProfile } from '../services/authApi';
import { getSupabase, isSupabaseConfigured } from '../services/supabase';
import { STORAGE_KEYS } from '../storage/keys';

export type AccountType = 'free' | 'premium';
export type AuthUser = { id: string; name: string; email: string; accountType: AccountType };
type AuthContextValue = {
  user: AuthUser | null;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    // Laravel sessions cannot authenticate to Supabase; keep reading data, discard the old token.
    void AsyncStorage.removeItem(STORAGE_KEYS.authUser).catch(() => {});
    if (!isSupabaseConfigured) return;
    const client = getSupabase();
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => { if (active) setUser(session?.user ? mapAuthUser(session.user) : null); });
    client.auth.getUser().then(({ data }) => { if (active) setUser(data.user ? mapAuthUser(data.user) : null); }).catch(() => { if (active) setUser(null); });
    const refresh = (state: string) => { if (state === 'active') client.auth.startAutoRefresh(); else client.auth.stopAutoRefresh(); };
    refresh(AppState.currentState);
    const listener = AppState.addEventListener('change', refresh);
    return () => { active = false; subscription.unsubscribe(); listener.remove(); client.auth.stopAutoRefresh(); };
  }, []);
  const login = useCallback(async (email: string, password: string) => { setUser(await loginUser(email.trim().toLowerCase(), password)); }, []);
  const register = useCallback(async (name: string, email: string, password: string) => registerUser(name.trim(), email.trim().toLowerCase(), password), []);
  const forgotPassword = useCallback(async (email: string) => requestPasswordReset(email.trim().toLowerCase()), []);
  const logout = useCallback(async () => { const { error } = await getSupabase().auth.signOut(); if (error) throw error; setUser(null); }, []);
  const updateProfile = useCallback(async (name: string, email: string) => {
    if (!user) throw new Error('Silakan login terlebih dahulu.');
    setUser(await updateUserProfile(user.id, name.trim(), email.trim().toLowerCase()));
  }, [user]);
  const value = useMemo(() => ({ user, isPremium: user?.accountType === 'premium', login, register, forgotPassword, logout, updateProfile }), [user, login, register, forgotPassword, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
