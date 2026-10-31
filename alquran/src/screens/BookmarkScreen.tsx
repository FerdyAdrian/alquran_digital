import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import IconButton from '../components/IconButton';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';
import { useSurahList } from '../hooks/useSurah';

export default function BookmarkScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { bookmarks, favoriteSurah, toggleBookmark, toggleFavoriteSurah, lastRead } = useBookmarks();
  const { surahs } = useSurahList();
  const favoriteItems = surahs.filter((surah) => favoriteSurah.includes(surah.nomor));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => `${item.surahNumber}-${item.ayahNumber}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <AppText variant="title">Bookmark</AppText>
              <AppText color={theme.colors.muted}>Surat favorit dan ayat tersimpan ada di sini.</AppText>
            </View>

            {lastRead ? (
              <Pressable onPress={() => router.push(`/detail-surat/${lastRead.surahNumber}` as never)}>
                <Card style={{ backgroundColor: theme.colors.surfaceAlt }}>
                  <View style={styles.compactRow}>
                    <View style={[styles.iconBadge, { backgroundColor: theme.colors.primarySoft }]}>
                      <Ionicons name="book-outline" size={20} color={theme.colors.primaryDeep} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle">Terakhir dibaca</AppText>
                      <AppText color={theme.colors.muted}>
                        {lastRead.surahName} ayat {lastRead.ayahNumber}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
                  </View>
                </Card>
              </Pressable>
            ) : null}

            <Card>
              <View style={styles.sectionTitle}>
                <View>
                  <AppText variant="subtitle">Surat Favorit</AppText>
                  <AppText variant="caption" color={theme.colors.muted}>
                    {favoriteItems.length} surat disimpan
                  </AppText>
                </View>
                <Ionicons name="star" size={20} color={theme.colors.gold} />
              </View>

              {favoriteItems.length ? (
                <View style={styles.favoriteList}>
                  {favoriteItems.map((surah) => (
                    <Pressable
                      key={surah.nomor}
                      onPress={() => router.push(`/detail-surat/${surah.nomor}` as never)}
                      style={[styles.favoriteItem, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt }]}>
                      <View style={[styles.surahNumber, { backgroundColor: theme.colors.primarySoft }]}>
                        <AppText variant="caption" color={theme.colors.primaryDeep} style={{ fontWeight: '900' }}>
                          {surah.nomor}
                        </AppText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText style={{ fontWeight: '900' }}>{surah.namaLatin}</AppText>
                        <AppText variant="caption" color={theme.colors.muted}>
                          {surah.arti} - {surah.jumlahAyat} ayat
                        </AppText>
                      </View>
                      <IconButton name="star" active onPress={() => toggleFavoriteSurah(surah.nomor)} size={18} />
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyBox, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <AppText color={theme.colors.muted}>Belum ada surat favorit.</AppText>
                  <AppText variant="caption" color={theme.colors.muted}>
                    Buka detail surat lalu tekan ikon bintang.
                  </AppText>
                </View>
              )}
            </Card>

            <AppText variant="subtitle">Ayat Tersimpan</AppText>
          </View>
        }
        ListEmptyComponent={
          <Card>
            <AppText variant="subtitle">Belum ada ayat tersimpan</AppText>
            <AppText color={theme.colors.muted}>Simpan ayat dari halaman detail surah agar mudah dibuka kembali.</AppText>
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/detail-surat/${item.surahNumber}` as never)}>
            <Card>
              <View style={styles.row}>
                <AppText variant="subtitle">
                  {item.surahName} {item.ayahNumber}
                </AppText>
                <IconButton name="trash-outline" onPress={() => toggleBookmark(item)} size={18} />
              </View>
              <AppText variant="arab">{item.arab}</AppText>
              <AppText color={theme.colors.muted} style={{ fontStyle: 'italic' }}>
                {item.latin}
              </AppText>
              <AppText style={{ marginTop: 8 }}>{item.translation}</AppText>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 18, gap: 12, paddingBottom: 28 },
  header: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBadge: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  favoriteList: { gap: 10, marginTop: 12 },
  favoriteItem: { minHeight: 64, borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  surahNumber: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { borderRadius: 16, padding: 14, marginTop: 12, gap: 4 },
});
