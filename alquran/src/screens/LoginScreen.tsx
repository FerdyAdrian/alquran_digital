import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password.trim()) {
      Alert.alert('Mohon lengkapi semua data');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Email belum valid', 'Gunakan format email yang benar.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(trimmedEmail, password);
      Alert.alert('Login berhasil', 'Selamat datang kembali.');
      router.replace('/(tabs)/menu' as never);
    } catch (error) {
      Alert.alert('Login gagal', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Card style={[styles.hero, { backgroundColor: theme.colors.primaryDeep }]}>
          <AppText variant="title" color="#FFFFFF">
            Masuk Akun
          </AppText>
          <AppText color="#E7FFF4">Masuk untuk menyimpan profil dan mengakses fitur premium.</AppText>
        </Card>

        <Card style={styles.form}>
          <View style={styles.field}>
            <AppText style={styles.label}>Email</AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="contoh@email.com"
              placeholderTextColor={theme.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
          </View>

          <View style={styles.field}>
            <AppText style={styles.label}>Password</AppText>
            <View style={[styles.passwordWrap, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan password"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                style={[styles.passwordInput, { color: theme.colors.text }]}
              />
              <Pressable onPress={() => setShowPassword((value) => !value)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.muted} />
              </Pressable>
            </View>
          </View>

          <Pressable
            disabled={isSubmitting}
            onPress={submit}
            style={({ pressed }) => [styles.button, { backgroundColor: theme.colors.primaryDeep, opacity: pressed || isSubmitting ? 0.72 : 1 }]}>
            <AppText color="#FFFFFF" style={styles.buttonText}>
              {isSubmitting ? 'Memproses...' : 'Login'}
            </AppText>
          </Pressable>

          <View style={styles.links}>
            <Link href={'/lupa-password' as never} asChild>
              <Pressable>
                <AppText color={theme.colors.primaryDeep} style={styles.linkText}>
                  Lupa password?
                </AppText>
              </Pressable>
            </Link>
            <Link href={'/daftar' as never} asChild>
              <Pressable>
                <AppText color={theme.colors.primaryDeep} style={styles.linkText}>
                  Daftar akun baru
                </AppText>
              </Pressable>
            </Link>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 18, gap: 14, justifyContent: 'center' },
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
  links: { gap: 10, alignItems: 'center', marginTop: 6 },
  linkText: { fontWeight: '900' },
});
