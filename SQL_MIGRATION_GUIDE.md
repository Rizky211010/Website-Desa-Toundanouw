# 📚 PANDUAN MENJALANKAN SQL MIGRATION

## 🎯 Tujuan
Menambahkan tabel-tabel database yang hilang untuk fitur Wilayah Desa dan Penduduk & Pekerjaan.

---

## 📋 Ada 2 File SQL yang Perlu Dijalankan

### File 1: `01-ADD-WILAYAH-TABLES.sql` ⭐ (UTAMA)
- **Fungsi:** Menambah tabel wilayah_desa, penggunaan_lahan, dan semua tabel penduduk
- **Ukuran:** ~185 baris SQL
- **Waktu:** ~5-10 detik

### File 2: `02-FIX-DATA.sql` ⭐ (CLEANUP)
- **Fungsi:** Menghapus duplicate data dan menambah missing columns
- **Ukuran:** ~30 baris SQL
- **Waktu:** ~3-5 detik

---

## 🚀 LANGKAH PER LANGKAH

### STEP 1: Buka Supabase Dashboard

1. Buka: https://supabase.com
2. Login dengan akun kamu
3. Pilih project: **xinbgthvadkbsliocxaw**

```
Project ID: xinbgthvadkbsliocxaw
Region: Singapore
```

---

### STEP 2: Buka SQL Editor

1. Di sidebar, klik **"SQL Editor"**
2. Klik tombol **"New Query"** (tombol hijau di kanan atas)
3. Tunggu tab baru terbuka

---

### STEP 3: Copy File Pertama (01-ADD-WILAYAH-TABLES.sql)

1. **Di VS Code atau file manager:**
   - Buka file: `database/01-ADD-WILAYAH-TABLES.sql`
   - Pilih semua (Ctrl+A)
   - Copy (Ctrl+C)

2. **Di Supabase SQL Editor:**
   - Paste ke text area (Ctrl+V)
   - Textarea harus penuh dengan kode SQL

---

### STEP 4: Jalankan Query Pertama

1. Klik tombol **"Run"** (di kanan atas, tombol biru)
2. Tunggu notifikasi **"Success"** muncul (biasanya 5-10 detik)
3. Lihat console di bawah: seharusnya ada banyak pesan `"CREATE TABLE"`

```
✅ Expected output:
- CREATE TABLE wilayah_desa
- CREATE TABLE penggunaan_lahan
- CREATE TABLE kelompok_umur
- CREATE TABLE pekerjaan_penduduk
- CREATE TABLE pendidikan_penduduk
- CREATE TABLE agama_penduduk
- ALTER TABLE jaga
- INSERT INTO ... (seed data)
```

---

### STEP 5: Copy File Kedua (02-FIX-DATA.sql)

1. **Buat Query Baru:**
   - Klik tombol **"New Query"** lagi
   - Atau bersihkan text area saat ini (Ctrl+A, Delete)

2. **Buka file kedua:**
   - File: `database/02-FIX-DATA.sql`
   - Copy (Ctrl+A → Ctrl+C)

3. **Di Supabase:**
   - Paste ke text area (Ctrl+V)

---

### STEP 6: Jalankan Query Kedua

1. Klik tombol **"Run"**
2. Tunggu **"Success"** notification
3. Lihat console: seharusnya ada banyak pesan `DELETE` dan `UPDATE`

```
✅ Expected output:
- DELETE FROM kelompok_umur WHERE ... (duplicate removal)
- ALTER TABLE potensi_desa ADD COLUMN (add missing columns)
- UPDATE potensi_desa SET ... (add sample data)
```

---

### STEP 7: Refresh & Test Aplikasi

1. **Refresh browser** dengan aplikasi Desa Toundanouw
   - Tekan F5 atau Ctrl+R

2. **Test Wilayah Desa:**
   - Go to: Admin Dashboard > Konten > Jelajahi > Wilayah Desa
   - Coba "Tambah Wilayah Desa"
   - Input data → Simpan
   - Seharusnya berhasil ✅

3. **Test Penduduk & Pekerjaan:**
   - Go to: Admin Dashboard > Konten > Jelajahi > Penduduk & Pekerjaan
   - Coba input statistik
   - Seharusnya berhasil ✅

4. **Test Kontak Form:**
   - Go to: http://localhost:3000/kontak
   - Fill form (nama, kontak, pesan)
   - Klik "Kirim Pesan"
   - Seharusnya muncul pesan sukses ✅

---

## ⚠️ TROUBLESHOOTING

### Error: "Table already exists"
- Ini normal jika file sudah dijalankan sebelumnya
- Solusi: File sudah punya `IF NOT EXISTS`, jadi aman dijalankan lagi

### Error: "Could not find the table"
- Berarti Step 1 belum berhasil
- Cek console: ada error message?
- Coba jalankan ulang Step 1

### Form masih tidak bisa input
- Pastikan sudah menjalankan KEDUA file SQL
- Refresh browser
- Clear browser cache (Ctrl+Shift+Delete)
- Logout dan login ulang (jika ada session)

### Duplicate data masih ada
- Pastikan sudah menjalankan File 2 (02-FIX-DATA.sql)
- File 2 adalah untuk menghapus duplicate

---

## 📝 Isi File yang Dijalankan

### 01-ADD-WILAYAH-TABLES.sql mencakup:

```sql
-- Tabel Wilayah
CREATE TABLE wilayah_desa (
  id, luas_wilayah, batas_utara, batas_selatan,
  batas_timur, batas_barat, topografi, iklim, 
  curah_hujan, created_at
)

CREATE TABLE penggunaan_lahan (
  id, wilayah_id, tipe_lahan, luas_tanah,
  persentase, keterangan, created_at
)

-- Tabel Penduduk
CREATE TABLE kelompok_umur (
  id, nama_kelompok, rentang_usia, laki_laki,
  perempuan, total, urutan, created_at
)

CREATE TABLE pekerjaan_penduduk (
  id, nama_pekerjaan, jumlah_pria, jumlah_wanita,
  total, persentase, created_at
)

CREATE TABLE pendidikan_penduduk (
  id, tingkat_pendidikan, laki_laki, perempuan,
  total, persentase, created_at
)

CREATE TABLE agama_penduduk (
  id, nama_agama, laki_laki, perempuan, total,
  persentase, created_at
)

-- Update Tabel Existing
ALTER TABLE jaga (
  tambah kolom: batas_utara, batas_selatan, dll
)
```

### 02-FIX-DATA.sql mencakup:

```sql
-- Hapus Duplicate
DELETE FROM kelompok_umur WHERE ... (remove duplicates)

-- Tambah Missing Columns
ALTER TABLE potensi_desa ADD COLUMN nilai_ekonomi
ALTER TABLE potensi_desa ADD COLUMN pemilik
ALTER TABLE potensi_desa ADD COLUMN urutan

-- Update Sample Data
UPDATE potensi_desa SET nilai_ekonomi = ... WHERE ...
```

---

## ✅ VERIFIKASI SETELAH SELESAI

Jalankan ini di Supabase SQL Editor untuk verifikasi:

```sql
-- Check tabel baru
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check data
SELECT COUNT(*) FROM wilayah_desa;
SELECT COUNT(*) FROM kelompok_umur;
SELECT COUNT(*) FROM pekerjaan_penduduk;
```

Seharusnya menunjukkan:
- ✅ wilayah_desa exists
- ✅ penggunaan_lahan exists
- ✅ kelompok_umur exists (6 rows, no duplicates)
- ✅ pekerjaan_penduduk exists
- ✅ pendidikan_penduduk exists
- ✅ agama_penduduk exists

---

## 🎉 DONE!

Setelah menjalankan kedua file SQL:

1. ✅ Wilayah Desa form akan working
2. ✅ Penduduk & Pekerjaan form akan working
3. ✅ Kontak form sudah working (diperbaiki hari ini)
4. ✅ Semua data clean tanpa duplicate

**Estimated time:** 5-10 menit untuk semua langkah

---

## 📞 Bantuan

Jika ada error:
1. Copy error message
2. Cek di file: `database/01-ADD-WILAYAH-TABLES.sql` atau `02-FIX-DATA.sql`
3. Lihat console Supabase untuk detail error
4. Coba jalankan ulang
