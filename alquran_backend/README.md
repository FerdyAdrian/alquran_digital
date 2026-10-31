# Backend Al-Qur'an Digital — Supabase

Backend yang dipakai aplikasi berada di folder `supabase/`. Website bantuan statis berada di `web/`.

Project URL: https://ikozoeswmedhrlcdtooi.supabase.co
Email dukungan: copawork0@gmail.com

## Database
Schema deklaratif: `supabase/schemas/001_app.sql`.
Schema awal sudah dijalankan oleh pemilik melalui SQL Editor. Jangan jalankan lagi pada database yang sama karena tabel sudah ada. Tidak ada migrasi otomatis atau penghapusan data layanan Laravel lama.
Tabel: tilawah_notes, tilawah_schedules, khatam_targets, worship_reminders.
Setiap tabel memiliki RLS berdasarkan auth.uid(), foreign key ke auth.users dengan ON DELETE CASCADE, validasi input, serta index untuk pemilik. Anon tidak mendapat akses tabel. Hak premium berasal dari app_metadata yang dikelola server, bukan metadata yang dapat diedit pengguna.
Perubahan selanjutnya: ubah schema deklaratif, buat diff/migrasi dengan Supabase CLI + database lokal, tinjau, dan uji sebelum diterapkan ke produksi.

## Penghapusan akun
Kode sumber: `supabase/functions/delete-account/`.
File siap tempel Dashboard: `supabase/dashboard/delete-account.ts` (hasil gabungan index.ts dan handler.ts).
Nama fungsi: delete-account. Di Dashboard, isi file index.ts dengan kode siap tempel. Nonaktifkan Verify JWT with legacy secret, lalu simpan. Handler memvalidasi bearer token melalui Auth getUser; anon dan token palsu ditolak. Identitas akun tidak diambil dari request body. Handler mencabut sesi lalu menghapus akun; FK menghapus data terkait.
SUPABASE_URL, SUPABASE_ANON_KEY dan SUPABASE_SERVICE_ROLE_KEY dipasok otomatis pada runtime fungsi Supabase. Service role tidak boleh ditaruh di aplikasi, variabel EXPO_PUBLIC, GitHub atau chat.
Dengan scoped access token yang disimpan di lingkungan terminal, deployment CLI tanpa Docker:
`npx supabase functions deploy delete-account --project-ref ikozoeswmedhrlcdtooi --use-api --no-verify-jwt`
Token cukup dibatasi ke proyek ini dan izin edge_functions_write. CLI dapat memerlukan izin read sesuai mode yang dipakai; lihat `functions deploy --help`. Jangan gunakan --prune pada proyek yang mempunyai fungsi lain.

## Email autentikasi (wajib sebelum pendaftaran umum)
1. Supabase Dashboard > Authentication > Email/SMTP settings: pasang custom SMTP. SMTP bawaan Supabase dibatasi dan umumnya hanya mengirim ke anggota tim proyek; tidak cocok untuk pengguna umum.
2. Opsi awal tanpa biaya langganan: Gmail SMTP jika akun pemilik mendukung App Password. Aktifkan verifikasi dua langkah Google dan buat App Password, lalu masukkan langsung di Dashboard Supabase, jangan di kode atau chat. Akun Workspace tertentu mungkin melarangnya; gunakan provider SMTP dengan paket gratis bila perlu.
3. Contoh Gmail: sender email dan username copawork0@gmail.com, host smtp.gmail.com, port 587 (TLS), password adalah App Password. Nama pengirim: Al-Qur'an Digital. Ikuti batas pengiriman/rate limit dan pantau kegagalan; layanan gratis memiliki kuota dan bukan jaminan pengiriman.
4. Authentication > Email Templates > Confirm signup: ganti isi dengan `supabase/templates/confirmation.html`.
5. Template Reset password: pakai `supabase/templates/recovery.html`.
6. Kedua template menampilkan {{ .Token }}. Aplikasi menyediakan halaman untuk mengetik kode; tidak memerlukan deep link untuk konfirmasi signup/reset.
7. Pertahankan konfirmasi email dan gunakan password minimal 8 karakter. Aktifkan rate limit dan perlindungan anti-abuse yang sesuai. Jangan mematikan konfirmasi hanya untuk melewati konfigurasi SMTP.
8. Setelah website bantuan dipublikasikan, isi Site URL dengan alamat website tersebut. Pertahankan konfirmasi aman untuk perubahan email; alur perubahan email memakai link bawaan Supabase.

## Website bantuan, privasi, dan app-ads.txt
`web/` merupakan website statis siap hosting. Jalankan `node web/generate.mjs` untuk membuat ulang dari kebijakan JSON pada aplikasi mobile.
Halaman: index.html, privacy.html, delete-account.html, app-ads.txt.
Pilihan gratis: hosting statis yang mengizinkan penggunaan komersial, misalnya Cloudflare Pages sesuai paket/ketentuannya. Upload aset HTML tanpa server atau database tambahan. Vercel juga dapat dipakai dengan paket yang mengizinkan penggunaan komersial; Hobby dibatasi untuk penggunaan personal nonkomersial, jadi tidak cocok untuk monetisasi iklan.
URL publik diperlukan di Google Play untuk Privacy Policy dan Delete account. Gunakan domain website yang sama dalam informasi developer toko agar AdMob menemukan app-ads.txt.

## Pemeriksaan
`cd tests && npm ci && npm test`: Postgres PGlite menjalankan schema dan menguji RLS antar pengguna, input invalid, perubahan pemilik, RPC, pembaruan progress, serta cascade akun. Handler HTTP diuji untuk token palsu, ID korban pada body, dan kegagalan pencabutan sesi.
`npx deno check --config supabase/functions/deno.json supabase/functions/delete-account/index.ts`: pemeriksaan tipe runtime fungsi.
Pengujian lokal tidak menggantikan pengujian signup/login/reset/password dan hapus akun pada akun uji di proyek produksi.

Referensi:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/functions/quickstart-dashboard
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://vercel.com/docs/plans/hobby

Pemeriksaan proyek aktif: schema berhasil dibuat dan keempat tabel menolak akses anon (401 permission denied). Fungsi delete-account sudah dideploy pemilik; OPTIONS mendapat 204, POST tanpa login dan token palsu mendapat 401. Penghapusan akun nyata belum diuji.
