import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  DetailSurah: { surahNumber: number };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Bookmark: undefined;
  TilawahNotes: undefined;
  Settings: undefined;
  About: undefined;
};
