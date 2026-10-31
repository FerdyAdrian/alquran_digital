import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';

export default function SplashScreen() {
  const { theme } = useTheme();
  return (
    <LinearGradient colors={[theme.colors.primaryDeep, theme.colors.primary, '#0F766E']} style={styles.container}>
      <Animated.View entering={FadeInUp.duration(800)} style={[styles.logo, { borderColor: theme.colors.gold }]}>
        <AppText style={styles.logoText} color="#FFFFFF">
          القرآن
        </AppText>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(250).duration(700)} style={{ alignItems: 'center', gap: 8 }}>
        <AppText variant="title" color="#FFFFFF" style={{ fontSize: 30 }}>
          {"Al-Qur'an Digital"}
        </AppText>
        <AppText color="#ECFDF5" style={{ textAlign: 'center' }}>
          {"Baca, Dengarkan, dan Pelajari Al-Qur'an"}
        </AppText>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, padding: 28 },
  logo: {
    width: 132,
    height: 132,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  logoText: { fontSize: 42, lineHeight: 58, fontWeight: '800' },
});
