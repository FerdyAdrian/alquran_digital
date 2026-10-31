import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useState } from 'react';

import AppText from '../components/AppText';
import SurahListItem from '../components/SurahListItem';
import { SurahSkeleton } from '../components/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { useSearchSurah, useSurahList } from '../hooks/useSurah';

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const { surahs, loading } = useSurahList();
  const result = useSearchSurah(surahs, query);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppText variant="title">Pencarian</AppText>
      <TextInput
        autoFocus
        value={query}
        onChangeText={setQuery}
        placeholder="Cari Al-Fatihah, Rahman, pembukaan..."
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
      />
      {loading ? (
        [1, 2, 3, 4].map((item) => <SurahSkeleton key={item} />)
      ) : (
        <FlatList
          data={result}
          keyExtractor={(item) => String(item.nomor)}
          renderItem={({ item }) => <SurahListItem surah={item} onPress={() => router.push(`/detail-surat/${item.nomor}` as never)} />}
          ListEmptyComponent={<AppText color={theme.colors.muted}>Tidak ada surah yang cocok.</AppText>}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 14 },
  input: { height: 52, borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, fontSize: 14, fontWeight: '600' },
});
