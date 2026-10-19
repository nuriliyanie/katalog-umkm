# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
Baca AGENTS.md dan docs/user-stories.md bagian US-01. Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase. Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Katalog produk di `app/page.jsx` berhasil terhubung ke tabel `produk` di Supabase di sisi server. Produk ditampilkan menggunakan `KartuProduk`, pesan error ditampilkan jika query gagal, dan tulisan "Belum ada produk" muncul jika database kosong. `CatatanBelumAktif` berhasil dihapus.

**Perbaikan:**
Menambahkan pembersihan otomatis URL Supabase di `lib/supabase/server.js` agar tidak terjadi error 404 (PGRST125) jika URL diakhiri `/rest/v1/`.

## US-02 Detail produk

**Prompt:**
Baca docs/user-stories.md bagian US-02. Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**
Halaman detail produk di `app/produk/[id]/page.jsx` mengambil produk secara server-side dari tabel `produk` berdasarkan parameter URL `id`. Jika produk tidak ada, otomatis memicu `notFound()`.

**Perbaikan:**
Menggunakan query `.maybeSingle()` dan pengecekan error yang aman agar URL dengan ID non-numerik atau tidak ditemukan langsung memicu halaman 404 tanpa error crash.

## US-03 Pesan via WhatsApp

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)". Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**
`TombolWhatsApp.jsx` diubah menjadi tautan `<a>` ke `https://wa.me/<nomorWhatsApp>` dengan pesan otomatis nama dan harga rupiah produk yang di-encode dengan `encodeURIComponent`, serta membuka di tab baru (`target="_blank"`).

**Perbaikan:**
Memastikan nomor diambil langsung dari `lib/toko.js` tanpa simbol `+` atau spasi, dan styling tombol dipertahankan 100%.

## US-04 Login admin

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04. Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
Fungsi `createSessionClient` dibuat di `lib/supabase/server.js` menggunakan `@supabase/ssr` dan cookie. Server Actions `login` dan `logout` dibuat di `app/admin/actions.js`. Halaman login terhubung dengan Server Action dan menampilkan pesan error jika kredensial salah. Tombol keluar di `NavAdmin` mengakhiri sesi.

**Perbaikan:**
Menangani pesan error autentikasi ke dalam bahasa Indonesia ("Email atau password salah.") dan memastikan redirect dieksekusi di luar blok `try...catch` agar tidak tertangkap sebagai error.

## US-05 Ganti password

**Prompt:**
Baca docs/user-stories.md bagian US-05. Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Server Action `gantiPassword` dibuat dengan validasi autentikasi admin (`getUser()`), panjang minimal 8 karakter, dan kecocokan konfirmasi password. Halaman `/admin/password` menampilkan pesan sukses atau error dengan jelas.

**Perbaikan:**
Menghapus duplikasi deklarasi fungsi `gantiPassword` di `app/admin/actions.js` yang sempat menimbulkan build error.

## US-06 Proteksi halaman admin

**Prompt:**
Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06. Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
File `proxy.js` di root proyek berfungsi sebagai middleware di Next.js 16 untuk melindungi seluruh rute `/admin` kecuali `/admin/login`. Setiap Server Action yang memodifikasi data memverifikasi sesi login admin di sisi server. `CatatanBelumAktif` dihapus dari `/admin`.

**Perbaikan:**
Menyesuaikan konfigurasi matcher `["/admin", "/admin/:path*"]` agar proteksi hanya berjalan di rute admin tanpa memperlambat permintaan halaman publik atau file statis.

## Debugging dan fitur bonus

### US-07 List Produk di Halaman Admin
- **Prompt:** Buatkan halaman admin untuk menampilkan daftar seluruh produk yang diambil langsung dari database. Tampilkan dalam bentuk tabel atau kartu dengan kolom nama produk, harga, stok, dan kategori, serta sertakan status pemuatan data dan penanganan eror jika data gagal dimuat.
- **Hasil:** `app/admin/page.jsx` menampilkan seluruh produk dari tabel `produk` Supabase secara server-rendered dinamis dengan `<Suspense>` streaming, status loading (`app/admin/loading.jsx`), dan kolom nama, kategori, harga, stok, serta aksi di `TabelProduk.jsx`.

### US-08 Tambah Produk Baru
- **Prompt:** Buat form tambah produk baru yang hanya bisa diakses oleh admin yang sudah terautentikasi (login). Tambahkan proteksi rute di sisi klien dan validasi sesi/token di sisi server. Form harus memvalidasi input nama, harga, stok, dan deskripsi sebelum disimpan ke database.
- **Hasil:** Dibuat Server Action `tambahProduk` dengan validasi server, proteksi sisi server dan klien di `app/admin/produk/baru/page.jsx` dan `FormProduk.jsx`.
- **Perbaikan:** Menambahkan mekanisme fallback otomatis jika tabel `produk` di database belum memiliki kolom `stok`.

### US-09 Ubah Data Produk
- **Prompt:** Implementasikan fitur edit/ubah data produk yang hanya dapat diakses setelah login. Sediakan tombol edit pada daftar produk admin yang membuka formulir dengan data lama yang sudah terisi otomatis, lalu perbarui data tersebut di database saat disimpan.
- **Hasil:** Halaman `/admin/produk/[id]/ubah` memuat data lama produk dari database Supabase, dan Server Action `ubahProduk` menyimpan pembaruan ke database dengan verifikasi login.

### US-10 Hapus Produk
- **Prompt:** Buat fungsi untuk menghapus produk dari database yang diproteksi autentikasi login admin. Tambahkan modal konfirmasi sebelum aksi hapus dijalankan agar mencegah penghapusan data secara tidak sengaja.
- **Hasil:** Dibuat modal dialog konfirmasi hapus di `TabelProduk.jsx` dan Server Action `hapusProduk` yang menghapus data dari Supabase dengan proteksi sesi admin.

### US-11 Filter Kategori dan Pencarian
- **Prompt:** Tambahkan fitur pencarian teks dan filter berdasarkan kategori pada halaman produk. Pastikan daftar produk diperbarui secara instan atau melalui tombol filter, dan tampilkan pesan khusus jika produk yang dicari tidak ditemukan.
- **Hasil:** Komponen `KatalogProduk.jsx` dan `TabelProduk.jsx` dilengkapi kolom pencarian teks instan, tombol filter kategori dinamis, dan pesan khusus jika hasil pencarian tidak ditemukan.

### US-12 Pemilih Varian dan Kuantitas
- **Prompt:** Implementasikan pemilih varian (seperti warna atau ukuran) dan pengatur kuantitas (tambah/kurang jumlah) pada halaman detail produk. Pastikan harga dan ketersediaan stok menyesuaikan varian yang dipilih sebelum dimasukkan ke keranjang belanja.
- **Hasil:** Komponen `DetailProdukInteraktif.jsx` menyediakan pemilih varian, pengatur kuantitas dengan batas stok, tombol tambah ke keranjang, dan pesan WhatsApp yang terisi otomatis memuat varian serta jumlah pesanan.

### US-13 Progressive Web App (PWA)
- **Prompt:** Konfigurasikan aplikasi ini agar menjadi Progressive Web App (PWA) yang dapat diinstal di perangkat ponsel pintar. Buat file manifest.json lengkap dengan ikon aplikasi dan daftarkan service worker untuk caching aset dasar.
- **Hasil:** Dibuat `public/manifest.json`, service worker `public/sw.js` untuk caching aset statis dasar, dan komponen `PWARegistration.jsx` di `RootLayout`.

### US-14 Deskripsi Produk dengan AI
- **Prompt:** Integrasikan fitur pembuatan deskripsi produk otomatis menggunakan AI pada form produk admin. Buat tombol 'Generate Deskripsi' yang mengirimkan parameter nama produk, kategori, dan kata kunci ke API AI, lalu otomatis mengisi kolom deskripsi dengan hasilnya.
- **Hasil:** Server Action `generateDeskripsiProduk` terhubung dengan Google Gemini API (`gemini-1.5-flash`) dengan smart fallback, dan tombol "Generate Deskripsi" di `FormProduk.jsx` yang otomatis mengisi kolom deskripsi.
