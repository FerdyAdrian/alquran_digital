import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, PanResponder, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import AyahCard from '../components/AyahCard';
import Card from '../components/Card';
import IconButton from '../components/IconButton';
import Toast from '../components/Toast';
import { useAudioPlayer } from '../context/AudioContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';
import { useQari } from '../hooks/useQari';
import { useSurahDetail } from '../hooks/useSurah';
import { getAyahAudioForQari, getQariOption, getSurahAudioForQari } from '../services/qariAudio';

export default function DetailSurahScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ surahNumber?: string }>();
  const surahNumber = Number(params.surahNumber ?? 1);
  const { theme } = useTheme();
  const { surah, loading, refreshing, error, refresh } = useSurahDetail(surahNumber);
  const { playUrl, pause, stop, currentUrl, isPlaying, progress } = useAudioPlayer();
  const { toggleFavoriteSurah, isFavoriteSurah, markLastRead } = useBookmarks();
  const { selectedQari } = useQari();
  const [toast, setToast] = useState('');
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    if (!surah) return;
    markLastRead({
      surahNumber: surah.nomor,
      surahName: surah.namaLatin,
      ayahNumber: 1,
      updatedAt: new Date().toISOString(),
    });
  }, [markLastRead, surah]);

  const fullAudio = getSurahAudioForQari(surah, selectedQari);
  const isFullPlaying = currentUrl === fullAudio && isPlaying;
  const favorite = surah ? isFavoriteSurah(surah.nomor) : false;
  const activeQari = getQariOption(selectedQari);

  const description = useMemo(() => {
    if (!surah?.deskripsi) return '';
    return surah.deskripsi.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').slice(0, 260);
  }, [surah?.deskripsi]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const playAll = async (index = 0) => {
    if (!surah?.ayat[index]) return;
    const ayah = surah.ayat[index];
    const url = getAyahAudioForQari(ayah, surah.nomor, selectedQari);
    if (!url) return;
    setSequenceIndex(index);
    await markLastRead({
      surahNumber: surah.nomor,
      surahName: surah.namaLatin,
      ayahNumber: ayah.nomorAyat,
      updatedAt: new Date().toISOString(),
    });
    await playUrl(url, () => {
      if (index + 1 < surah.ayat.length) playAll(index + 1);
    });
  };

  const navigateRelative = (next: number) => {
    if (next >= 1 && next <= 114) router.replace(`/detail-surat/${next}` as never);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 40 && Math.abs(gesture.dy) < 20,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -60) navigateRelative(surahNumber + 1);
      if (gesture.dx > 60) navigateRelative(surahNumber - 1);
    },
  });

  if (loading || !surah) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detail Surat' }} />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Card>
            <AppText variant="subtitle">{error ?? 'Memuat detail surah...'}</AppText>
            <AppText color={theme.colors.muted}>Data akan memakai cache offline jika tersedia.</AppText>
          </Card>
        </View>
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} {...panResponder.panHandlers}>
      <Stack.Screen options={{ title: surah.namaLatin }} />
      <FlatList
        contentContainerStyle={styles.container}
        data={surah.ayat}
        keyExtractor={(item) => String(item.nomorAyat)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 10 }}>
            <LinearGradient colors={[theme.colors.primaryDeep, theme.colors.primary]} style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={{ flex: 1 }}>
                  <AppText color="#E7FFF4">Surah ke-{surah.nomor} - Juz {Math.ceil(surah.nomor / 7.2)}</AppText>
                  <AppText variant="title" color="#FFFFFF">
                    {surah.namaLatin}
                  </AppText>
                  <AppText color="#E7FFF4">
                    {surah.arti} - {surah.tempatTurun} - {surah.jumlahAyat} ayat
                  </AppText>
                </View>
                <AppText color={theme.colors.gold} style={styles.bigArab}>
                  {surah.nama}
                </AppText>
              </View>

              <View style={styles.playerRow}>
                <Pressable
                  onPress={() => (isFullPlaying ? pause() : fullAudio ? playUrl(fullAudio) : playAll(0))}
                  style={[styles.primaryButton, { backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name={isFullPlaying ? 'pause' : 'play'} size={19} color={theme.colors.primaryDeep} />
                  <AppText color={theme.colors.primaryDeep} style={{ fontWeight: '800' }}>
                    {isFullPlaying ? 'Pause' : 'Play'}
                  </AppText>
                </Pressable>
                <IconButton name="pause" onPress={pause} />
                <IconButton name="stop" onPress={stop} />
                <IconButton
                  name={favorite ? 'star' : 'star-outline'}
                  active={favorite}
                  onPress={async () => {
                    const added = await toggleFavoriteSurah(surah.nomor);
                    showToast(added ? 'Surah favorit ditambahkan' : 'Surah favorit dihapus');
                  }}
                />
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progress, { width: `${progress * 100}%`, backgroundColor: theme.colors.gold }]} />
              </View>
              <AppText color="#E7FFF4">
                Status: {isPlaying ? 'Sedang diputar' : 'Berhenti'} - Qari: {activeQari.label}
              </AppText>
            </LinearGradient>

            <Card>
              <AppText variant="subtitle">Tentang surah</AppText>
              <AppText color={theme.colors.muted} style={{ marginTop: 6 }}>
                {description || 'Deskripsi singkat surah belum tersedia dari API.'}
              </AppText>
            </Card>

            <View style={styles.controls}>
              <Pressable style={[styles.navButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigateRelative(surah.nomor - 1)}>
                <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
                <AppText>Sebelumnya</AppText>
              </Pressable>
              <Pressable style={[styles.navButton, { backgroundColor: theme.colors.surface }]} onPress={() => playAll(sequenceIndex)}>
                <Ionicons name="play-skip-forward" size={18} color={theme.colors.primary} />
                <AppText>Play all</AppText>
              </Pressable>
              <Pressable style={[styles.navButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigateRelative(surah.nomor + 1)}>
                <AppText>Berikutnya</AppText>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => <AyahCard ayah={item} surah={surah} qariId={selectedQari} onToast={showToast} />}
        initialNumToRender={8}
        windowSize={8}
        removeClippedSubviews
      />
      <Toast message={toast} visible={Boolean(toast)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 30 },
  hero: { borderRadius: 28, padding: 20, gap: 18 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  bigArab: { fontSize: 40, lineHeight: 58, fontWeight: '900' },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  primaryButton: { height: 44, borderRadius: 22, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  progress: { height: 5, borderRadius: 3 },
  controls: { flexDirection: 'row', gap: 8 },
  navButton: { flex: 1, minHeight: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
});
