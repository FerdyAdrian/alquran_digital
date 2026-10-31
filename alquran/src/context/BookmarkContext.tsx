import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { quranStorage } from '../storage/quranStorage';
import { BookmarkAyah, LastRead } from '../types';

type BookmarkContextValue = {
  bookmarks: BookmarkAyah[];
  favoriteSurah: number[];
  lastRead: LastRead | null;
  toggleBookmark: (bookmark: BookmarkAyah) => Promise<boolean>;
  toggleFavoriteSurah: (surahNumber: number) => Promise<boolean>;
  markLastRead: (lastRead: LastRead) => Promise<void>;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  isFavoriteSurah: (surahNumber: number) => boolean;
};

const BookmarkContext = createContext<BookmarkContextValue | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkAyah[]>([]);
  const [favoriteSurah, setFavoriteSurah] = useState<number[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  useEffect(() => {
    Promise.all([quranStorage.getBookmarks(), quranStorage.getFavoriteSurah(), quranStorage.getLastRead()]).then(
      ([savedBookmarks, savedFavorites, savedLastRead]) => {
        setBookmarks(savedBookmarks);
        setFavoriteSurah(savedFavorites);
        setLastRead(savedLastRead);
      },
    );
  }, []);

  const isBookmarked = useCallback(
    (surahNumber: number, ayahNumber: number) =>
      bookmarks.some((item) => item.surahNumber === surahNumber && item.ayahNumber === ayahNumber),
    [bookmarks],
  );

  const isFavoriteSurah = useCallback((surahNumber: number) => favoriteSurah.includes(surahNumber), [favoriteSurah]);

  const toggleBookmark = useCallback(async (bookmark: BookmarkAyah) => {
    const exists = isBookmarked(bookmark.surahNumber, bookmark.ayahNumber);
    const next = exists
      ? bookmarks.filter((item) => item.surahNumber !== bookmark.surahNumber || item.ayahNumber !== bookmark.ayahNumber)
      : [bookmark, ...bookmarks];
    setBookmarks(next);
    await quranStorage.setBookmarks(next);
    return !exists;
  }, [bookmarks, isBookmarked]);

  const toggleFavoriteSurah = useCallback(async (surahNumber: number) => {
    const exists = favoriteSurah.includes(surahNumber);
    const next = exists ? favoriteSurah.filter((item) => item !== surahNumber) : [surahNumber, ...favoriteSurah];
    setFavoriteSurah(next);
    await quranStorage.setFavoriteSurah(next);
    return !exists;
  }, [favoriteSurah]);

  const markLastRead = useCallback(async (item: LastRead) => {
    setLastRead(item);
    await quranStorage.setLastRead(item);
    const history = await quranStorage.getHistory();
    const next = [item, ...history.filter((old) => old.surahNumber !== item.surahNumber || old.ayahNumber !== item.ayahNumber)].slice(0, 30);
    await quranStorage.setHistory(next);
  }, []);

  const value = useMemo(
    () => ({
      bookmarks,
      favoriteSurah,
      lastRead,
      toggleBookmark,
      toggleFavoriteSurah,
      markLastRead,
      isBookmarked,
      isFavoriteSurah,
    }),
    [bookmarks, favoriteSurah, lastRead, toggleBookmark, toggleFavoriteSurah, markLastRead, isBookmarked, isFavoriteSurah],
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error('useBookmarks must be used inside BookmarkProvider');
  return context;
}
