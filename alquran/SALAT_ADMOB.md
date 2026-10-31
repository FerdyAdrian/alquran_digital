# Salat, kiblat, adzan, dan iklan

Aplikasi aktif: folder `alquran`. Backend dan perubahan lokal sebelumnya tidak perlu diganti.

## Yang tersedia
- Beranda: satu banner AdMob, dipisah dari tombol/daftar surah. Tidak ada iklan di halaman lain, pop-up, atau video wajib. Akun premium tidak melihat banner.
- Menu Salat & Kiblat: jadwal kota Indonesia/GPS, zona waktu lokasi, jadwal berikutnya, kompas utara sejati dengan pemeriksaan kalibrasi.
- Pengingat: jadwal aktual untuk 7 hari, bukan jam yang diulang setiap hari. Aktifkan ulang sebelum habis atau setelah berpindah kota. Notifikasi mengikuti pengaturan bunyi dan baterai OS.
- Audio: Beautiful adhan oleh Adam-synagda, CC0, sumber dan perubahan di `assets/audio/README.txt` serta halaman Tentang. Notifikasi memakai potongan 25 detik; adzan lengkap tidak berjalan otomatis saat aplikasi ditutup.
- Kegagalan API tidak menampilkan jadwal contoh. Tidak ada jadwal offline yang belum terverifikasi.

## Membuat iklan berpenghasilan
1. Daftar menggunakan akun Google milik pemilik aplikasi di https://admob.google.com/.
2. Lengkapi informasi akun/pembayaran dan proses verifikasi yang diminta Google.
3. Tambahkan aplikasi Android dengan package `dev.dcodeinnovation.alqurandigital`; daftarkan iOS secara terpisah bila akan dirilis.
4. Buat satu unit iklan Banner per platform.
5. Salin `.env.ads.example` ke `.env.local`, isi App ID (`~`) dan Banner ID (`/`). Atur variabel yang sama di lingkungan build EAS.
6. Di AdMob, siapkan Privacy & messaging serta kebijakan privasi aplikasi. Pilih/blokir kategori iklan yang sesuai untuk aplikasi ibadah. Ikuti proses kesiapan aplikasi dan app-ads.txt bila diminta Google.
7. Build ulang aplikasi native dan uji dengan ID uji/perangkat uji. Jangan klik iklan produksi sendiri.

App ID Android pemilik sudah dipasang. Banner ID Android sudah diatur untuk profil production. Platform iOS masih memakai App ID contoh. Mode development dan profil preview memakai banner uji. Build produksi tanpa Banner ID menyembunyikan iklan. Jika App ID diisi, pastikan sesuai platform dan Banner ID dari aplikasi yang sama.
SDK mengumpulkan consent sebelum inisialisasi, meminta iklan non-personalized, dan menyediakan pilihan privasi bila UMP mewajibkannya. Detail monetisasi tetap memerlukan akun AdMob pemilik, persetujuan Google, dan pengguna nyata; tidak ada jaminan penghasilan.

## Menjalankan dan memeriksa
- `node scripts/check-prayer.cjs`: perhitungan kiblat, validasi koordinat, zona WIB/WITA/WIT, dan pergantian tanggal.
- `npx tsc --noEmit`, `npm run lint`, `npm run build:web`.
- Gunakan development build / build EAS untuk iklan native dan suara notifikasi khusus. Expo Go tidak memuat SDK AdMob. Web tidak menampilkan banner AdMob atau menjadwalkan notifikasi native.
- Konfigurasi dinamis berada di `app.config.js`; plugin menyertakan `assets/audio/adzan.wav`.
- Uji GPS, kalibrasi, pengiriman notifikasi saat layar terkunci, mode senyap, dan izin Android/iOS pada perangkat nyata sebelum rilis.

Referensi:
- https://support.google.com/admob/answer/7356219?hl=id
- https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent
- https://docs.expo.dev/versions/v54.0.0/sdk/notifications/
- https://aladhan.com/prayer-times-api
