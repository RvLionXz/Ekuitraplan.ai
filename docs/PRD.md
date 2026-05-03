# Product Requirements Document (PRD): Ekuitraplan.ai

## 1. Pendahuluan
**Ekuitraplan.ai** adalah platform *AI-powered Travel Planner* yang dirancang untuk mendukung pariwisata berkelanjutan (sustainable & regenerative tourism) di Indonesia. Platform ini tidak hanya membantu pengguna merencanakan perjalanan wisata yang personal dan efisien, tetapi juga mengintegrasikan kesadaran lingkungan melalui perhitungan jejak karbon secara real-time dan rekomendasi aktivitas pelestarian alam (Blue Economy & Green Economy).

## 2. Tujuan Utama (Core Objectives)
1. **Regenerative Tourism:** Mendorong wisatawan untuk tidak hanya berkunjung, tetapi juga memberikan dampak positif bagi lingkungan dan komunitas lokal.
2. **AI-Driven Personalization:** Menyediakan rencana perjalanan (itinerary) yang sangat disesuaikan dengan preferensi pengguna menggunakan teknologi AI generatif.
3. **Carbon Awareness:** Memberikan transparansi mengenai emisi karbon dari setiap aktivitas dan transportasi yang dipilih, serta menawarkan opsi *carbon offsetting*.
4. **B2B2C Ecosystem:** Menghubungkan wisatawan (end-user) dengan penyedia ekowisata, resor ramah lingkungan, dan komunitas konservasi lokal.

## 3. Target Pengguna
- **Wisatawan Domestik & Internasional:** Individu atau kelompok yang peduli terhadap lingkungan dan mencari pengalaman wisata otentik di Indonesia.
- **Penyedia Ekowisata & Komunitas Lokal (B2B):** Pihak yang menyediakan layanan wisata berkelanjutan dan membutuhkan eksposur ke target pasar yang tepat.
- **NGO & Lembaga Konservasi:** Pihak yang mengelola program restorasi alam (seperti penanaman mangrove, pelestarian terumbu karang).

## 4. Pedoman Desain (UI/UX)
Berdasarkan referensi desain yang telah dipilih (Project ID: `5053935246530993337` dan inspirasi dari Layla AI):
- **Gaya Visual:** Modern, *Clean*, dan Premium.
- **Elemen Kunci:** *Glassmorphism* (kartu dan panel dengan efek kaca transparan/blur yang elegan) dipadukan dengan tata letak spasial yang luas.
- **Palet Warna:** 
  - **Primary:** Emerald/Green (`#004c28`, `#006738`) yang merepresentasikan alam, ekologi, dan keberlanjutan.
  - **Background:** Gelap/Elegan atau terang dengan aksen hijau alam, disesuaikan untuk mendukung efek glassmorphism.
- **Tipografi:** **Inter** (font modern, sans-serif yang bersih dan mudah dibaca).
- **Interaksi:** Mikro-animasi yang halus (*smooth transitions*), *hover effects* yang dinamis, memberikan nuansa antarmuka yang hidup.

## 5. Fitur Utama (Core Features)

### 5.1. Autentikasi & Profil Pengguna
- Pendaftaran dan login (Email, Google OAuth).
- Manajemen profil pengguna dan preferensi perjalanan (budget, gaya liburan, preferensi diet).
- Dasbor riwayat perjalanan dan akumulasi kontribusi pengurangan/offset karbon.

### 5.2. AI-Powered Trip Planner (Gemini 2.5 Pro)
- Antarmuka *chat* atau formulir interaktif untuk menanyakan preferensi liburan (destinasi, durasi, jumlah orang).
- Pembuatan itinerary harian secara otomatis dan cerdas yang mencakup tempat wisata, tempat makan, dan aktivitas.
- Rekomendasi yang menitikberatkan pada lokasi *eco-friendly*.

### 5.3. Kalkulator Emisi Karbon Real-time (Carbon Interface API)
- Perhitungan otomatis emisi karbon berdasarkan mode transportasi (penerbangan, darat, laut) dalam itinerary.
- Perhitungan estimasi jejak karbon dari akomodasi.
- Visualisasi metrik emisi dalam UI yang mudah dipahami (misal: grafik batang, indikator warna).

### 5.4. Eco-Activity Matcher & Restorasi Alam (Google Search Grounding)
- Sistem akan merekomendasikan aktivitas pelestarian alam di sekitar destinasi yang dipilih (misal: penanaman mangrove di Bali, adopsi karang di Raja Ampat).
- Penawaran opsi *carbon offset* untuk menyeimbangkan emisi perjalanan pengguna.

### 5.5. Interactive Itinerary & Workspace
- Tampilan kalender dan peta (*map integration*) untuk visualisasi rute perjalanan.
- Fitur *drag-and-drop* untuk menyesuaikan jadwal harian.
- Opsi kolaborasi untuk merencanakan perjalanan bersama teman/keluarga.

## 6. Arsitektur Teknis

### 6.1. Frontend
- **Framework:** Next.js 15 (App Router)
- **Library UI:** React 19
- **Styling:** Tailwind CSS (dengan plugin/kustomisasi untuk *glassmorphism*)
- **State Management:** Zustand atau React Context API

### 6.2. Backend & Database
- **API:** Next.js API Routes (Serverless Functions)
- **Database:** PostgreSQL (di-host di Supabase atau Vercel Postgres)
- **ORM:** Prisma atau Drizzle ORM

### 6.3. Integrasi Pihak Ketiga (Third-Party APIs)
- **Google Gemini 2.5 Pro:** Engine utama untuk *Natural Language Processing* dan *Itinerary Generation*.
- **Google Search Grounding:** Memastikan rekomendasi aktivitas dan lokasi relevan dengan data dunia nyata secara *real-time*.
- **Carbon Interface API:** Penghitungan metrik karbon.
- **Google Maps API / Mapbox:** Visualisasi peta dan rute.

## 7. Fase Pengembangan

- **Fase 1: Setup & UI/UX Foundation**
  - Inisialisasi proyek Next.js.
  - Konfigurasi Tailwind CSS dan token desain (warna Emerald, efek Glassmorphism).
  - Implementasi komponen UI dasar (Tombol, Kartu, Input, Navbar) dari referensi *Stitch*.
- **Fase 2: Autentikasi & Halaman Statis**
  - Pembuatan Landing Page.
  - Implementasi Login/Register.
- **Fase 3: Core AI Planner & Carbon Calculator**
  - Integrasi Gemini 2.5 Pro untuk *chat/planning interface*.
  - Integrasi Carbon Interface API.
  - Pembuatan tampilan *Interactive Itinerary*.
- **Fase 4: Rekomendasi Restorasi & Grounding**
  - Menghubungkan *Eco-Activity Matcher* dengan Google Search Grounding.
  - Finalisasi integrasi peta.
- **Fase 5: Polishing & Deployment**
  - Penambahan animasi (*Framer Motion* jika perlu).
  - Optimasi SEO, performa, dan responsivitas.
  - Deployment ke Vercel.
