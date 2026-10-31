import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const FEATURE_ROUTES = [
  { title: 'Salat & Kiblat', href: '/salat', icon: 'compass-outline' },
  { title: 'Jadwal Tilawah', href: '/jadwal-tilawah', icon: 'calendar-outline' },
  { title: 'Target Khatam', href: '/target-khatam', icon: 'flag-outline' },
  { title: 'Progress Khatam', href: '/progress-khatam', icon: 'analytics-outline' },
  { title: 'Doa Harian', href: '/doa-harian', icon: 'heart-outline' },
  { title: 'Asmaul Husna', href: '/asmaul-husna', icon: 'star-outline' },
  { title: 'Juz 30', href: '/juz-30', icon: 'book-outline' },
  { title: 'Ayat Pilihan', href: '/ayat-pilihan', icon: 'bookmark-outline' },
  { title: 'Tafsir Ringkas', href: '/tafsir-ringkas', icon: 'reader-outline' },
  { title: 'Audio Murottal', href: '/audio-murottal', icon: 'musical-notes-outline' },
  { title: 'Riwayat Bacaan', href: '/riwayat-bacaan', icon: 'time-outline' },
  { title: 'Statistik Tilawah', href: '/statistik-tilawah', icon: 'bar-chart-outline' },
  { title: 'Motivasi Islami', href: '/motivasi-islami', icon: 'sparkles-outline' },
  { title: 'Artikel Islam', href: '/artikel-islam', icon: 'newspaper-outline' },
  { title: 'Kalender Hijriah', href: '/kalender-hijriah', icon: 'moon-outline' },
  { title: 'Pengingat Ibadah', href: '/pengingat-ibadah', icon: 'notifications-outline' },
  { title: 'Profil Pengguna', href: '/profil-pengguna', icon: 'person-outline' },
  { title: 'Edit Profil', href: '/edit-profil', icon: 'create-outline' },
  { title: 'Premium', href: '/premium', icon: 'diamond-outline' },
  { title: 'Login', href: '/login', icon: 'log-in-outline' },
  { title: 'Daftar Akun', href: '/daftar', icon: 'person-add-outline' },
  { title: 'Setelan', href: '/setelan', icon: 'settings-outline' },
  { title: 'Tentang Aplikasi', href: '/tentang-aplikasi', icon: 'information-circle-outline' },
] as const;

export default function FeatureMenuScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isPremium, logout } = useAuth();
  const routes = FEATURE_ROUTES.filter((item) => item.href !== '/login' && item.href !== '/daftar');

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      data={routes}
      keyExtractor={(item) => item.href}
      ListHeaderComponent={
        <View style={{ gap: 6, marginBottom: 14 }}>
          <AppText variant="title">Menu Aplikasi</AppText>
          <AppText color={theme.colors.muted}>{"Akses seluruh fitur pendukung Al-Qur'an Digital."}</AppText>
          <Card style={[styles.accountCard, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={styles.accountHeader}>
              <View style={{ flex: 1 }}>
                <AppText style={{ fontWeight: '900' }}>{user ? user.name : 'Belum login'}</AppText>
                <AppText variant="caption" color={theme.colors.muted}>
                  Status akun: {isPremium ? 'Premium' : 'Gratis'}
                </AppText>
              </View>
              {user ? (
                <Pressable onPress={logout} style={[styles.logout, { backgroundColor: theme.colors.primaryDeep }]}>
                  <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '900' }}>
                    Logout
                  </AppText>
                </Pressable>
              ) : null}
            </View>

            {!user ? (
              <View style={styles.authActions}>
                <Pressable onPress={() => router.push('/login' as never)} style={[styles.primaryAction, { backgroundColor: theme.colors.primaryDeep }]}>
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                  <AppText color="#FFFFFF" style={styles.actionText}>
                    Login
                  </AppText>
                </Pressable>
                <Pressable onPress={() => router.push('/daftar' as never)} style={[styles.secondaryAction, { borderColor: theme.colors.primaryDeep }]}>
                  <Ionicons name="person-add-outline" size={18} color={theme.colors.primaryDeep} />
                  <AppText color={theme.colors.primaryDeep} style={styles.actionText}>
                    Daftar
                  </AppText>
                </Pressable>
              </View>
            ) : null}
          </Card>
        </View>
      }
      renderItem={({ item }) => (
        <Link href={item.href as never} asChild>
          <Pressable>
            <Card style={styles.item}>
              <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name={item.icon} size={21} color={theme.colors.primaryDeep} />
              </View>
              <AppText variant="subtitle" style={{ flex: 1 }}>
                {item.title}
              </AppText>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
            </Card>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 34 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  icon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  accountCard: { marginTop: 12, gap: 14 },
  accountHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  authActions: { flexDirection: 'row', gap: 10 },
  primaryAction: { flex: 1, minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  secondaryAction: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  actionText: { fontWeight: '900' },
  logout: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
});
