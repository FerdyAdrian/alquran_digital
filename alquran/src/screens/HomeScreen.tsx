import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';

import AdBanner from '../components/AdBanner';
import AppText from '../components/AppText';
import Card from '../components/Card';
import SurahListItem from '../components/SurahListItem';
import { SurahSkeleton } from '../components/Skeleton';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';
import { useSearchSurah, useSurahList } from '../hooks/useSurah';
import { SurahSummary } from '../types';

const dailyAyat = [
  'Sesungguhnya bersama kesulitan ada kemudahan. (Al-Insyirah: 6)',
  'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram. (Ar-Ra\'d: 28)',
  'Maka nikmat Tuhanmu yang manakah yang kamu dustakan? (Ar-Rahman: 13)',
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { lastRead } = useBookmarks();
  const { surahs, loading, refreshing, error, refresh } = useSurahList();
  const [query, setQuery] = useState('');
  const filtered = useSearchSurah(surahs, query);
  const ayatToday = useMemo(() => dailyAyat[new Date().getDate() % dailyAyat.length], []);
  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View>
        <AppText color={theme.colors.muted}>{"Assalaamu'alaikum Wr.Wb"}</AppText>
        <AppText color={theme.colors.muted}>{"Selamat datang di Al-Qur’an Digital."}</AppText>
        <AppText variant="title">{'Dekat dengan Al-Qur’an, setiap hari.'}</AppText>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Lanjutkan membaca Al-Qur’an" onPress={() => router.push(`/detail-surat/${lastRead?.surahNumber ?? 1}` as never)}>
      <LinearGradient colors={[theme.colors.primaryDeep, theme.colors.primary]} style={styles.hero}>
        <View style={{ flex: 1, gap: 8 }}>
          <AppText variant="subtitle" color="#FFFFFF">
            Lanjutkan Membaca
          </AppText>
          <AppText color="#E7FFF4">
            {lastRead ? `${lastRead.surahName} ayat ${lastRead.ayahNumber}` : 'Belum ada riwayat. Mulai dari Al-Fatihah.'}
          </AppText>
        </View>
        <AppText color={theme.colors.gold} style={styles.heroArabic}>
          اقرأ
        </AppText>
      </LinearGradient>
      </Pressable>

      <Card style={{ backgroundColor: theme.colors.surfaceAlt }}>
        <AppText variant="subtitle">Ayat harian</AppText>
        <AppText color={theme.colors.muted} style={{ marginTop: 6 }}>
          {ayatToday}
        </AppText>
      </Card>

      <Pressable accessibilityRole="button" onPress={() => router.push('/salat' as never)}>
        <Card style={{ backgroundColor: theme.colors.surfaceAlt, gap: 8 }}>
          <AppText variant="subtitle">Salat & Kiblat</AppText>
          <AppText color={theme.colors.muted}>Cek waktu salat, temukan arah kiblat, dan atur pengingat.</AppText>
          <AppText style={{ fontWeight: '800' }}>Buka jadwal salat</AppText>
        </Card>
      </Pressable>

      <Card>
        <AppText variant="subtitle">Motivasi Islami</AppText>
        <AppText color={theme.colors.muted} style={{ marginTop: 6 }}>
        Capek boleh, nyerah jangan. Allah nggak janjiin hidup bakal mudah, tapi Allah janji bakal selalu ada.
        </AppText>
      </Card>

      <AdBanner />

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Cari nama surah atau arti..."
        placeholderTextColor={theme.colors.muted}
        style={[styles.search, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
      />
      <AppText variant="subtitle">Daftar Surah</AppText>
      {error ? <AppText color={theme.colors.danger}>{error}</AppText> : null}
    </View>
  );

  return (
    <FlatList<SurahSummary>
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      data={filtered}
      keyExtractor={(item) => String(item.nomor)}
      renderItem={({ item }) => <SurahListItem surah={item} onPress={() => router.push(`/detail-surat/${item.nomor}` as never)} />}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={loading ? <View>{[1, 2, 3].map(item => <SurahSkeleton key={item} />)}</View> : <AppText color={theme.colors.muted}>Tidak ada surah yang cocok. Coba kata lain.</AppText>}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
      initialNumToRender={14}
      windowSize={8}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 28 },
  headerWrap: { gap: 16, marginBottom: 12 },
  hero: { minHeight: 136, borderRadius: 28, padding: 20, flexDirection: 'row', alignItems: 'center' },
  heroArabic: { fontSize: 42, lineHeight: 60, fontWeight: '900' },
  search: { height: 50, borderWidth: 1, borderRadius: 18, paddingHorizontal: 16, fontSize: 14, fontWeight: '600' },
});
