import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import AppText from './AppText';
import { useAudioPlayer } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

export default function MiniPlayer() {
  const { theme } = useTheme();
  const { currentUrl, isPlaying, pause, resume, progress } = useAudioPlayer();

  if (!currentUrl) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.primaryDeep }]}>
      <View style={styles.row}>
        <Ionicons name="musical-notes" size={18} color="#FFFFFF" />
        <AppText color="#FFFFFF" style={{ flex: 1 }} numberOfLines={1}>
          Audio murottal sedang {isPlaying ? 'diputar' : 'dijeda'}
        </AppText>
        <Pressable onPress={isPlaying ? pause : resume} style={styles.play}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={theme.colors.primaryDeep} />
        </Pressable>
      </View>
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${progress * 100}%`, backgroundColor: theme.colors.gold }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 18, marginBottom: 8, borderRadius: 22, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  play: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.24)', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progress: { height: 4, borderRadius: 2 },
});
