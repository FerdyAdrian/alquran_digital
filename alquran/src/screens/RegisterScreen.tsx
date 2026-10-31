import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Mohon lengkapi semua data');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Email belum valid', 'Gunakan format email yang benar.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Password terlalu pendek', 'Gunakan minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password belum sama', 'Konfirmasi password harus sama dengan password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const signedIn = await register(trimmedName, trimmedEmail, password);
      Alert.alert('Pendaftaran diproses', signedIn ? 'Akun berhasil dibuat.' : 'Periksa email untuk konfirmasi akun sebelum login.');
      router.replace((signedIn ? '/(tabs)/menu' : `/verifikasi-email?email=${encodeURIComponent(trimmedEmail)}`) as never);
    } catch (error) {
      Alert.alert('Daftar gagal', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.hero, { backgroundColor: theme.colors.primaryDeep }]}>
        <AppText variant="title" color="#FFFFFF">
          Daftar Akun
        </AppText>
        <AppText color="#E7FFF4">Buat akun gratis untuk mulai memakai fitur dasar aplikasi.</AppText>
      </Card>

      <Card style={styles.form}>
        <View style={styles.field}>
          <AppText style={styles.label}>Nama</AppText>
          <TextInput value={name} onChangeText={setName} placeholder="Nama lengkap" placeholderTextColor={theme.colors.muted} style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]} />
        </View>
        <View style={styles.field}>
          <AppText style={styles.label}>Email</AppText>
          <TextInput value={email} onChangeText={setEmail} placeholder="contoh@email.com" placeholderTextColor={theme.colors.muted} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]} />
        </View>
        <View style={styles.field}>
          <AppText style={styles.label}>Password</AppText>
          <View style={[styles.passwordWrap, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
            <TextInput value={password} onChangeText={setPassword} placeholder="Minimal 6 karakter" placeholderTextColor={theme.colors.muted} secureTextEntry={!showPassword} style={[styles.passwordInput, { color: theme.colors.text }]} />
            <Pressable onPress={() => setShowPassword((value) => !value)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.muted} />
            </Pressable>
          </View>
        </View>
        <View style={styles.field}>
          <AppText style={styles.label}>Konfirmasi Password</AppText>
          <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Ulangi password" placeholderTextColor={theme.colors.muted} secureTextEntry={!showPassword} style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]} />
        </View>

        <Pressable
          disabled={isSubmitting}
          onPress={submit}
          style={({ pressed }) => [styles.button, { backgroundColor: theme.colors.primaryDeep, opacity: pressed || isSubmitting ? 0.72 : 1 }]}>
          <AppText color="#FFFFFF" style={styles.buttonText}>
            {isSubmitting ? 'Membuat akun...' : 'Daftar'}
          </AppText>
        </Pressable>

        <Link href={'/login' as never} asChild>
          <Pressable style={{ alignItems: 'center' }}>
            <AppText color={theme.colors.primaryDeep} style={styles.linkText}>
              Sudah punya akun? Login
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
  passwordWrap: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingLeft: 16, paddingRight: 8, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, minHeight: 50, fontSize: 15, fontWeight: '600' },
  eyeButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  buttonText: { fontWeight: '900', fontSize: 15 },
  linkText: { fontWeight: '900' },
});
