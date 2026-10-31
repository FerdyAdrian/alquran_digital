# Al-Qur'an Digital

Aplikasi Android/iOS/web dengan Al-Qur'an dan murottal, bookmark, jadwal salat, kiblat, pengingat, serta satu banner AdMob di beranda.

- `alquran/`: aplikasi Expo. Jalankan `npm ci`, isi variabel pada `.env.supabase.example` dalam `.env.local`, lalu `npm start`.
- `alquran_backend/supabase/`: schema Postgres dan fungsi hapus akun untuk Supabase.
- `alquran_backend/web/`: halaman bantuan, privasi, penghapusan akun dan app-ads.txt.
- [Panduan backend](alquran_backend/README.md)

## Build Android
Dari folder `alquran`, gunakan EAS profile `preview` untuk APK uji dan `production` untuk AAB. Preview memakai iklan uji. ID produksi pemilik tersedia pada konfigurasi EAS. Jangan klik iklan produksi sendiri.

## Hosting web
Di Vercel, pilih Root Directory `alquran`, build `npm run build:web`, output `dist`, dan isi EXPO_PUBLIC_SUPABASE_URL serta EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY di Environment Variables. File vercel.json sudah disediakan. Vercel Hobby membatasi penggunaan nonkomersial; untuk aplikasi beriklan gunakan paket yang mengizinkan penggunaan komersial. Alternatif paket gratis: hosting statis yang mengizinkan penggunaan komersial, seperti Cloudflare Pages sesuai kuotanya. Backend tetap berjalan di Supabase.

Untuk hanya website bantuan, deploy isi `alquran_backend/web` sebagai website statis. Setelah mempunyai URL publik, pasang `/privacy.html` dan `/delete-account.html` di Google Play Console serta website developer yang sesuai untuk app-ads.txt.

## Sebelum rilis publik
Atur custom SMTP dan template kode pada Supabase, uji alur akun pada akun uji, pasang halaman privasi publik, dan uji GPS/kompas/notifikasi pada ponsel. Isi deklarasi Data safety sesuai SDK dan data yang diproses. Status build dan panduan toko terdapat pada `alquran/release/`.

Publishable key Supabase dan ID AdMob adalah konfigurasi publik. Service role, secret key, password SMTP, access token deployment dan keystore tidak boleh dimasukkan ke aplikasi atau repositori.

Referensi paket hosting: https://vercel.com/docs/plans/hobby
