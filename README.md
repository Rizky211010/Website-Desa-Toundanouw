# 🏘️ Website Desa Toundanouw

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

**Sistem Informasi Desa Modern untuk Pelayanan Masyarakat**

*Desa Toundanouw, Kec. Touluaan, Kab. Minahasa Tenggara, Sulawesi Utara*

</div>

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Database Setup](#-database-setup)
- [Menjalankan Project](#-menjalankan-project)
- [Deployment](#-deployment)
- [Struktur Folder](#-struktur-folder)
- [API Endpoints](#-api-endpoints)
- [Lisensi](#-lisensi)

---

## 🎯 Tentang Project

Website Desa Toundanouw adalah sistem informasi desa berbasis web yang dirancang untuk meningkatkan pelayanan publik dan transparansi informasi kepada masyarakat. Website ini menyediakan informasi lengkap tentang desa, layanan administrasi, berita terkini, dan berbagai fitur interaktif lainnya. Dikembangkan oleh **KKT 145 Universitas Sam Ratulangi**.

---

## ✨ Fitur

### 🌐 Halaman Publik
- **Beranda** - Hero slider, statistik desa, berita terbaru, galeri
- **Profil Desa** - Sejarah, visi misi, struktur organisasi
- **Jelajahi** - Data wilayah, penduduk, dan organisasi
- **Berita** - Artikel dan pengumuman desa
- **Galeri** - Dokumentasi foto kegiatan desa
- **Potensi Desa** - Informasi potensi dan UMKM
- **Layanan Surat** - Download template surat administrasi
- **Kontak** - Form pesan dan informasi kontak

### 🔐 Panel Admin
- **Dashboard** - Ringkasan statistik dan aktivitas
- **Manajemen Berita** - CRUD artikel dengan upload gambar
- **Manajemen Galeri** - Upload dan kelola foto
- **Manajemen Surat** - Kelola template surat
- **Data Penduduk** - Statistik demografi
- **Data Wilayah** - Informasi geografis desa
- **Pesan Masuk** - Kelola pesan dari masyarakat
- **Notifikasi** - Sistem notifikasi real-time
- **Pengaturan** - Konfigurasi website dan admin

---

## 🛠 Tech Stack

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **Next.js** | 15+ | React Framework dengan App Router |
| **TypeScript** | 5+ | Type-safe JavaScript |
| **Tailwind CSS** | 4+ | Utility-first CSS Framework |
| **Supabase** | 2.86+ | Backend as a Service (Database & Storage) |
| **Lucide React** | 0.460+ | Icon Library |
| **bcryptjs** | 3+ | Password Hashing |

---

## 📦 Instalasi

### Prasyarat

- Node.js 18.17 atau lebih baru
- npm, yarn, pnpm, atau bun
- Akun Supabase (gratis)

### Clone Repository

```bash
git clone https://github.com/username/website-desa-toundanouw.git
cd website-desa-toundanouw
```

### Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

---

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Mendapatkan Kredensial Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Pergi ke **Project Settings** → **API**
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Penting:** Jangan pernah expose `SUPABASE_SERVICE_ROLE_KEY` ke client-side!

---

## 🗄️ Database Setup

### 1. Jalankan Migration Script

Buka **SQL Editor** di Supabase Dashboard dan jalankan file SQL secara berurutan:

```
database/00-MASTER-SETUP.sql       # Schema utama (users, berita, galeri, surat, dll)
database/01-ADD-WILAYAH-TABLES.sql # Tabel wilayah dan penduduk
```

### 2. Setup Storage Buckets

Script SQL akan otomatis membuat storage buckets berikut:
- `images` - Untuk gambar berita dan galeri
- `documents` - Untuk file dokumen surat
- `profiles` - Untuk foto profil

### 3. Buat Admin Pertama

Setelah menjalankan migration, gunakan endpoint registrasi atau buat user admin melalui SQL Editor di Supabase dengan password yang sudah di-hash menggunakan bcrypt.

> 💡 **Tips:** Gunakan online bcrypt generator untuk hash password, atau jalankan script Node.js sederhana untuk generate hash.

---

## 🚀 Menjalankan Project

### Development Mode

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 🌐 Deployment

### Deploy ke Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan Environment Variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Deploy ke Platform Lain

Project ini kompatibel dengan platform hosting Node.js lainnya:
- **Netlify**
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **AWS Amplify**

Pastikan untuk mengatur environment variables di platform hosting Anda.

---

## 📁 Struktur Folder

```
├── app/
│   ├── (public)/           # Halaman publik
│   │   ├── berita/         # Halaman berita
│   │   ├── galeri/         # Halaman galeri
│   │   ├── jelajahi/       # Data wilayah, penduduk, organisasi
│   │   ├── kontak/         # Halaman kontak
│   │   ├── potensi/        # Potensi desa
│   │   ├── profil/         # Profil desa
│   │   └── surat/          # Layanan surat
│   ├── admin/              # Panel admin (protected)
│   │   ├── dashboard/      # Dashboard admin
│   │   ├── konten/         # Manajemen konten
│   │   ├── layanan/        # Manajemen layanan
│   │   ├── pengaturan/     # Pengaturan sistem
│   │   └── pesan/          # Pesan masuk
│   └── api/                # API Routes
│       ├── auth/           # Authentication
│       ├── berita/         # CRUD berita
│       ├── galeri/         # CRUD galeri
│       ├── messages/       # Pesan kontak
│       ├── notifications/  # Notifikasi
│       └── ...
├── components/             # React components
│   ├── admin/              # Admin components
│   └── ...                 # Shared components
├── lib/                    # Utilities & helpers
│   ├── supabase.ts         # Supabase client
│   ├── auth.ts             # Auth utilities
│   └── ...
├── database/               # SQL migration files
└── public/                 # Static assets
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login admin |
| POST | `/api/auth/logout` | Logout admin |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request reset password |
| POST | `/api/auth/reset-password` | Reset password |

### Content Management
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET/POST | `/api/berita` | List/Create berita |
| GET/PATCH/DELETE | `/api/berita/[id]` | Detail/Update/Delete berita |
| GET/POST | `/api/galeri` | List/Create galeri |
| GET/POST | `/api/surat` | List/Create template surat |

### Public Data
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/profil` | Data profil desa |
| GET | `/api/wilayah` | Data wilayah desa |
| GET | `/api/penduduk` | Statistik penduduk |
| GET | `/api/organisasi` | Data organisasi |
| GET | `/api/potensi` | Potensi desa |

### Utilities
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/upload` | Upload file |
| GET/POST | `/api/messages` | Pesan kontak |
| GET | `/api/notifications` | Notifikasi admin |
| GET/PUT | `/api/settings` | Pengaturan website |

---

## 🔒 Keamanan

- ✅ Password di-hash menggunakan bcrypt
- ✅ Cookie HttpOnly untuk session
- ✅ Protected routes dengan middleware
- ✅ Role-based access control (Super Admin, Admin)
- ✅ API authentication dengan token
- ✅ Input validation dan sanitization

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat Pull Request atau buka Issue untuk diskusi.

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

---

## 📞 Kontak

**Pemerintah Desa Toundanouw**  
Kecamatan Touluaan, Kabupaten Minahasa Tenggara  
Provinsi Sulawesi Utara, Indonesia

---

<div align="center">

**Dibuat dengan ❤️ untuk Desa Toundanouw**

© 2024 Website Desa Toundanouw. All rights reserved.

</div>
