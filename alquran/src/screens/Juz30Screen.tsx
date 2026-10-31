import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { useAudioPlayer } from '../context/AudioContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';
import { useQari } from '../hooks/useQari';
import { useSurahList } from '../hooks/useSurah';
import { getSurahDetail } from '../services/api';
import { getAyahAudioForQari, getQariOption, getSurahAudioForQari } from '../services/qariAudio';
import { SurahSummary } from '../types';

export default function Juz30Screen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { surahs, loading, refreshing, error, refresh } = useSurahList();
  const { selectedQari } = useQari();
  const { playUrl, pause, currentUrl, isPlaying } = useAudioPlayer();
  const { isFavoriteSurah, toggleFavoriteSurah } = useBookmarks();
  const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const juz30Surahs = surahs.filter((surah) => surah.nomor >= 78 && surah.nomor <= 114);
  const activeQari = getQariOption(selectedQari);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const openSurah = (surahNumber: number) => {
    router.push(`/detail-surat/${surahNumber}` as never);
  };

  const playSurah = async (surah: SurahSummary) => {
    try {
      setLoadingAudio(surah.nomor);
      const detail = await getSurahDetail(surah.nomor);
      const fullAudio = getSurahAudioForQari(detail, selectedQari);
      const firstAyahAudio = detail.ayat[0] ? getAyahAudioForQari(detail.ayat[0], detail.nomor, selectedQari) : undefined;
      const audioUrl = fullAudio ?? firstAyahAudio;

      if (!audioUrl) {
        Alert.alert('Audio belum tersedia', 'Audio untuk surat ini belum bisa diputar.');
        return;
      }

      if (currentUrl === audioUrl && isPlaying) {
        await pause();
      } else {
        await playUrl(audioUrl);
        showToast(`Memutar ${surah.namaLatin}`);
      }
    } catch {
      Alert.alert('Gagal memutar audio', 'Periksa koneksi internet atau coba lagi nanti.');
    } finally {
      setLoadingAudio(null);
    }
  };

  const renderSurah = ({ item }: { item: SurahSummary }) => {
    const favorite = isFavoriteSurah(item.nomor);

    return (
      <Card style={styles.surahCard}>
        <View style={styles.surahTop}>
          <View style={[styles.numberBadge, { backgroundColor: theme.colors.primarySoft }]}>
            <AppText color={theme.colors.primaryDeep} style={{ fontWeight: '900' }}>
              {item.nomor}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="subtitle">{item.namaLatin}</AppText>
            <AppText variant="caption" color={theme.colors.muted}>
              {item.arti} - {item.tempatTurun} - {item.jumlahAyat} ayat
            </AppText>
          </View>
          <AppText color={theme.colors.primary} style={styles.arabName}>
            {item.nama}
          </AppText>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => openSurah(item.nomor)} style={[styles.primaryButton, { backgroundColor: theme.colors.primaryDeep }]}>
            <Ionicons name="book-outline" size={17} color="#FFFFFF" />
            <AppText color="#FFFFFF" style={styles.buttonText}>
              Baca
            </AppText>
          </Pressable>
          <Pressable onPress={() => playSurah(item)} style={[styles.secondaryButton, { backgroundColor: theme.colors.primarySoft }]}>
            <Ionicons name={loadingAudio === item.nomor ? 'hourglass-outline' : 'volume-high-outline'} size={17} color={theme.colors.primaryDeep} />
            <AppText color={theme.colors.primaryDeep} style={styles.buttonText}>
              {loadingAudio === item.nomor ? 'Memuat' : 'Dengarkan'}
            </AppText>
          </Pressable>
          <Pressable
            onPress={async () => {
              const added = await toggleFavoriteSurah(item.nomor);
              showToast(added ? 'Surat favorit ditambahkan' : 'Surat favorit dihapus');
            }}
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name={favorite ? 'star' : 'star-outline'} size={19} color={favorite ? theme.colors.gold : theme.colors.muted} />
          </Pressable>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={juz30Surahs}
        keyExtractor={(item) => String(item.nomor)}
        renderItem={renderSurah}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={styles.header}>
            <Card style={[styles.hero, { backgroundColor: theme.colors.primaryDeep }]}>
              <View style={[styles.heroIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="book-outline" size={28} color="#FFFFFF" />
              </View>
              <AppText variant="title" color="#FFFFFF">
                Juz 30
              </AppText>
              <AppText color="#E7FFF4">
                Kumpulan surat Juz Amma untuk dibaca, dihafal, dan didengarkan dengan qari pilihan.
              </AppText>
              <AppText variant="caption" color="#E7FFF4">
                Qari aktif: {activeQari.label}
              </AppText>
            </Card>
            {error ? (
              <Card>
                <AppText color={theme.colors.danger}>{error}</AppText>
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <Card>
              <AppText color={theme.colors.muted}>Memuat daftar Juz 30...</AppText>
            </Card>
          ) : null
        }
      />
      <Toast message={toast} visible={Boolean(toast)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 18, gap: 12, paddingBottom: 34 },
  header: { gap: 14 },
  hero: { gap: 10, borderRadius: 20 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  surahCard: { gap: 14 },
  surahTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numberBadge: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  arabName: { fontSize: 24, lineHeight: 34, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryButton: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  secondaryButton: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  iconButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontWeight: '900' },
});
