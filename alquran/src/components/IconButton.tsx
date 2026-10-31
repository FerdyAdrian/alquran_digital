import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '../context/ThemeContext';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  active?: boolean;
  size?: number;
  style?: ViewStyle;
};

export default function IconButton({ name, onPress, active, size = 20, style }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt, opacity: pressed ? 0.72 : 1 },
        style,
      ]}>
      <Ionicons name={name} size={size} color={active ? '#FFFFFF' : theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
