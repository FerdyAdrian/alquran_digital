export type SurahSummary = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi?: string;
  audioFull?: Record<string, string>;
};

export type Ayah = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio?: Record<string, string>;
};

export type SurahDetail = SurahSummary & {
  ayat: Ayah[];
  suratSebelumnya?: SurahSummary | false;
  suratSelanjutnya?: SurahSummary | false;
};

export type BookmarkAyah = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arab: string;
  latin: string;
  translation: string;
  createdAt: string;
};

export type LastRead = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  updatedAt: string;
};

export type ReadingHistory = LastRead;

export type TilawahNote = {
  id: string | number;
  surahName: string;
  ayahCount: string;
  readDate: string;
  createdAt: string;
};

export type QariId = 'mishary' | 'abdulbasit';
