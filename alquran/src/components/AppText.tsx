import { Text, TextProps } from 'react-native';

import { useTheme } from '../context/ThemeContext';

type Props = TextProps & {
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'arab';
  color?: string;
};

export default function AppText({ variant = 'body', color, style, ...props }: Props) {
  const { theme } = useTheme();
  const sizes = {
    title: { fontSize: 24, lineHeight: 31, fontWeight: '800' as const },
    subtitle: { fontSize: 17, lineHeight: 24, fontWeight: '700' as const },
    body: { fontSize: 14, lineHeight: 21, fontWeight: '500' as const },
    caption: { fontSize: 12, lineHeight: 17, fontWeight: '500' as const },
    arab: { fontSize: 29, lineHeight: 54, fontWeight: '600' as const, textAlign: 'right' as const },
  };

  return <Text style={[{ color: color ?? theme.colors.text }, sizes[variant], style]} {...props} />;
}
