import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import AppText from './AppText';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';
import { SurahSummary } from '../types';

type Props = {
  surah: SurahSummary;
  onPress: () => void;
};

export default function SurahListItem({ surah, onPress }: Props) {
  const { theme } = useTheme();
  const { isFavoriteSurah } = useBookmarks();
  const favorite = isFavoriteSurah(surah.nomor);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.72 : 1 },
      ]}>
      <View style={[styles.number, { backgroundColor: theme.colors.primarySoft }]}>
        <AppText variant="caption" color={theme.colors.primaryDeep} style={{ fontWeight: '800' }}>
          {surah.nomor}
        </AppText>
      </View>
      <View style={styles.meta}>
        <View style={styles.row}>
          <AppText variant="subtitle">{surah.namaLatin}</AppText>
          {favorite ? <Ionicons name="star" size={15} color={theme.colors.gold} /> : null}
        </View>
        <AppText variant="caption" color={theme.colors.muted}>
          {surah.arti} • {surah.tempatTurun} • {surah.jumlahAyat} ayat
        </AppText>
      </View>
      <AppText style={styles.arab} color={theme.colors.primary}>
        {surah.nama}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 78,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  number: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  arab: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
});
