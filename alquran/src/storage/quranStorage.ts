import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from './keys';
import { BookmarkAyah, LastRead, QariId, ReadingHistory, TilawahNote } from '../types';

function normalizeQari(value: unknown): QariId {
  return value === 'abdulbasit' ? 'abdulbasit' : 'mishary';
}

async function getJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

async function setJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const quranStorage = {
  getBookmarks: () => getJson<BookmarkAyah[]>(STORAGE_KEYS.bookmarks, []),
  setBookmarks: (items: BookmarkAyah[]) => setJson(STORAGE_KEYS.bookmarks, items),
  getFavoriteSurah: () => getJson<number[]>(STORAGE_KEYS.favorites, []),
  setFavoriteSurah: (items: number[]) => setJson(STORAGE_KEYS.favorites, items),
  getLastRead: () => getJson<LastRead | null>(STORAGE_KEYS.lastRead, null),
  setLastRead: (item: LastRead) => setJson(STORAGE_KEYS.lastRead, item),
  getHistory: () => getJson<ReadingHistory[]>(STORAGE_KEYS.history, []),
  setHistory: (items: ReadingHistory[]) => setJson(STORAGE_KEYS.history, items),
  getTilawahNotes: () => getJson<TilawahNote[]>(STORAGE_KEYS.tilawahNotes, []),
  setTilawahNotes: (items: TilawahNote[]) => setJson(STORAGE_KEYS.tilawahNotes, items),
  getSelectedQari: async () => normalizeQari(await getJson<string>(STORAGE_KEYS.selectedQari, 'mishary')),
  setSelectedQari: (qariId: QariId) => setJson(STORAGE_KEYS.selectedQari, qariId),
};
