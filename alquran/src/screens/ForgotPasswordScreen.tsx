import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert('Mohon isi email');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Email belum valid', 'Gunakan format email yang benar.');
      return;
    }

    try {
      setIsSubmitting(true);
      await forgotPassword(trimmedEmail);
      Alert.alert('Periksa email', 'Jika akun terdaftar, kode pemulihan akan dikirim ke email kamu.');
      router.push(`/verifikasi-email?mode=recovery&email=${encodeURIComponent(trimmedEmail)}` as never);
    } catch (error) {
      Alert.alert('Reset gagal', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.hero, { backgroundColor: theme.colors.primaryDeep }]}>
        <AppText variant="title" color="#FFFFFF">
          Lupa Password
        </AppText>
        <AppText color="#E7FFF4">Masukkan email akun untuk membuat permintaan reset password.</AppText>
      </Card>

      <Card style={styles.form}>
        <View style={styles.field}>
          <AppText style={styles.label}>Email</AppText>
          <TextInput value={email} onChangeText={setEmail} placeholder="contoh@email.com" placeholderTextColor={theme.colors.muted} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]} />
        </View>

        <Pressable
          disabled={isSubmitting}
          onPress={submit}
          style={({ pressed }) => [styles.button, { backgroundColor: theme.colors.primaryDeep, opacity: pressed || isSubmitting ? 0.72 : 1 }]}>
          <AppText color="#FFFFFF" style={styles.buttonText}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Reset Password'}
          </AppText>
        </Pressable>

        <Link href={'/login' as never} asChild>
          <Pressable style={{ alignItems: 'center' }}>
            <AppText color={theme.colors.primaryDeep} style={styles.linkText}>
              Kembali ke Login
            </AppText>
          </Pressable>
        </Link>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 14, justifyContent: 'center' },
  hero: { gap: 8, borderRadius: 20 },
  form: { gap: 14 },
  field: { gap: 8 },
  label: { fontWeight: '900' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, fontWeight: '600' },
  button: { minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  buttonText: { fontWeight: '900', fontSize: 15 },
  linkText: { fontWeight: '900' },
});
