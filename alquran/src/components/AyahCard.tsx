import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Share, StyleSheet, View } from 'react-native';

import AppText from './AppText';
import Card from './Card';
import IconButton from './IconButton';
import { useAudioPlayer } from '../context/AudioContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';
import { getAyahAudioForQari } from '../services/qariAudio';
import { Ayah, QariId, SurahDetail } from '../types';

type Props = {
  ayah: Ayah;
  surah: SurahDetail;
  qariId: QariId;
  onToast: (message: string) => void;
};

export default function AyahCard({ ayah, surah, qariId, onToast }: Props) {
  const { theme } = useTheme();
  const { playUrl, currentUrl, isPlaying } = useAudioPlayer();
  const { isBookmarked, toggleBookmark, markLastRead } = useBookmarks();
  const audioUrl = getAyahAudioForQari(ayah, surah.nomor, qariId);
  const bookmarked = isBookmarked(surah.nomor, ayah.nomorAyat);
  const playing = currentUrl === audioUrl && isPlaying;

  const textBlock = `${surah.namaLatin} ayat ${ayah.nomorAyat}\n${ayah.teksArab}\n${ayah.teksLatin}\n${ayah.teksIndonesia}`;

  const handleBookmark = async () => {
    const added = await toggleBookmark({
      surahNumber: surah.nomor,
      surahName: surah.namaLatin,
      ayahNumber: ayah.nomorAyat,
      arab: ayah.teksArab,
      latin: ayah.teksLatin,
      translation: ayah.teksIndonesia,
      createdAt: new Date().toISOString(),
    });
    onToast(added ? 'Ayat disimpan ke bookmark' : 'Bookmark dihapus');
  };

  const play = async () => {
    if (!audioUrl) return;
    await markLastRead({
      surahNumber: surah.nomor,
      surahName: surah.namaLatin,
      ayahNumber: ayah.nomorAyat,
      updatedAt: new Date().toISOString(),
    });
    await playUrl(audioUrl);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: theme.colors.primarySoft }]}>
          <AppText variant="caption" color={theme.colors.primaryDeep} style={{ fontWeight: '800' }}>
            {surah.nomor}:{ayah.nomorAyat}
          </AppText>
        </View>
        <View style={styles.actions}>
          <IconButton name={playing ? 'pause' : 'play'} onPress={play} active={playing} size={18} />
          <IconButton
            name="copy-outline"
            onPress={async () => {
              await Clipboard.setStringAsync(textBlock);
              onToast('Ayat berhasil disalin');
            }}
            size={18}
          />
          <IconButton name={bookmarked ? 'bookmark' : 'bookmark-outline'} onPress={handleBookmark} active={bookmarked} size={18} />
          <IconButton name="share-social-outline" onPress={() => Share.share({ message: textBlock })} size={18} />
        </View>
      </View>

      <AppText variant="arab" style={{ color: theme.colors.text }}>
        {ayah.teksArab}
      </AppText>
      <View style={styles.translation}>
        <Ionicons name="sparkles-outline" size={16} color={theme.colors.gold} />
        <AppText color={theme.colors.muted} style={{ flex: 1, fontStyle: 'italic' }}>
          {ayah.teksLatin}
        </AppText>
      </View>
      <AppText>{ayah.teksIndonesia}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  badge: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  translation: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 10 },
});
