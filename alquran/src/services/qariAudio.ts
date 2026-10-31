import { Ayah, QariId, SurahDetail } from '../types';

export const QARI_OPTIONS: {
  id: QariId;
  label: string;
  description: string;
  equranKey?: string;
  ayahBaseUrl?: string;
}[] = [
  {
    id: 'mishary',
    label: 'Mishary Rashid Alafasy',
    description: 'Murattal populer dengan suara merdu dan pelafalan jelas.',
    equranKey: '05',
  },
  {
    id: 'abdulbasit',
    label: 'Abdul Basit',
    description: 'Menggunakan sumber ayat terpisah agar mudah diganti ke audio resmi.',
    ayahBaseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_64kbps',
  },
];

function pad(value: number) {
  return String(value).padStart(3, '0');
}

export function getQariOption(qariId: QariId) {
  return QARI_OPTIONS.find((item) => item.id === qariId) ?? QARI_OPTIONS[0];
}

export function getSurahAudioForQari(surah: SurahDetail | null | undefined, qariId: QariId) {
  const qari = getQariOption(qariId);
  if (!surah || !qari.equranKey) return undefined;
  return surah.audioFull?.[qari.equranKey] ?? Object.values(surah.audioFull ?? {})[0];
}

export function getAyahAudioForQari(ayah: Ayah, surahNumber: number, qariId: QariId) {
  const qari = getQariOption(qariId);
  if (qari.equranKey) {
    return ayah.audio?.[qari.equranKey] ?? Object.values(ayah.audio ?? {})[0];
  }

  if (qari.ayahBaseUrl) {
    return `${qari.ayahBaseUrl}/${pad(surahNumber)}${pad(ayah.nomorAyat)}.mp3`;
  }

  return Object.values(ayah.audio ?? {})[0];
}
