import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'axios';

import { STORAGE_KEYS } from '../storage/keys';
import { SurahDetail, SurahSummary } from '../types';

const api = create({
  baseURL: 'https://equran.id/api/v2',
  timeout: 12000,
});

async function readCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

async function writeCache<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getSurahList(forceRefresh = false): Promise<SurahSummary[]> {
  if (!forceRefresh) {
    const cached = await readCache<SurahSummary[]>(STORAGE_KEYS.surahList);
    if (cached?.length) return cached;
  }

  try {
    const { data } = await api.get('/surat');
    await writeCache(STORAGE_KEYS.surahList, data.data);
    return data.data;
  } catch (error) {
    const cached = await readCache<SurahSummary[]>(STORAGE_KEYS.surahList);
    if (cached?.length) return cached;
    throw error;
  }
}

export async function getSurahDetail(id: number, forceRefresh = false): Promise<SurahDetail> {
  const cacheKey = STORAGE_KEYS.surahDetail(id);
  if (!forceRefresh) {
    const cached = await readCache<SurahDetail>(cacheKey);
    if (cached) return cached;
  }

  try {
    const { data } = await api.get(`/surat/${id}`);
    await writeCache(cacheKey, data.data);
    return data.data;
  } catch (error) {
    const cached = await readCache<SurahDetail>(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

export function getPreferredAudio(audio?: Record<string, string>) {
  if (!audio) return undefined;
  return audio['05'] || audio['04'] || audio['03'] || audio['02'] || audio['01'] || Object.values(audio)[0];
}
