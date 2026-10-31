import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import SurahListItem from '../components/SurahListItem';
import { SurahSkeleton } from '../components/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { useSurahList } from '../hooks/useSurah';

export default function SurahListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { surahs, loading, refreshing, error, refresh } = useSurahList();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppText variant="title">Daftar Surat</AppText>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <SurahSkeleton key={item} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      data={surahs}
      keyExtractor={(item) => String(item.nomor)}
      ListHeaderComponent={
        <View style={{ gap: 6, marginBottom: 14 }}>
          <AppText variant="title">Daftar Surat</AppText>
          <AppText color={theme.colors.muted}>Buka surat untuk membaca ayat, terjemahan, dan audio murottal.</AppText>
          {error ? <AppText color={theme.colors.danger}>{error}</AppText> : null}
        </View>
      }
      renderItem={({ item }) => <SurahListItem surah={item} onPress={() => router.push(`/detail-surat/${item.nomor}` as never)} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
      initialNumToRender={14}
      windowSize={8}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 32 },
});
