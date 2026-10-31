import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

export default function Toast({ message, visible }: { message: string; visible: boolean }) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 220 });
    translateY.value = withTiming(visible ? 0 : 16, { duration: 220 });
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { backgroundColor: theme.colors.primaryDeep }, animatedStyle]}>
      <AppText color="#FFFFFF" style={{ textAlign: 'center' }}>
        {message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 26,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    zIndex: 30,
  },
});
