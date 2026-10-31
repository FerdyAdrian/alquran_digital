import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MiniPlayer from '../components/MiniPlayer';
import { useTheme } from '../context/ThemeContext';
import AboutScreen from '../screens/AboutScreen';
import BookmarkScreen from '../screens/BookmarkScreen';
import DetailSurahScreen from '../screens/DetailSurahScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TilawahNotesScreen from '../screens/TilawahNotesScreen';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { theme } = useTheme();
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: 66,
            paddingTop: 8,
            paddingBottom: 10,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
              Home: focused ? 'home' : 'home-outline',
              Search: focused ? 'search' : 'search-outline',
              Bookmark: focused ? 'bookmark' : 'bookmark-outline',
              TilawahNotes: focused ? 'journal' : 'journal-outline',
              Settings: focused ? 'settings' : 'settings-outline',
              About: focused ? 'information-circle' : 'information-circle-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}>
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Beranda' }} />
        <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Cari' }} />
        <Tab.Screen name="Bookmark" component={BookmarkScreen} options={{ title: 'Bookmark' }} />
        <Tab.Screen name="TilawahNotes" component={TilawahNotesScreen} options={{ title: 'Catatan Tilawah' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Setelan' }} />
        <Tab.Screen name="About" component={AboutScreen} options={{ title: 'Tentang' }} />
      </Tab.Navigator>
      <MiniPlayer />
    </>
  );
}

export default function RootNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="DetailSurah" component={DetailSurahScreen} options={{ title: 'Detail Surah' }} />
    </Stack.Navigator>
  );
}
