import { StyleSheet, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';

export function SurahSkeleton() {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.circle, { backgroundColor: theme.colors.surfaceAlt }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.line, { width: '52%', backgroundColor: theme.colors.surfaceAlt }]} />
        <View style={[styles.line, { width: '75%', backgroundColor: theme.colors.surfaceAlt }]} />
      </View>
      <View style={[styles.arab, { backgroundColor: theme.colors.surfaceAlt }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circle: { width: 42, height: 42, borderRadius: 21 },
  line: { height: 12, borderRadius: 6 },
  arab: { width: 52, height: 22, borderRadius: 8 },
});
