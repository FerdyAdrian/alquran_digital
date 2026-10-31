import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput } from 'react-native';
import AppText from '../src/components/AppText';
import Card from '../src/components/Card';
import { useTheme } from '../src/context/ThemeContext';
import { getSupabase } from '../src/services/supabase';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; mode?: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const recovery = params.mode === 'recovery';
  const verify = async () => {
    if (!email.includes('@') || !/^\d{6,10}$/.test(code.trim())) { Alert.alert('Periksa email dan kode', 'Masukkan kode yang dikirim ke email kamu.'); return; }
    if (recovery && password.length < 8) { Alert.alert('Password terlalu pendek', 'Gunakan minimal 8 karakter.'); return; }
    setBusy(true);
    try {
      const { error } = await getSupabase().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: recovery ? 'recovery' : 'email' });
      if (error) throw error;
      if (recovery) { const { error: updateError } = await getSupabase().auth.updateUser({ password }); if (updateError) throw updateError; }
      Alert.alert('Berhasil', recovery ? 'Password berhasil diubah.' : 'Email berhasil diverifikasi.');
      router.replace('/(tabs)/menu' as never);
    } catch (error) { Alert.alert('Belum berhasil', error instanceof Error ? error.message : 'Kode tidak valid atau kedaluwarsa. Minta kode baru lalu coba lagi.'); }
    finally { setBusy(false); }
  };
  const input = { minHeight: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, color: theme.colors.text };
  return <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 18, gap: 16 }} keyboardShouldPersistTaps="handled">
    <Card style={{ gap: 14 }}>
      <AppText variant="title">{recovery ? 'Atur password baru' : 'Verifikasi email'}</AppText>
      <AppText>Ketik kode dari email. Periksa folder spam jika pesan belum terlihat.</AppText>
      <TextInput accessibilityLabel="Email akun" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={input} placeholderTextColor={theme.colors.muted} />
      <TextInput accessibilityLabel="Kode dari email" placeholder="Kode verifikasi" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={10} style={input} placeholderTextColor={theme.colors.muted} />
      {recovery ? <TextInput accessibilityLabel="Password baru" placeholder="Password baru, minimal 8 karakter" value={password} onChangeText={setPassword} secureTextEntry style={input} placeholderTextColor={theme.colors.muted} /> : null}
      <Pressable accessibilityRole="button" disabled={busy} onPress={verify} style={{ minHeight: 48, borderRadius: 12, backgroundColor: theme.colors.primarySoft, justifyContent: 'center', alignItems: 'center', opacity: busy ? 0.5 : 1 }}><AppText>{busy ? 'Memeriksa…' : recovery ? 'Simpan password baru' : 'Verifikasi email'}</AppText></Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/login' as never)} style={{ minHeight: 44, justifyContent: 'center' }}><AppText>Kembali ke login</AppText></Pressable>
    </Card>
  </ScrollView>;
}
