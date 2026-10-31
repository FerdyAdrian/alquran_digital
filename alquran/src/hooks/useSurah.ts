import { useCallback, useEffect, useMemo, useState } from 'react';

import { getSurahDetail, getSurahList } from '../services/api';
import { SurahDetail, SurahSummary } from '../types';

export function useSurahList() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    try {
      setError(null);
      const result = await getSurahList(force);
      setSurahs(result);
    } catch {
      setError('Tidak dapat memuat data surah. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    load(true);
  };

  return { surahs, loading, refreshing, error, refresh };
}

export function useSurahDetail(id: number) {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force = false) => {
      try {
        setError(null);
        const result = await getSurahDetail(id, force);
        setSurah(result);
      } catch {
        setError('Tidak dapat memuat detail surah.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    load(true);
  };

  return { surah, loading, refreshing, error, refresh };
}

export function useSearchSurah(surahs: SurahSummary[], keyword: string) {
  return useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return surahs;
    return surahs.filter(
      (surah) =>
        surah.namaLatin.toLowerCase().includes(normalized) ||
        surah.arti.toLowerCase().includes(normalized) ||
        surah.nama.includes(normalized) ||
        String(surah.nomor).includes(normalized),
    );
  }, [keyword, surahs]);
}
