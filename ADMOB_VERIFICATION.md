# Verifikasi AdMob app-ads.txt

Website developer yang digunakan: https://alqurandigital-alquran.vercel.app/
File publik: https://alqurandigital-alquran.vercel.app/app-ads.txt

Isi yang diwajibkan akun AdMob:

```text
google.com, pub-5041245306964870, DIRECT, f08c47fec0942fa0
```

Pada pemeriksaan 13 November 2026, file Vercel memberi HTTP 200 dan berisi ID yang benar. Namun listing publik Google Play masih menautkan https://alquran.dcodeinnovation.dev dan /app-ads.txt di domain tersebut memberi HTTP 404. Mengunggah kode GitHub tidak mengubah Website developer pada Google Play.

## Langkah pemilik
1. Buka aplikasi di Play Console, cari pengaturan kontak listing toko / Website developer.
2. Ganti Website ke https://alqurandigital-alquran.vercel.app/ lalu simpan dan kirim/publikasikan perubahan listing sesuai alur Play Console.
3. Pastikan bagian Dukungan aplikasi di listing publik menampilkan link website Vercel tersebut.
4. Pada AdMob, klik Check for updates. Perubahan listing dan file dapat memerlukan hingga 24 jam untuk terdeteksi.

Vercel: gunakan Root Directory alquran untuk website Expo (build npm run build:web, output dist), atau alquran_backend/web untuk website bantuan statis. Kedua sumber memiliki app-ads.txt yang sama. Header untuk file ini memakai text/plain dan meminta validasi ulang cache.

Tidak perlu membuat AAB baru untuk perbaikan website atau kontak listing ini. Status verifikasi akhir ditentukan AdMob.

Panduan resmi: https://support.google.com/admob/answer/9776740?hl=id
