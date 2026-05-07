# Dokumentasi Instalasi dan Pengaturan
## Ekuitraplan.ai — AI Travel Planner Berkelanjutan

**Versi Dokumen:** 1.0.0  
**Tanggal:** 07 Mei 2026  
**Status:** Released  

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Persyaratan Sistem](#2-persyaratan-sistem)
3. [Struktur Proyek](#3-struktur-proyek)
4. [Instalasi](#4-instalasi)
5. [Konfigurasi Lingkungan](#5-konfigurasi-lingkungan)
6. [Pengaturan Basis Data](#6-pengaturan-basis-data)
7. [Konfigurasi API Eksternal](#7-konfigurasi-api-eksternal)
8. [Menjalankan Aplikasi](#8-menjalankan-aplikasi)
9. [Pemecahan Masalah](#9-pemecahan-masalah)
10. [Arsitektur Sistem](#10-arsitektur-sistem)
11. [Referensi](#11-referensi)

---

## 1. Pendahuluan

### 1.1 Deskripsi Proyek

Ekuitraplan.ai adalah platform perencanaan perjalanan berbasis AI yang dirancang untuk menciptakan itinerary perjalanan berkelanjutan (sustainable travel). Platform ini mengintegrasikan:

- **Google Gemini AI** untuk generasi itinerary otomatis
- **Google Maps Grounding** untuk data lokasi akurat
- **Perhitungan Jejak Karbon** untuk rekomendasi perjalanan ramah lingkungan
- **MapLibre** untuk visualisasi peta interaktif
- **NextAuth.js** untuk autentikasi pengguna

### 1.2 Cakupan Dokumen

Dokumen ini mencakup seluruh proses instalasi dan konfigurasi, termasuk:

- Persyaratan sistem dan dependensi
- Struktur direktori proyek
- Proses instalasi langkah demi langkah
- Konfigurasi variabel lingkungan
- Pengaturan basis data PostgreSQL
- Konfigurasi API eksternal (Google AI, MapTiler)
- Prosedur pengoperasian
- Pemecahan masalah umum

### 1.3 Audience

Dokumen ini ditujukan untuk:

- Developer yang akan mengembangkan atau merawat aplikasi
- DevOps engineer yang akan men-deploy aplikasi
- System administrator yang akan mengelola infrastruktur

---

## 2. Persyaratan Sistem

### 2.1 Persyaratan Hardware

| Komponen | Minimum | Direkomendasikan |
|----------|---------|------------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 10 GB | 20 GB |
| Koneksi Internet | Stabil | Broadband |

### 2.2 Persyaratan Software

#### 2.2.1 Runtime Environment

| Software | Versi Minimum | Versi Direkomendasikan |
|----------|---------------|------------------------|
| Node.js | 18.0.0 | 20.x LTS atau 22.x |
| npm | 9.0.0 | 10.x |
| PostgreSQL | 14.0 | 16.x |
| Git | 2.30 | Terbaru |

#### 2.2.2 Dukungan Browser

| Browser | Versi Minimum |
|---------|---------------|
| Google Chrome | 90+ |
| Mozilla Firefox | 88+ |
| Microsoft Edge | 90+ |
| Safari | 14+ |

### 2.3 Akun dan Kredensial yang Diperlukan

| Layanan | Kebutuhan | Tujuan |
|---------|-----------|--------|
| Google Cloud Console | WAJIB | Google AI API (Gemini) |
| MapTiler Cloud | WAJIB | Peta interaktif |
| PostgreSQL Database | WAJIB | Penyimpanan data |
| Google OAuth | OPSIONAL | Login dengan Google |

---

## 3. Struktur Proyek

### 3.1 Hierarki Direktori

```
ekuitraplan.ai/
├── src/                          # Kode sumber aplikasi
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/[...nextauth]/ # Autentikasi NextAuth
│   │   │   └── chat/             # Endpoint AI Chat
│   │   ├── dashboard/            # Halaman dashboard pengguna
│   │   ├── login/                # Halaman login
│   │   ├── planner/              # Halaman planner perjalanan
│   │   ├── layout.tsx            # Layout utama
│   │   ├── page.tsx             # Halaman landing
│   │   └── globals.css          # Styles global
│   ├── components/               # Komponen React
│   │   ├── InteractiveMap.tsx   # Komponen peta
│   │   ├── layout/              # Komponen layout
│   │   ├── planner/             # Komponen halaman planner
│   │   └── ui/                  # Komponen UI generik
│   ├── lib/                      # Library dan logika bisnis
│   │   ├── ai/                  # Konfigurasi AI
│   │   ├── carbon/              # Perhitungan karbon
│   │   ├── data/                # Data perjalanan
│   │   ├── maps/                # Geocoding dan peta
│   │   ├── session/             # Manajemen sesi
│   │   └── utils/               # Utilitas
│   ├── types/                   # Definisi tipe TypeScript
│   ├── auth.ts                  # Konfigurasi NextAuth
│   └── auth.config.ts           # Konfigurasi autentikasi
├── prisma/                       # Skema basis data
│   └── schema.prisma            # Definisi model Prisma
├── public/                       # Aset statis
│   └── images/                  # Gambar dan ikon
├── docs/                         # Dokumentasi
├── package.json                  # Dependensi proyek
├── next.config.ts                # Konfigurasi Next.js
├── tsconfig.json                 # Konfigurasi TypeScript
├── .env.example                  # Template variabel lingkungan
└── .env                          # Variabel lingkungan (lokal)
```

### 3.2 Dependensi Utama

#### 3.2.1 Framework Inti

| Paket | Versi | Fungsi |
|-------|-------|--------|
| next | 16.2.4 | Framework React |
| react | 19.2.4 | Library UI |
| typescript | ^5 | Type safety |

#### 3.2.2 Basis Data dan Auth

| Paket | Versi | Fungsi |
|-------|-------|--------|
| @prisma/client | ^7.8.0 | ORM untuk PostgreSQL |
| prisma | ^7.8.0 | Schema dan migrations |
| next-auth | ^5.0.0-beta | Autentikasi |
| @auth/prisma-adapter | ^2.11.2 | Adapter Prisma untuk Auth.js |

#### 3.2.3 AI dan Maps

| Paket | Versi | Fungsi |
|-------|-------|--------|
| @google/genai | ^1.51.0 | Google Gemini AI SDK |
| maplibre-gl | ^5.24.0 | Peta open-source |
| react-map-gl | ^8.1.1 | Komponen React untuk MapLibre |

#### 3.2.4 UI dan Styling

| Paket | Versi | Fungsi |
|-------|-------|--------|
| tailwindcss | ^4 | CSS framework |
| framer-motion | ^12.38.0 | Animasi |
| lucide-react | ^1.14.0 | Ikon |

---

## 4. Instalasi

### 4.1 Clone Repository

```bash
# Clone repository
git clone <repository-url> ekuitraplan.ai

# Masuk ke direktori proyek
cd ekuitraplan.ai
```

### 4.2 Install Dependencies

```bash
# Install semua dependensi
npm install
```

**Catatan:** Pastikan koneksi internet stabil. Proses ini akan mengunduh dan menginstall semua paket yang terdaftar di `package.json`.

### 4.3 Verifikasi Instalasi

```bash
# Cek versi Node.js
node --version

# Cek versi npm
npm --version

# Verifikasi Next.js
npx next --version
```

---

## 5. Konfigurasi Lingkungan

### 5.1 Membuat File .env

Salin file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

### 5.2 Penjelasan Variabel Lingkungan

#### 5.2.1 Variabel WAJIB

| Variabel | Deskripsi | Contoh |
|-----------|-----------|--------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:port/db` |
| `AUTH_SECRET` | Secret untuk JWT signing | Generate dengan `npx auth secret` |
| `GOOGLE_API_KEY` | API Key Google AI Studio | Dari Google Cloud Console |
| `NEXT_PUBLIC_MAP_API_KEY` | API Key MapTiler | Dari maptiler.com |
| `EMISSIONS_API_KEY` | API Key emissions.dev | Dari emissions.dev (lihat 7.4) |

#### 5.2.2 Variabel OPSIONAL

| Variabel | Deskripsi | Default |
|----------|-----------|---------|
| `AI_MODEL` | Model AI yang digunakan | `gemini-3.1-flash-lite-preview` |
| `NODE_ENV` | Environment | `development` |
| `AUTH_URL` | URL produksi | Auto-detected |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | Kosong |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | Kosong |

### 5.3 Template .env Lengkap

```bash
# ═══════════════════════════════════════════════════════════════════
# KONEKSI BASIS DATA
# ═══════════════════════════════════════════════════════════════════
DATABASE_URL="postgresql://user:password@localhost:5432/ekuitraplan"

# ═══════════════════════════════════════════════════════════════════
# ENVIRONMENT
# ═══════════════════════════════════════════════════════════════════
NODE_ENV="development"

# ═══════════════════════════════════════════════════════════════════
# AUTH.JS (NEXTAUTH v5)
# ═══════════════════════════════════════════════════════════════════
# Generate dengan: npx auth secret
AUTH_SECRET="generated-secret-key-here"

# ═══════════════════════════════════════════════════════════════════
# GOOGLE OAUTH — https://console.cloud.google.com/apis/credentials
# Diperlukan jika ingin fitur login dengan Google
# ═══════════════════════════════════════════════════════════════════
# AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
# AUTH_GOOGLE_SECRET=your-google-client-secret

# ═══════════════════════════════════════════════════════════════════
# GOOGLE AI STUDIO — https://aistudio.google.com/apikey
# WAJIB DIISI untuk fungsi AI itinerary
# ═══════════════════════════════════════════════════════════════════
GOOGLE_API_KEY=your-google-api-key

# ═══════════════════════════════════════════════════════════════════
# MODEL AI (OPSIONAL)
# Pilihan: gemini-2.5-flash, gemini-3.1-flash-lite-preview
# ═══════════════════════════════════════════════════════════════════
AI_MODEL=gemini-2.5-flash-lite

# ═══════════════════════════════════════════════════════════════════
# MAPTILER CLOUD API — https://cloud.maptiler.com
# WAJIB DIISI untuk tampilan peta
# ═══════════════════════════════════════════════════════════════════
NEXT_PUBLIC_MAP_API_KEY=your-maptiler-api-key

# ═══════════════════════════════════════════════════════════════════
# EMISSIONS.DEV API — https://api.emissions.dev/
# WAJIB DIISI untuk perhitungan emisi karbon
# Rate limit free: 500 req/bulan
# ═══════════════════════════════════════════════════════════════════
EMISSIONS_API_KEY=your-emissions-api-key
```

### 5.4 Menghasilkan AUTH_SECRET

```bash
# Install auth jika belum
npm install next-auth@beta

# Generate secret
npx auth secret

# Output akan menampilkan AUTH_SECRET yang bisa di-copy ke .env
```

---

## 6. Pengaturan Basis Data

### 6.1 Prasyarat PostgreSQL

#### 6.1.1 Instalasi PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (dengan Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows:**
Unduh dan install dari https://www.postgresql.org/download/windows/

#### 6.1.2 Membuat Database

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Buat user (jika belum ada)
CREATE USER ekuitraplan WITH PASSWORD 'your_password';

# Buat database
CREATE DATABASE ekuitraplan OWNER ekuitraplan;

# Berikan hak akses
GRANT ALL PRIVILEGES ON DATABASE ekuitraplan TO ekuitraplan;

# Keluar dari psql
\q
```

### 6.2 Konfigurasi Prisma

#### 6.2.1 Generate Prisma Client

```bash
# Generate client dari schema
npx prisma generate
```

#### 6.2.2 Buat Tabel di Database

```bash
# Push schema ke database (create/update tables)
npx prisma db push
```

**Catatan:** Perintah ini akan membuat semua tabel sesuai dengan schema Prisma tanpa memerlukan file migrasi.

#### 6.2.3 Verifikasi Koneksi

```bash
# Buka Prisma Studio (GUI untuk melihat data)
npx prisma studio
```

Buka browser di `http://localhost:5555` untuk melihat struktur data.

### 6.3 Skema Database

#### 6.3.1 Model Autentikasi (NextAuth)

```
User
├── id (String, PK)
├── name (String?)
├── email (String?, Unique)
├── emailVerified (DateTime?)
├── image (String?)
├── preferredBudget (String?)
├── travelStyle (String?)
├── dietPreference (String?)
└── Relations:
    ├── accounts (Account[])
    ├── sessions (Session[])
    ├── trips (Trip[])
    └── chatSessions (ChatSession[])

Account
├── id (String, PK)
├── userId (String, FK → User)
├── type (String)
├── provider (String)
├── providerAccountId (String)
├── refresh_token (String?)
├── access_token (String?)
├── expires_at (Int?)
├── token_type (String?)
├── scope (String?)
├── id_token (String?)
└── session_state (String?)

Session
├── id (String, PK)
├── sessionToken (String, Unique)
├── userId (String, FK → User)
└── expires (DateTime)

VerificationToken
├── identifier (String)
├── token (String, PK)
└── expires (DateTime)
```

#### 6.3.2 Model Domain Inti

```
Trip
├── id (String, PK)
├── userId (String, FK → User)
├── title (String)
├── destination (String)
├── startDate (DateTime?)
├── endDate (DateTime?)
├── travelers (Int, default: 1)
├── budget (String?)
├── status (String, default: "draft")
├── totalCarbonKg (Float?)
├── carbonOffsetKg (Float?)
└── Relations:
    ├── itineraries (Itinerary[])
    ├── chatSession (ChatSession?)
    └── carbonOffsets (CarbonOffset[])

Itinerary
├── id (String, PK)
├── tripId (String, FK → Trip)
├── dayNumber (Int)
├── date (DateTime?)
└── Relations:
    └── activities (ItineraryActivity[])

ItineraryActivity
├── id (String, PK)
├── itineraryId (String, FK → Itinerary)
├── sortOrder (Int)
├── title (String)
├── description (String?)
├── location (String?)
├── latitude (Float?)
├── longitude (Float?)
├── startTime (String?)
├── endTime (String?)
├── category (String?)
├── isEcoFriendly (Boolean)
└── carbonKg (Float?)
```

#### 6.3.3 Model Chat dan AI

```
ChatSession
├── id (String, PK)
├── userId (String, FK → User)
├── tripId (String?, FK → Trip, Unique)
└── Relations:
    └── messages (ChatMessage[])

ChatMessage
├── id (String, PK)
├── chatSessionId (String, FK → ChatSession)
├── role (String)  // "user" | "assistant" | "system"
└── content (String)
```

---

## 7. Konfigurasi API Eksternal

### 7.1 Google AI Studio (Gemini API)

#### 7.1.1 Mendapatkan API Key

1. Buka [Google AI Studio](https://aistudio.google.com/apikey)
2. Login dengan akun Google
3. Klik "Create API Key"
4. Salin API key yang generated

#### 7.1.2 Konfigurasi

Tambahkan ke file `.env`:

```bash
GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 7.1.3 Model yang Tersedia

| Model ID | Deskripsi | Fitur |
|----------|-----------|-------|
| `gemini-2.5-flash` | Fast dengan Maps Grounding | Function calling + Maps |
| `gemini-3.1-flash-lite-preview` | Paling cepat & murah | Basic function calling |

**Catatan:** Untuk menggunakan Google Maps Grounding (data lokasi real-time), gunakan `gemini-2.5-flash`.

### 7.2 MapTiler Cloud API

#### 7.2.1 Mendapatkan API Key

1. Buka [MapTiler Cloud](https://cloud.maptiler.com)
2. Daftar/login akun
3. Buka Dashboard → API Keys
4. Salin default API key atau buat key baru

#### 7.2.2 Konfigurasi

Tambahkan ke file `.env`:

```bash
NEXT_PUBLIC_MAP_API_KEY=your-maptiler-api-key
```

#### 7.2.3 Plan yang Tersedia

| Plan | Tile Requests/Bulan | Harga |
|------|---------------------|-------|
| Free | 100,000 | Gratis |
| Starter | 500,000 | $5/bulan |
| Basic | 2,000,000 | $15/bulan |

### 7.3 Google OAuth (OPSIONAL)

Diperlukan jika ingin mengaktifkan login dengan Google.

#### 7.3.1 Membuat OAuth Client

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing
3. Navigate ke "APIs & Services" → "Credentials"
4. Klik "Create Credentials" → "OAuth client ID"
5. Pilih application type: "Web application"
6. Tambahkan authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Salin Client ID dan Client Secret

#### 7.3.2 Konfigurasi

Tambahkan ke file `.env`:

```bash
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-client-secret
```

### 7.4 Emissions.dev API (WAJIB)

**WAJIB dikonfigurasi!** API ini digunakan untuk perhitungan emisi karbon perjalanan udara yang akurat berdasarkan data rute penerbangan sebenarnya.

Tanpa API ini, perhitungan emisi akan menggunakan estimasi fallback yang kurang akurat.

#### 7.4.1 Apa itu Emissions.dev?

Emissions.dev adalah layanan API yang menghitung emisi karbon untuk perjalanan udara berdasarkan:
- Rute penerbangan sebenarnya
- Jarak total
- Tipe kabin (economy, business, first)
- Jumlah penumpang

#### 7.4.2 Mendapatkan API Key

1. Buka [emissions.dev](https://api.emissions.dev/)
2. Daftar/login akun
3. Pilih plan yang diinginkan
4. Salin API key dari dashboard

#### 7.4.3 Plan yang Tersedia

| Plan | Request/Bulan | Estimasi Biaya |
|------|---------------|----------------|
| Free | 500 | Gratis |
| Starter | 5,000 | ~$10/bulan |
| Pro | 50,000 | ~$50/bulan |
| Enterprise | Custom | Hubungi sales |

#### 7.4.4 Konfigurasi

Tambahkan ke file `.env`:

```bash
EMISSIONS_API_KEY=em_live_xxxxxxxxxxxxxxxxxxxxxx
```

#### 7.4.5 Cara Kerja Fallback

Jika `EMISSIONS_API_KEY` tidak dikonfigurasi atau API error, sistem akan menggunakan **estimasi fallback internal**:

| Transport | Estimasi Emisi |
|-----------|----------------|
| Flight (domestik) | ~170 kg CO₂/orang (round trip) |
| Bus/Ferry | ~0.8x dari flight |
| Mobil | Per 5km jarak |

#### 7.4.6 Contoh Response API

```json
{
  "data": {
    "attributes": {
      "emissions": {
        "flight": {
          "carbon_kg": 85,
          "distance_km": 420
        }
      },
      "route": {
        "origin": { "resolved": "Jakarta, Indonesia" },
        "destination": { "resolved": "Sabang, Indonesia" },
        "total_distance_km": 840
      }
    }
  }
}
```

#### 7.4.7 Troubleshooting

**Error 429 - Rate Limit Exceeded:**
```
Monthly usage limit exceeded (500/500 requests, 100% buffer used)
```
**Solusi:** Tunggu reset bulanan (tanggal 1) atau upgrade plan.

**Error 400 - Invalid Location:**
```
Location could not be resolved
```
**Solusi:** Gunakan nama kota yang jelas (contoh: "Jakarta", bukan "JKT").

**Fallback aktif:**
Log akan menampilkan:
```
[carbon] AI missing carbon_data - using default estimation
```

---

## 8. Menjalankan Aplikasi

### 8.1 Mode Development

```bash
# Jalankan development server
npm run dev
```

Akses aplikasi di `http://localhost:3000`

### 8.2 Build untuk Production

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm start
```

### 8.3 Linting dan Type Checking

```bash
# Jalankan ESLint
npm run lint

# TypeScript type checking
npx tsc --noEmit
```

### 8.4 Struktur Endpoint

| Endpoint | Metode | Deskripsi |
|----------|--------|-----------|
| `/` | GET | Halaman landing |
| `/planner` | GET | Halaman AI travel planner |
| `/planner?q=...` | GET | Planner dengan query awal |
| `/dashboard` | GET | Dashboard pengguna (requires auth) |
| `/login` | GET | Halaman login |
| `/api/chat` | POST | API endpoint untuk chat AI |
| `/api/auth/*` | GET/POST | NextAuth handlers |

### 8.5 Variabel Environment untuk Production

```bash
# Set NODE_ENV
export NODE_ENV=production

# Set URL produksi
export AUTH_URL=https://ekuitraplan.ai

# Jalankan
npm start
```

---

## 9. Pemecahan Masalah

### 9.1 Error Umum dan Solusi

#### 9.1.1 Database Connection Error

**Error:**
```
Error: P1001: Can't reach database server
```

**Solusi:**
1. Pastikan PostgreSQL running: `sudo systemctl status postgresql`
2. Verifikasi DATABASE_URL di `.env`
3. Cek firewall mengizinkan koneksi ke port PostgreSQL

#### 9.1.2 Google AI API Error

**Error:**
```
Error: API key not valid
```

**Solusi:**
1. Cek GOOGLE_API_KEY di `.env`
2. Pastikan API key aktif di [Google AI Studio](https://aistudio.google.com/apikey)
3. Verifikasi billing sudah aktif di Google Cloud

#### 9.1.3 Prisma Client Not Generated

**Error:**
```
Error: Prisma Client could not be generated
```

**Solusi:**
```bash
npx prisma generate
npx prisma db push
```

#### 9.1.4 Port Already in Use

**Error:**
```
Error: Port 3000 is already in use
```

**Solusi:**
```bash
# Cari proses yang menggunakan port 3000
lsof -i :3000

# Kill proses atau gunakan port berbeda
PORT=3001 npm run dev
```

### 9.2 Log dan Debugging

#### 9.2.1 Melihat Log Server

```bash
# Development - log otomatis muncul di terminal

# Production - redirect output
npm start > server.log 2>&1
```

#### 9.2.2 Debugging Prisma

Tambahkan `?schema=public&debug` ke DATABASE_URL:

```bash
DATABASE_URL="postgresql://.../?schema=public&debug=true"
```

#### 9.2.3 Debugging AI API

Log API calls dapat dilihat di terminal saat development:

```
Using model: gemini-2.5-flash
[maps] Step 1 grounding found: { chunks: 20, supports: 10 }
[step2] Parts types: [["functionCall","thoughtSignature"]]
```

### 9.3 Reset Database

```bash
# Hapus dan buat ulang semua tabel
npx prisma db push --force-reset

# Re-generate Prisma client
npx prisma generate
```

---

## 10. Arsitektur Sistem

### 10.1 Diagram Aliran Data

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Next.js    │────▶│  PostgreSQL │
│  (Browser)  │◀────│  Server     │◀────│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Google    │
                    │  Gemini AI  │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Maps &    │
                    │ Geocoding   │
                    └─────────────┘
```

### 10.2 Aliran Request Chat API

```
1. User Input
   ↓
2. Frontend (planner/page.tsx)
   - Validasi input
   - AbortController untuk request cancellation
   ↓
3. API Route (/api/chat/route.ts)
   - Parse messages
   - Extract location context
   ↓
4. Step 1: Maps Grounding
   - Gemini dengan Google Maps tool
   - Dapatkan data tempat grounding
   ↓
5. Step 2: Function Calling
   - Generate itinerary dengan system prompt
   - Server-side validation (cek required fields)
   ↓
6. Coordinate Injection
   - Level 1: Maps Grounding coordinates
   - Level 2: DESTINATION_COORDINATES fallback
   - Level 3: Nominatim geocoding
   ↓
7. Carbon Calculation
   - emissions.dev API (jika dikonfigurasi)
   - Fallback: estimation lokal
   ↓
8. Response
   - Return itinerary + carbon data + eco activities
```

### 10.3 Validasi Field Wajib

AI akan bertanya sebelum generate itinerary jika field berikut belum lengkap:

| Field | Deskripsi | Contoh |
|-------|-----------|--------|
| `region` | Tujuan perjalanan | "Sabang", "Bali" |
| `from_location` | Lokasi asal | "Jakarta", "Bandung" |
| `duration_days` | Durasi perjalanan | 7 |
| `budget` | Budget perjalanan | "5 juta" |
| `jumlah_orang` | Jumlah travelers | "2 orang" |

### 10.4 Tech Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.2.4 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 7.8.0 |
| Auth | NextAuth.js v5 | 5.0.0-beta |
| AI | Google Gemini | @google/genai 1.51.0 |
| Maps | MapLibre GL | 5.24.0 |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.x |

---

## 11. Referensi

### 11.1 Dokumentasi Resmi

| Resource | URL |
|----------|-----|
| Next.js Docs | https://nextjs.org/docs |
| Prisma Docs | https://pris.ly/d/documentation |
| NextAuth.js Docs | https://authjs.dev/ |
| Google AI SDK | https://ai.google.dev/docs |
| MapLibre GL JS | https://maplibre.org/ |
| Tailwind CSS | https://tailwindcss.com/docs |
| Framer Motion | https://www.framer.com/motion/ |

### 11.2 API Documentation

| Service | Docs URL |
|---------|----------|
| Google AI Studio | https://aistudio.google.com/apikey |
| MapTiler Cloud | https://cloud.maptiler.com |
| Emissions.dev | https://api.emissions.dev/ |
| Nominatim (OSM) | https://nominatim.org/release-docs/latest/ |

### 11.3 Changelog

| Versi | Tanggal | Deskripsi |
|--------|---------|-----------|
| 1.0.0 | 07 Mei 2026 | Rilis pertama |

---

## Lampiran

### A. Struktur File Konfigurasi

```
.project-root/
├── .env                    # Variabel environment (DI GITIGNORE)
├── .env.example           # Template variabel (TIDAK DI GITIGNORE)
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── prisma/
    ├── schema.prisma
    └── .env               # Di-gitignore
```

### B. Checklist Instalasi

- [ ] Node.js 18+ terinstall
- [ ] PostgreSQL 14+ terinstall dan running
- [ ] Repository di-clone
- [ ] Dependencies terinstall (`npm install`)
- [ ] File `.env` sudah dibuat dari `.env.example`
- [ ] `DATABASE_URL` dikonfigurasi
- [ ] `GOOGLE_API_KEY` dikonfigurasi
- [ ] `NEXT_PUBLIC_MAP_API_KEY` dikonfigurasi
- [ ] `AUTH_SECRET` sudah di-generate
- [ ] `npx prisma generate` berhasil
- [ ] `npx prisma db push` berhasil
- [ ] `npm run dev` berhasil

---

*Dokumen ini dibuat mengikuti standar dokumentasi teknis ISO/IEC/IEEE.*
