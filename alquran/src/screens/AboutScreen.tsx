import { ScrollView, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useTheme } from '../context/ThemeContext';

const aboutSections = [
  {
    title: 'Audio adzan',
    body: 'Beautiful adhan — Adam-synagda, CC0 1.0 (bebas penggunaan komersial). Sumber: https://commons.wikimedia.org/wiki/File:Beautiful_adhan.ogg. Audio pengingat dipotong menjadi 25 detik, diubah menjadi mono dan diberi fade. Ini adalah potongan pembuka, bukan adzan lengkap.',
  },
  {
    title: 'Visi',
    body: "Menjadi aplikasi Al-Qur'an digital yang membantu pengguna membaca, mendengar, memahami, dan menjaga konsistensi ibadah harian.",
  },
  {
    title: 'Misi',
    body: "Menyediakan bacaan Al-Qur'an, audio murottal, doa harian, tafsir ringkas, target khatam, pengingat ibadah, artikel Islami, dan statistik tilawah dalam satu aplikasi yang mudah digunakan.",
  },
  {
    title: 'Fitur',
    body: 'Daftar surah, pencarian surah, bookmark ayat, surat favorit, audio murottal, Juz 30, doa harian, Asmaul Husna, kalender Hijriah, jadwal sholat, target khatam, riwayat bacaan, dan premium.',
  },
  {
    title: 'Premium',
    body: 'Premium membuka tafsir ringkas, statistik tilawah, artikel Islam, audio lanjutan, target/progress khatam, dan pengingat ibadah yang tersimpan di akun online.',
  },
  {
    title: 'Developer',
    body: 'Tim Al-Qur’an Digital\nEmail: copawork0@gmail.com\nWebsite: https://github.com/FerdyAdrian/alquran_digital',
  },
  {
    title: 'Kebijakan',
    body: 'Baca Kebijakan privasi melalui halaman Setelan. Pembelian premium belum tersedia. Penghapusan akun dapat diminta melalui Setelan atau email dukungan.',
  },
  {
    title: 'Sumber Data',
    body: "Data surah, ayat, latin, terjemahan, deskripsi, dan audio memakai sumber API Al-Qur'an publik. Jadwal sholat memakai API berbasis kota atau koordinat lokasi.",
  },
  {
    title: 'Ucapan Terima Kasih',
    body: "Terima kasih kepada penyedia data Al-Qur'an, para qari, dan komunitas open source yang mendukung pengembangan aplikasi Islami.",
  },
];

export default function AboutScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <AppText variant="title">Tentang Aplikasi</AppText>

      <Card>
        <AppText variant="subtitle">{"Al-Qur'an Digital"}</AppText>
        <AppText color={theme.colors.muted} style={{ marginTop: 8 }}>
          {"Aplikasi mobile modern untuk membaca, mendengarkan, menyimpan, dan mempelajari Al-Qur'an dengan terjemahan Bahasa Indonesia."}
        </AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">Informasi Aplikasi</AppText>
        <View style={styles.list}>
          <AppText>Versi: 1.0.0</AppText>
          <AppText>Platform: Android, iOS, dan Web</AppText>
          <AppText>Lisensi: Edukasi dan ibadah digital</AppText>
        </View>
      </Card>

      {aboutSections.map((section) => (
        <Card key={section.title}>
          <AppText variant="subtitle">{section.title}</AppText>
          <AppText color={theme.colors.muted} style={{ marginTop: 8 }}>
            {section.body}
          </AppText>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, gap: 14, paddingBottom: 32 },
  list: { gap: 8, marginTop: 10 },
});
