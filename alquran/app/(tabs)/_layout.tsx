import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useTheme } from '../../src/context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: focused ? 'home' : 'home-outline',
            'daftar-surat': focused ? 'book' : 'book-outline',
            'cari-surat': focused ? 'search' : 'search-outline',
            bookmark: focused ? 'bookmark' : 'bookmark-outline',
            'catatan-tilawah': focused ? 'journal' : 'journal-outline',
            menu: focused ? 'grid' : 'grid-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="daftar-surat" options={{ title: 'Daftar Surat' }} />
      <Tabs.Screen name="cari-surat" options={{ title: 'Cari Surat' }} />
      <Tabs.Screen name="bookmark" options={{ title: 'Bookmark' }} />
      <Tabs.Screen name="catatan-tilawah" options={{ title: 'Catatan' }} />
      <Tabs.Screen name="menu" options={{ title: 'Menu' }} />
    </Tabs>
  );
}
