# Panduan Memulai Cepat
## Ekuitraplan.ai — Quick Start Guide

**Untuk:** Developer yang ingin langsung mencoba  
**Estimasi Waktu:** 15-30 menit  
**Tingkat Kesulitan:** Mudah - Menengah  

---

## Langkah 1: Clone dan Install (5 menit)

```bash
# Clone repository
git clone <repository-url> ekuitraplan.ai
cd ekuitraplan.ai

# Install dependencies
npm install
```

## Langkah 2: Konfigurasi Minimum (.env) (5 menit)

Minimal, Anda membutuhkan:

```bash
# 1. Buat file .env
cp .env.example .env

# 2. Edit .env dan isi ini:
DATABASE_URL="postgresql://postgres:password@localhost:5432/ekuitraplan"
AUTH_SECRET="isi-dengan-secret-acak-32-karakter"
GOOGLE_API_KEY="isi-dari-google-aistudio"
NEXT_PUBLIC_MAP_API_KEY="isi-dari-maptiler"
```

### Cara mendapatkan GOOGLE_API_KEY:
1. Buka https://aistudio.google.com/apikey
2. Klik "Create API Key"
3. Copy dan paste ke .env

### Cara mendapatkan NEXT_PUBLIC_MAP_API_KEY:
1. Buka https://cloud.maptiler.com
2. Daftar/login
3. Buka Dashboard → API Keys
4. Copy default key ke .env

## Langkah 3: Setup Database (5 menit)

```bash
# Pastikan PostgreSQL running
# Buat database (jika belum):
# psql -U postgres -c "CREATE DATABASE ekuitraplan;"

# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push
```

## Langkah 4: Jalankan! (1 menit)

```bash
npm run dev
```

Buka browser: http://localhost:3000

---

## Navigasi Cepat

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Landing | `/` | Homepage dengan hero |
| Planner | `/planner` | AI travel planner |
| Planner + Query | `/planner?q=Bali` | Langsung dengan query |

---

## Troubleshooting Cepat

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Database connection failed"
1. Pastikan PostgreSQL running
2. Cek DATABASE_URL di .env

### Error: "Google API key invalid"
1. Cek GOOGLE_API_KEY di .env
2. Pastikan tidak ada spasi atau karakter tambahan

### Error: "Port 3000 in use"
```bash
PORT=3001 npm run dev
```

---

## Fitur yang Perlu Konfigurasi Tambahan

### Login dengan Google (OPSIONAL)

1. Buat OAuth Client di [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Tambah ke .env:
   ```
   AUTH_GOOGLE_ID=client-id.apps.googleusercontent.com
   AUTH_GOOGLE_SECRET=client-secret
   ```
3. Restart server

### Perhitungan Karbon (WAJIB)

**EMISSIONS_API_KEY wajib dikonfigurasi!**

Tanpa API ini, aplikasi tidak bisa menghitung emisi karbon dengan akurat.

**Setup:**
1. Buka https://api.emissions.dev/
2. Daftar/login
3. Copy API key ke .env:
   ```
   EMISSIONS_API_KEY=em_live_xxx
   ```
4. Restart server

**Catatan:** Plan free memiliki limit 500 req/bulan.

---

## Struktur Kode Penting

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── planner/page.tsx   # AI Planner
│   └── api/chat/route.ts  # Chat API
├── lib/
│   ├── ai/                # AI config & prompts
│   ├── carbon/            # Carbon calculation
│   └── maps/             # Geocoding
└── components/            # React components
```

---

## Command Penting

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npx prisma studio  # Database GUI
```

---

Selamat mencoba! 🚀
