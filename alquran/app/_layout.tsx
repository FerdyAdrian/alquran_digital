import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import MiniPlayer from '../src/components/MiniPlayer';
import { AudioProvider } from '../src/context/AudioContext';
import { AuthProvider } from '../src/context/AuthContext';
import { BookmarkProvider } from '../src/context/BookmarkContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

function RootStack() {
  const { theme, mode } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: theme.colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detail-surat/[surahNumber]" options={{ title: 'Detail Surat' }} />
        <Stack.Screen name="kebijakan-privasi" options={{ title: 'Kebijakan Privasi' }} />
        <Stack.Screen name="salat" options={{ title: 'Salat & Kiblat' }} />
        <Stack.Screen name="jadwal-tilawah" options={{ title: 'Jadwal Tilawah' }} />
        <Stack.Screen name="target-khatam" options={{ title: 'Target Khatam' }} />
        <Stack.Screen name="progress-khatam" options={{ title: 'Progress Khatam' }} />
        <Stack.Screen name="doa-harian" options={{ title: 'Doa Harian' }} />
        <Stack.Screen name="asmaul-husna" options={{ title: 'Asmaul Husna' }} />
        <Stack.Screen name="juz-30" options={{ title: 'Juz 30' }} />
        <Stack.Screen name="ayat-pilihan" options={{ title: 'Ayat Pilihan' }} />
        <Stack.Screen name="tafsir-ringkas" options={{ title: 'Tafsir Ringkas' }} />
        <Stack.Screen name="audio-murottal" options={{ title: 'Audio Murottal' }} />
        <Stack.Screen name="riwayat-bacaan" options={{ title: 'Riwayat Bacaan' }} />
        <Stack.Screen name="statistik-tilawah" options={{ title: 'Statistik Tilawah' }} />
        <Stack.Screen name="motivasi-islami" options={{ title: 'Motivasi Islami' }} />
        <Stack.Screen name="artikel-islam" options={{ title: 'Artikel Islam' }} />
        <Stack.Screen name="kalender-hijriah" options={{ title: 'Kalender Hijriah' }} />
        <Stack.Screen name="pengingat-ibadah" options={{ title: 'Pengingat Ibadah' }} />
        <Stack.Screen name="profil-pengguna" options={{ title: 'Profil Pengguna' }} />
        <Stack.Screen name="edit-profil" options={{ title: 'Edit Profil' }} />
        <Stack.Screen name="setelan" options={{ title: 'Setelan' }} />
        <Stack.Screen name="tentang-aplikasi" options={{ title: 'Tentang Aplikasi' }} />
        <Stack.Screen name="verifikasi-email" options={{ title: 'Verifikasi Email' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="daftar" options={{ title: 'Daftar' }} />
        <Stack.Screen name="lupa-password" options={{ title: 'Lupa Password' }} />
        <Stack.Screen name="premium" options={{ title: 'Premium' }} />
      </Stack>
      <MiniPlayer />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookmarkProvider>
          <AudioProvider>
            <RootStack />
          </AudioProvider>
        </BookmarkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
