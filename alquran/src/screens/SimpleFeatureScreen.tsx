import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';
import { InteractiveFeatureContent } from './InteractiveFeatureContent';

type Props = {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children?: ReactNode;
};

type ContentItem = {
  title: string;
  description: string;
  meta?: string;
};

type ContentSection = {
  heading: string;
  items: ContentItem[];
};

const isArabicText = (value: string) => /[\u0600-\u06FF]/.test(value);

const asmaulHusna = [
  ['Ar-Rahman', 'Maha Pengasih'],
  ['Ar-Rahim', 'Maha Penyayang'],
  ['Al-Malik', 'Maha Merajai'],
  ['Al-Quddus', 'Maha Suci'],
  ['As-Salam', 'Maha Memberi Keselamatan'],
  ['Al-Mu’min', 'Maha Memberi Keamanan'],
  ['Al-Muhaimin', 'Maha Memelihara'],
  ['Al-Aziz', 'Maha Perkasa'],
  ['Al-Jabbar', 'Maha Kuasa'],
  ['Al-Mutakabbir', 'Maha Megah'],
  ['Al-Khaliq', 'Maha Pencipta'],
  ['Al-Bari', 'Maha Mengadakan'],
  ['Al-Musawwir', 'Maha Membentuk Rupa'],
  ['Al-Ghaffar', 'Maha Pengampun'],
  ['Al-Qahhar', 'Maha Menundukkan'],
  ['Al-Wahhab', 'Maha Pemberi Karunia'],
  ['Ar-Razzaq', 'Maha Pemberi Rezeki'],
  ['Al-Fattah', 'Maha Pembuka Rahmat'],
  ['Al-Alim', 'Maha Mengetahui'],
  ['Al-Qabid', 'Maha Menyempitkan'],
  ['Al-Basit', 'Maha Melapangkan'],
  ['Al-Khafid', 'Maha Merendahkan'],
  ['Ar-Rafi', 'Maha Meninggikan'],
  ['Al-Mu’izz', 'Maha Memuliakan'],
  ['Al-Mudzill', 'Maha Menghinakan'],
  ['As-Sami', 'Maha Mendengar'],
  ['Al-Basir', 'Maha Melihat'],
  ['Al-Hakam', 'Maha Menetapkan'],
  ['Al-Adl', 'Maha Adil'],
  ['Al-Latif', 'Maha Lembut'],
  ['Al-Khabir', 'Maha Mengenal'],
  ['Al-Halim', 'Maha Penyantun'],
  ['Al-Azim', 'Maha Agung'],
  ['Al-Ghafur', 'Maha Pengampun'],
  ['Asy-Syakur', 'Maha Mensyukuri'],
  ['Al-Aliyy', 'Maha Tinggi'],
  ['Al-Kabir', 'Maha Besar'],
  ['Al-Hafiz', 'Maha Memelihara'],
  ['Al-Muqit', 'Maha Pemberi Kecukupan'],
  ['Al-Hasib', 'Maha Membuat Perhitungan'],
  ['Al-Jalil', 'Maha Mulia'],
  ['Al-Karim', 'Maha Pemurah'],
  ['Ar-Raqib', 'Maha Mengawasi'],
  ['Al-Mujib', 'Maha Mengabulkan'],
  ['Al-Wasi', 'Maha Luas'],
  ['Al-Hakim', 'Maha Bijaksana'],
  ['Al-Wadud', 'Maha Mengasihi'],
  ['Al-Majid', 'Maha Mulia'],
  ['Al-Ba’its', 'Maha Membangkitkan'],
  ['Asy-Syahid', 'Maha Menyaksikan'],
  ['Al-Haqq', 'Maha Benar'],
  ['Al-Wakil', 'Maha Memelihara'],
  ['Al-Qawiyy', 'Maha Kuat'],
  ['Al-Matin', 'Maha Kokoh'],
  ['Al-Waliyy', 'Maha Melindungi'],
  ['Al-Hamid', 'Maha Terpuji'],
  ['Al-Muhsi', 'Maha Menghitung'],
  ['Al-Mubdi', 'Maha Memulai'],
  ['Al-Mu’id', 'Maha Mengembalikan'],
  ['Al-Muhyi', 'Maha Menghidupkan'],
  ['Al-Mumit', 'Maha Mematikan'],
  ['Al-Hayy', 'Maha Hidup'],
  ['Al-Qayyum', 'Maha Berdiri Sendiri'],
  ['Al-Wajid', 'Maha Menemukan'],
  ['Al-Majid', 'Maha Mulia'],
  ['Al-Wahid', 'Maha Esa'],
  ['Al-Ahad', 'Maha Tunggal'],
  ['As-Samad', 'Maha Dibutuhkan'],
  ['Al-Qadir', 'Maha Menentukan'],
  ['Al-Muqtadir', 'Maha Berkuasa'],
  ['Al-Muqaddim', 'Maha Mendahulukan'],
  ['Al-Mu’akhkhir', 'Maha Mengakhirkan'],
  ['Al-Awwal', 'Maha Awal'],
  ['Al-Akhir', 'Maha Akhir'],
  ['Az-Zahir', 'Maha Nyata'],
  ['Al-Batin', 'Maha Ghaib'],
  ['Al-Wali', 'Maha Memerintah'],
  ['Al-Muta’ali', 'Maha Tinggi'],
  ['Al-Barr', 'Maha Penderma'],
  ['At-Tawwab', 'Maha Penerima Taubat'],
  ['Al-Muntaqim', 'Maha Pemberi Balasan'],
  ['Al-Afuww', 'Maha Pemaaf'],
  ['Ar-Rauf', 'Maha Pengasih'],
  ['Malikul Mulk', 'Maha Penguasa Kerajaan'],
  ['Dzul Jalali wal Ikram', 'Maha Pemilik Kebesaran'],
  ['Al-Muqsit', 'Maha Adil'],
  ['Al-Jami', 'Maha Mengumpulkan'],
  ['Al-Ghaniyy', 'Maha Kaya'],
  ['Al-Mughni', 'Maha Memberi Kekayaan'],
  ['Al-Mani', 'Maha Mencegah'],
  ['Ad-Darr', 'Maha Memberi Derita'],
  ['An-Nafi', 'Maha Memberi Manfaat'],
  ['An-Nur', 'Maha Bercahaya'],
  ['Al-Hadi', 'Maha Pemberi Petunjuk'],
  ['Al-Badi', 'Maha Pencipta Tiada Banding'],
  ['Al-Baqi', 'Maha Kekal'],
  ['Al-Warits', 'Maha Pewaris'],
  ['Ar-Rasyid', 'Maha Pandai'],
  ['As-Sabur', 'Maha Sabar'],
];

const asmaulArabic = [
  'الرَّحْمَنُ',
  'الرَّحِيمُ',
  'الْمَلِكُ',
  'الْقُدُّوسُ',
  'السَّلاَمُ',
  'الْمُؤْمِنُ',
  'الْمُهَيْمِنُ',
  'الْعَزِيزُ',
  'الْجَبَّارُ',
  'الْمُتَكَبِّرُ',
  'الْخَالِقُ',
  'الْبَارِئُ',
  'الْمُصَوِّرُ',
  'الْغَفَّارُ',
  'الْقَهَّارُ',
  'الْوَهَّابُ',
  'الرَّزَّاقُ',
  'الْفَتَّاحُ',
  'الْعَلِيمُ',
  'الْقَابِضُ',
  'الْبَاسِطُ',
  'الْخَافِضُ',
  'الرَّافِعُ',
  'الْمُعِزُّ',
  'المُذِلُّ',
  'السَّمِيعُ',
  'الْبَصِيرُ',
  'الْحَكَمُ',
  'الْعَدْلُ',
  'اللَّطِيفُ',
  'الْخَبِيرُ',
  'الْحَلِيمُ',
  'الْعَظِيمُ',
  'الْغَفُورُ',
  'الشَّكُورُ',
  'الْعَلِيُّ',
  'الْكَبِيرُ',
  'الْحَفِيظُ',
  'المُقِيتُ',
  'الْحَسِيبُ',
  'الْجَلِيلُ',
  'الْكَرِيمُ',
  'الرَّقِيبُ',
  'الْمُجِيبُ',
  'الْوَاسِعُ',
  'الْحَكِيمُ',
  'الْوَدُودُ',
  'الْمَجِيدُ',
  'الْبَاعِثُ',
  'الشَّهِيدُ',
  'الْحَقُّ',
  'الْوَكِيلُ',
  'الْقَوِيُّ',
  'الْمَتِينُ',
  'الْوَلِيُّ',
  'الْحَمِيدُ',
  'الْمُحْصِي',
  'الْمُبْدِئُ',
  'الْمُعِيدُ',
  'الْمُحْيِي',
  'اَلْمُمِيتُ',
  'الْحَيُّ',
  'الْقَيُّومُ',
  'الْوَاجِدُ',
  'الْمَاجِدُ',
  'الْواحِدُ',
  'اَلاَحَدُ',
  'الصَّمَدُ',
  'الْقَادِرُ',
  'الْمُقْتَدِرُ',
  'الْمُقَدِّمُ',
  'الْمُؤَخِّرُ',
  'الأوَّلُ',
  'الآخِرُ',
  'الظَّاهِرُ',
  'الْبَاطِنُ',
  'الْوَالِي',
  'الْمُتَعَالِي',
  'الْبَرُّ',
  'التَّوَابُ',
  'الْمُنْتَقِمُ',
  'العَفُوُّ',
  'الرَّؤُوفُ',
  'مَالِكُ الْمُلْكِ',
  'ذُوالْجَلاَلِ وَالإكْرَامِ',
  'الْمُقْسِطُ',
  'الْجَامِعُ',
  'الْغَنِيُّ',
  'الْمُغْنِي',
  'اَلْمَانِعُ',
  'الضَّارَّ',
  'النَّافِعُ',
  'النُّورُ',
  'الْهَادِي',
  'الْبَدِيعُ',
  'اَلْبَاقِي',
  'الْوَارِثُ',
  'الرَّشِيدُ',
  'الصَّبُورُ',
];

const juz30 = [
  'An-Naba', 'An-Nazi’at', 'Abasa', 'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Insyiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-A’la', 'Al-Ghasyiyah', 'Al-Fajr', 'Al-Balad', 'Asy-Syams', 'Al-Lail', 'Ad-Duha',
  'Al-Insyirah', 'At-Tin', 'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat', 'Al-Qari’ah',
  'At-Takatsur', 'Al-Asr', 'Al-Humazah', 'Al-Fil', 'Quraisy', 'Al-Ma’un', 'Al-Kautsar', 'Al-Kafirun',
  'An-Nasr', 'Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
];

const contentByTitle: Record<string, ContentSection[]> = {
  'Jadwal Tilawah': [
    {
      heading: 'Rekomendasi Jadwal Harian',
      items: [
        { title: 'Setelah Subuh', description: 'Baca 5-10 ayat saat pikiran masih segar.', meta: 'Pagi' },
        { title: 'Setelah Dzuhur', description: 'Lanjutkan bacaan pendek atau murajaah surat pendek.', meta: 'Siang' },
        { title: 'Setelah Maghrib', description: 'Waktu nyaman untuk membaca terjemahan dan tafsir ringkas.', meta: 'Sore' },
        { title: 'Sebelum Tidur', description: 'Tutup hari dengan 3 ayat dan doa harian.', meta: 'Malam' },
      ],
    },
  ],
  'Target Khatam': [
    {
      heading: 'Pilihan Target',
      items: [
        { title: 'Khatam 30 Hari', description: 'Baca 1 juz per hari atau sekitar 20 halaman mushaf.', meta: 'Intensif' },
        { title: 'Khatam 60 Hari', description: 'Baca setengah juz per hari agar lebih ringan.', meta: 'Santai' },
        { title: 'Khatam 90 Hari', description: 'Baca sekitar 7 halaman per hari dan tetap konsisten.', meta: 'Pemula' },
      ],
    },
  ],
  'Progress Khatam': [
    {
      heading: 'Ringkasan Progress',
      items: [
        { title: 'Hari Ini', description: 'Catat surat dan jumlah ayat yang sudah dibaca di Catatan Tilawah.', meta: 'Update harian' },
        { title: 'Minggu Ini', description: 'Targetkan minimal 5 hari tilawah dalam satu minggu.', meta: 'Konsistensi' },
        { title: 'Bulan Ini', description: 'Pantau jumlah catatan untuk melihat kebiasaan membaca.', meta: 'Evaluasi' },
      ],
    },
  ],
  'Doa Harian': [
    {
      heading: 'Doa Pilihan',
      items: [
        {
          title: 'Doa Sebelum Belajar',
          description: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا\nRabbi zidni ilma warzuqni fahma.\nArtinya: Ya Tuhanku, tambahkanlah ilmu kepadaku dan berilah aku pemahaman.',
          meta: 'Belajar',
        },
        {
          title: 'Doa Kedua Orang Tua',
          description:
            'رَبِّ اغْفِرْ لِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرًا\nRabbighfirli waliwalidayya warhamhuma kama rabbayani shaghira.\nArtinya: Ya Tuhanku, ampunilah aku dan kedua orang tuaku, sayangilah mereka sebagaimana mereka menyayangiku waktu kecil.',
          meta: 'Keluarga',
        },
        {
          title: 'Doa Kebaikan Dunia Akhirat',
          description:
            'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ\nRabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina adzaban-nar.\nArtinya: Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, serta lindungilah kami dari siksa neraka.',
          meta: 'Umum',
        },
        {
          title: 'Doa Kelapangan Hati',
          description: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي\nRabbi syrah li shadri wa yassir li amri.\nArtinya: Ya Tuhanku, lapangkanlah dadaku dan mudahkanlah urusanku.',
          meta: 'Tenang',
        },
      ],
    },
  ],
  'Asmaul Husna': [
    {
      heading: '99 Asmaul Husna',
      items: asmaulHusna.map(([title, description], index) => ({ title: `${index + 1}. ${title}`, description: `${asmaulArabic[index] ?? ''}\nArtinya: ${description}` })),
    },
  ],
  'Juz 30': [
    {
      heading: 'Daftar Surat Juz 30',
      items: juz30.map((title, index) => ({ title: `${index + 1}. ${title}`, description: 'Surat dalam Juz Amma untuk hafalan dan murajaah.' })),
    },
  ],
  'Ayat Pilihan': [
    {
      heading: 'Tema Ayat',
      items: [
        { title: 'Tentang Sabar', description: 'Al-Baqarah: 153 - Mohonlah pertolongan dengan sabar dan shalat.', meta: 'Sabar' },
        { title: 'Tentang Syukur', description: 'Ibrahim: 7 - Jika kamu bersyukur, Allah akan menambah nikmat.', meta: 'Syukur' },
        { title: 'Tentang Ketenangan', description: 'Ar-Ra’d: 28 - Dengan mengingat Allah hati menjadi tenteram.', meta: 'Dzikir' },
        { title: 'Tentang Kemudahan', description: 'Al-Insyirah: 6 - Sesungguhnya bersama kesulitan ada kemudahan.', meta: 'Motivasi' },
      ],
    },
  ],
  'Tafsir Ringkas': [
    {
      heading: 'Ringkasan Makna',
      items: [
        { title: 'Al-Fatihah', description: 'Mengajarkan pujian kepada Allah, permohonan petunjuk, dan jalan yang lurus.', meta: 'Pembuka' },
        { title: 'Al-Ikhlas', description: 'Menegaskan keesaan Allah dan kemurnian tauhid.', meta: 'Tauhid' },
        { title: 'Al-Falaq', description: 'Memohon perlindungan dari keburukan makhluk dan hasad.', meta: 'Perlindungan' },
        { title: 'An-Nas', description: 'Memohon perlindungan dari bisikan buruk yang mengganggu hati manusia.', meta: 'Perlindungan' },
      ],
    },
  ],
  'Audio Murottal': [
    {
      heading: 'Panduan Audio',
      items: [
        { title: 'Mishary Rashid Alafasy', description: 'Qari default dengan bacaan jelas dan populer.', meta: 'Setelan' },
        { title: 'Abdul Basit', description: 'Pilihan qari lain untuk variasi mendengarkan murottal.', meta: 'Setelan' },
        { title: 'Play per Ayat', description: 'Tekan tombol play pada kartu ayat di Detail Surat.', meta: 'Detail Surat' },
        { title: 'Play Surat', description: 'Gunakan tombol Play pada bagian atas halaman Detail Surat.', meta: 'Audio' },
      ],
    },
  ],
  'Statistik Tilawah': [
    {
      heading: 'Statistik yang Dipantau',
      items: [
        { title: 'Jumlah Catatan', description: 'Menghitung berapa kali pengguna mencatat tilawah.', meta: 'Catatan' },
        { title: 'Ayat Dibaca', description: 'Menjumlahkan ayat dari Catatan Tilawah.', meta: 'Progress' },
        { title: 'Konsistensi', description: 'Melihat kebiasaan membaca berdasarkan tanggal catatan.', meta: 'Evaluasi' },
      ],
    },
  ],
  'Motivasi Islami': [
    {
      heading: 'Pengingat Harian',
      items: [
        { title: 'Sedikit Tapi Rutin', description: 'Amalan yang dicintai Allah adalah yang kontinu walaupun sedikit.', meta: 'Istiqamah' },
        { title: 'Dekat dengan Al-Qur’an', description: 'Luangkan waktu membaca, mendengar, dan memahami walau beberapa ayat.', meta: 'Tilawah' },
        { title: 'Mulai dari Sekarang', description: 'Jangan tunggu sempurna untuk memulai kebiasaan baik.', meta: 'Aksi' },
      ],
    },
  ],
  'Artikel Islam': [
    {
      heading: 'Artikel Singkat',
      items: [
        { title: 'Adab Membaca Al-Qur’an', description: 'Berwudhu, membaca dengan tartil, dan menjaga hati tetap khusyuk.', meta: 'Adab' },
        { title: 'Manfaat Tilawah', description: 'Tilawah membantu menenangkan hati dan memperkuat hubungan dengan Allah.', meta: 'Ibadah' },
        { title: 'Tips Hafalan', description: 'Ulangi ayat pendek, dengarkan murottal, dan setorkan hafalan secara rutin.', meta: 'Hafalan' },
      ],
    },
  ],
  'Kalender Hijriah': [
    {
      heading: 'Bulan Hijriah',
      items: [
        { title: 'Muharram', description: 'Bulan pertama dalam kalender Hijriah.', meta: '1' },
        { title: 'Ramadhan', description: 'Bulan puasa dan turunnya Al-Qur’an.', meta: '9' },
        { title: 'Dzulhijjah', description: 'Bulan haji dan Idul Adha.', meta: '12' },
      ],
    },
  ],
  'Pengingat Ibadah': [
    {
      heading: 'Daftar Pengingat',
      items: [
        { title: 'Tilawah Pagi', description: 'Pengingat membaca Al-Qur’an setelah Subuh.', meta: '05:00' },
        { title: 'Dzikir Petang', description: 'Pengingat dzikir sore dan membaca ayat pilihan.', meta: '17:30' },
        { title: 'Evaluasi Harian', description: 'Cek Catatan Tilawah sebelum tidur.', meta: '21:00' },
      ],
    },
  ],
  'Profil Pengguna': [
    {
      heading: 'Informasi Profil',
      items: [
        { title: 'Nama', description: 'Pengguna Al-Qur’an Digital', meta: 'Pengguna' },
        { title: 'Tujuan', description: 'Membiasakan tilawah dan mencatat progress bacaan.', meta: 'Target' },
        { title: 'Preferensi', description: 'Tema hijau islami dan audio murottal pilihan.', meta: 'Setelan' },
      ],
    },
  ],
  'Edit Profil': [
    {
      heading: 'Data yang Bisa Diubah',
      items: [
        { title: 'Nama Pengguna', description: 'Ubah nama yang tampil di halaman profil.', meta: 'Profil' },
        { title: 'Target Tilawah', description: 'Atur target bacaan harian sesuai kemampuan.', meta: 'Target' },
        { title: 'Preferensi Qari', description: 'Ubah qari dari halaman Setelan.', meta: 'Audio' },
      ],
    },
  ],
};

const premiumFeatureTitles = new Set([
  'Tafsir Ringkas',
  'Audio Murottal',
  'Statistik Tilawah',
  'Target Khatam',
  'Progress Khatam',
  'Pengingat Ibadah',
  'Artikel Islam',
]);

const interactiveFeatureTitles = new Set([
  'Jadwal Tilawah',
  'Target Khatam',
  'Progress Khatam',
  'Pengingat Ibadah',
  'Profil Pengguna',
  'Edit Profil',
]);

export default function SimpleFeatureScreen({ title, subtitle, icon = 'sparkles-outline', children }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const { isPremium } = useAuth();
  const { lastRead } = useBookmarks();
  const sections = contentByTitle[title] ?? [];
  const locked = premiumFeatureTitles.has(title) && !isPremium;
  const interactive = interactiveFeatureTitles.has(title);

  const riwayatSections: ContentSection[] =
    title === 'Riwayat Bacaan'
      ? [
          {
            heading: 'Riwayat Terakhir',
            items: [
              lastRead
                ? {
                    title: `${lastRead.surahName} ayat ${lastRead.ayahNumber}`,
                    description: `Terakhir dibuka pada ${new Date(lastRead.updatedAt).toLocaleDateString('id-ID')}.`,
                    meta: 'Last Read',
                  }
                : {
                    title: 'Belum ada riwayat',
                    description: 'Buka Detail Surat atau putar ayat untuk menyimpan riwayat bacaan.',
                    meta: 'Kosong',
                  },
            ],
          },
        ]
      : sections;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Card style={[styles.hero, { backgroundColor: theme.colors.primaryDeep }]}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name={icon} size={28} color="#FFFFFF" />
        </View>
        <AppText variant="title" color="#FFFFFF">
          {title}
        </AppText>
        <AppText color="#E7FFF4">{subtitle}</AppText>
      </Card>

      {locked ? (
        <Card>
          <View style={[styles.lockIcon, { backgroundColor: theme.colors.primarySoft }]}>
            <Ionicons name="lock-closed" size={26} color={theme.colors.primaryDeep} />
          </View>
          <AppText variant="subtitle">Fitur Premium</AppText>
          <AppText color={theme.colors.muted} style={{ marginTop: 8 }}>
            {"Halaman ini tersedia untuk akun premium. Akun gratis tetap bisa membaca Al-Qur'an dan memakai fitur dasar."}
          </AppText>
          <Pressable onPress={() => router.push('/premium' as never)} style={[styles.premiumButton, { backgroundColor: theme.colors.primaryDeep }]}>
            <AppText color="#FFFFFF" style={{ fontWeight: '900' }}>
              Lihat Paket Premium
            </AppText>
          </Pressable>
        </Card>
      ) : children ? (
        children
      ) : interactive ? (
        <InteractiveFeatureContent title={title} />
      ) : (
        riwayatSections.map((section) => (
          <Card key={section.heading}>
            <AppText variant="subtitle">{section.heading}</AppText>
            <View style={styles.list}>
              {section.items.map((item) => (
                <View key={`${section.heading}-${item.title}`} style={[styles.row, { borderColor: theme.colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <AppText style={{ fontWeight: '900' }}>{item.title}</AppText>
                    <View style={{ marginTop: 4, gap: 4 }}>
                      {item.description.split('\n').map((line, index) => {
                        const arabic = isArabicText(line);
                        return (
                          <AppText
                            key={`${item.title}-${index}`}
                            color={theme.colors.muted}
                            style={arabic ? styles.arabicLine : styles.descriptionLine}>
                            {line}
                          </AppText>
                        );
                      })}
                    </View>
                  </View>
                  {item.meta ? (
                    <View style={[styles.badge, { backgroundColor: theme.colors.primarySoft }]}>
                      <AppText variant="caption" color={theme.colors.primaryDeep} style={{ fontWeight: '900' }}>
                        {item.meta}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, gap: 14, paddingBottom: 34 },
  hero: { gap: 12, borderRadius: 20 },
  iconWrap: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 12, gap: 10 },
  row: { borderTopWidth: 1, paddingTop: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  arabicLine: { textAlign: 'right', writingDirection: 'rtl', fontSize: 21, lineHeight: 36, fontWeight: '700' },
  descriptionLine: { textAlign: 'left' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  lockIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  premiumButton: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
