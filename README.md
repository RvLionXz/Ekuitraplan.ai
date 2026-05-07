# Ekuitraplan.ai

AI Travel Planner Berkelanjutan — Platform perencanaan perjalanan dengan kecerdasan buatan yang mengutamakan keberlanjutan lingkungan.

![Ekuitraplan.ai](image.png)

## Tentang Proyek

Ekuitraplan.ai adalah platform AI travel planner yang membantu pengguna merencanakan perjalanan berkelanjutan. Dengan integrasi Google Gemini AI, platform ini memberikan:

- **Generasi Itinerary Otomatis** — AI membuat rencana perjalanan lengkap berdasarkan preferensi pengguna
- **Perhitungan Jejak Karbon** — Hitung emisi karbon dari transportasi dan aktivitas
- **Rekomendasi Eco-Friendly** — Suggestions untuk aktivitas dan akomodasi ramah lingkungan
- **Visualisasi Peta Interaktif** — Lihat itinerary dalam peta interaktif

## Fitur Utama

- Chat dengan AI Assistant "Arisca"
- Perencanaan perjalanan harian dengan detail aktivitas
- Perhitungan dan kompensasi emisi karbon
- Rekomendasi hotel dan transportasi berkelanjutan
- Peta interaktif dengan koordinat akurat
- Dashboard untuk mengelola trip tersimpan

## Teknologi

| Kategori | Teknologi |
|----------|----------|
| Framework | Next.js 16.2.4 |
| Bahasa | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| AI | Google Gemini (@google/genai) |
| Maps | MapLibre GL + Google Maps Grounding |
| Auth | NextAuth.js v5 |
| Styling | Tailwind CSS v4 |
| Animasi | Framer Motion |

## Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [📖 Instalasi Lengkap](docs/INSTALLATION.md) | Panduan instalasi dan konfigurasi detail |
| [🚀 Quick Start](docs/QUICK-START.md) | Panduan cepat untuk langsung mencoba |
| [🔌 API Chat](docs/API-CHAT.md) | Dokumentasi API untuk integrasi |
| [📋 PRD](docs/PRD.md) | Product Requirements Document |

## Persyaratan Sistem

- **Node.js:** 18.0.0 atau lebih tinggi
- **PostgreSQL:** 14.0 atau lebih tinggi
- **Browser:** Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

## Instalasi Cepat

```bash
# Clone repository
git clone <repository-url>
cd ekuitraplan.ai

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan kredensial Anda

# Generate Prisma client dan setup database
npx prisma generate
npx prisma db push

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## Konfigurasi Environment

Minimal, file `.env` harus berisi:

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/ekuitraplan"

# Auth (generate dengan: npx auth secret)
AUTH_SECRET="your-secret-key"

# Google AI (dari https://aistudio.google.com/apikey)
GOOGLE_API_KEY="your-google-api-key"

# MapTiler (dari https://cloud.maptiler.com)
NEXT_PUBLIC_MAP_API_KEY="your-maptiler-key"
```

Lihat [dokumentasi instalasi](docs/INSTALLATION.md) untuk panduan lengkap.

## Available Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |
| `npx prisma studio` | Buka GUI database |
| `npx prisma db push` | Sync schema ke database |

## Struktur Proyek

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/chat/          # Chat API endpoint
│   ├── dashboard/         # User dashboard
│   ├── planner/           # AI Travel Planner
│   └── login/             # Login page
├── components/             # React components
│   ├── InteractiveMap.tsx # Peta interaktif
│   └── planner/           # Komponen planner
├── lib/                    # Library bisnis
│   ├── ai/                # AI configuration
│   ├── carbon/            # Perhitungan karbon
│   └── maps/              # Geocoding
└── auth.ts                # NextAuth configuration

prisma/
└── schema.prisma          # Database schema

docs/
├── INSTALLATION.md        # Dokumentasi instalasi
├── QUICK-START.md         # Panduan cepat
├── API-CHAT.md            # Dokumentasi API
└── PRD.md                 # Product requirements
```

## Contributing

Kontribusi sangat diterima! Buat issue atau pull request untuk:

- Bug fixes
- Feature requests
- Documentation improvements
- Code reviews

## License

Project ini bersifat private dan proprietary.

---

Dibuat dengan ❤️ untuk perjalanan berkelanjutan
