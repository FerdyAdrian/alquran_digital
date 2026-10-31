# Status persiapan rilis Android

Tanggal: 31 Oktober 2026
Package: dev.dcodeinnovation.alqurandigital
Versi: 1.0.0
Akun Expo: fxzephyr
Project ID: 5716faa4-3a7a-47ff-a16a-608e808ffd4c
Supabase: https://ikozoeswmedhrlcdtooi.supabase.co
Dukungan: copawork0@gmail.com
Repositori tujuan: https://github.com/FerdyAdrian/alquran_digital

## Selesai
- Login, pendaftaran, verifikasi kode email, reset password, edit profil, catatan tilawah, jadwal, target dan pengingat akun disambungkan ke Supabase. Laravel API lama yang 404 tidak lagi dipakai.
- Schema empat tabel sudah diterapkan pemilik. Akses anonim ke keempat tabel ditolak pada proyek aktif.
- RLS membatasi data berdasarkan auth.uid(), validasi input dan FK ON DELETE CASCADE telah diuji dengan Postgres PGlite.
- Fungsi delete-account sudah dideploy pemilik. OPTIONS = 204, POST tanpa login = 401, token palsu = 401. Identitas penghapusan berasal dari Auth getUser dan sesi dicabut sebelum akun dihapus.
- Sesi Android/iOS disimpan di SecureStore dengan pemecahan nilai untuk batas Keychain. Uji Unicode, kegagalan tulis, penggantian dan penghapusan lulus. Sesi Laravel lama dihapus lokal; data bacaan/bookmark dipertahankan. Data server Laravel tidak dimigrasikan.
- Satu banner AdMob hanya di beranda. App ID dan Banner ID Android pemilik terpasang. Profil preview memakai iklan uji.
- Jadwal lima waktu berbasis kota/GPS, zona waktu lokasi, kiblat dan petunjuk kalibrasi, serta pengingat tujuh hari tersedia. Audio adzan CC0 dipotong menjadi 25 detik; adzan penuh tidak otomatis berjalan saat aplikasi ditutup.
- Izin mikrofon/penyimpanan lama/overlay diblokir. Ikon dan konfigurasi native diperbaiki. Signing dikelola sebagai remote credentials EAS.
- Pembelian premium yang belum mempunyai verifikasi pembayaran dinonaktifkan. Hak premium dibaca dari app_metadata server, bukan metadata pengguna.
- Kebijakan privasi tersedia di aplikasi dan website statis, dengan halaman permintaan hapus akun dan app-ads.txt.
- Ikon Google Play 512x512, feature graphic 1024x500, serta draf deskripsi toko tersedia.
- TypeScript, lint, pemeriksaan zona waktu/kiblat, pengujian sesi aman, pengujian schema/RLS dan fungsi hapus akun, pemeriksaan Deno, serta export web lulus.

## Build Android
Build awal gagal karena Google Mobile Ads SDK 25.4 memerlukan Kotlin yang lebih baru dari compiler proyek. Paket react-native-google-mobile-ads dipin ke 16.0.0 dengan SDK Android 24.6.0 untuk memperbaiki ketidakcocokan ini.
Build ulang APK: https://expo.dev/accounts/fxzephyr/projects/al-quran-digital/builds/d032938d-7eb4-4007-b18a-0770d07133b0
Status terakhir: FINISHED. APK pengujian berhasil dibuat; belum diuji pada ponsel dan belum diajukan ke Google Play.
Unduh APK: https://expo.dev/artifacts/eas/HYrmap6tPZBppxCJ5DFJHjTX1-E7T_hBh1Ez7EooXyU.apk
APK ini dibuat sebelum perubahan email dukungan ke copawork0@gmail.com; perubahan kontak terbaru akan masuk pada build berikutnya.

## Belum selesai sebelum rilis publik
1. Custom SMTP Supabase harus dikonfigurasi, kemudian template confirmation/recovery memakai kode {{ .Token }}. Contoh template berada di alquran_backend/supabase/templates. Jangan mematikan konfirmasi email. Isi Site URL setelah website bantuan tersedia.
2. Uji signup, konfirmasi, login, refresh sesi, reset password, perubahan email, catatan lintas akun, dan penghapusan pada akun uji nyata. Tidak ada akun nyata yang dihapus dalam pemeriksaan otomatis ini.
3. APK sudah tersedia. Uji pada ponsel: bacaan/murottal, GPS/kalibrasi, notifikasi dengan layar terkunci, izin ditolak, tema gelap dan offline. Ambil screenshot asli untuk toko.
4. Publish website bantuan (hosting yang mengizinkan penggunaan komersial). Pasang URL privacy.html, delete-account.html dan app-ads.txt pada konfigurasi Google Play/AdMob yang sesuai. Vercel Hobby hanya untuk nonkomersial; pilih paket yang sesuai atau hosting statis gratis yang mengizinkan penggunaan komersial.
5. Sumber monorepo disiapkan pada folder release-source. Push ditolak karena credential GitHub yang tersedia adalah flzh29, bukan pemilik repo FerdyAdrian. Perlu login akun yang punya akses; credential yang ada tidak dihapus.
6. Lengkapi profil pembayaran, kesiapan aplikasi, Privacy & messaging dan kategori iklan di AdMob.
7. Lengkapi identitas penerbit, Data safety, rating konten, target audiens, deklarasi iklan dan akses pengulas di Google Play. Konfirmasi hak penggunaan komersial konten/murottal dari penyedia data.
8. Pemeriksaan dependency memperbaiki peringatan kritis melalui update yang kompatibel, tetapi npm audit masih melaporkan 19 temuan (8 low, 5 moderate, 6 high), terutama graph dependensi Expo/tooling. Belum dilakukan pembuktian keterjangkauan setiap temuan. Jangan memakai audit fix --force karena saran otomatis dapat mengganti SDK secara tidak kompatibel; perlu peninjauan/upgrade terarah sebelum rilis umum.
9. Setelah lolos pengujian, buat AAB production dan unggah ke pengujian internal Google Play. Belum ada AAB yang diajukan atau aplikasi yang dipublikasikan. Akun personal tertentu memerlukan minimal 12 penguji closed testing selama 14 hari berturut-turut sesuai persyaratan yang muncul di Play Console.

Referensi resmi:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://support.google.com/googleplay/android-developer/answer/13327111
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/9858738
- https://vercel.com/docs/plans/hobby
