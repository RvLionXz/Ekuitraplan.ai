# ekuitraplan.ai

### Balance Your Journey

**Anggota Tim:**

- Reval Maulidan
- Ferdi Andrean
- Maina Laila Arini

---

## A. Latar Belakang & Problem Statement

Sektor pariwisata domestik Indonesia memiliki skala yang masif, menyumbang sekitar 70% dari total pergerakan wisata nasional dengan estimasi lebih dari 300 juta perjalanan per tahun pada tahun 2024. Tingginya mobilitas ini, yang sebagian besar terpusat pada destinasi utama seperti Bali (40%), memunculkan tantangan ekologis yang signifikan akibat minimnya instrumen perencanaan perjalanan yang personal dan berwawasan lingkungan. Wisatawan umumnya mengandalkan platform transaksional untuk pemesanan tiket tanpa menyadari besarnya jejak karbon yang dihasilkan. Berdasarkan data emisi, penerbangan domestik di 158 bandara Indonesia menghasilkan 678.728 ton CO2 pada tahun 2024, di mana rute-rute populer menyumbang hampir 50% dari total emisi tersebut (sebagai contoh, penerbangan rute Jakarta-Bali dapat menghasilkan 150-180 kg CO2 per penumpang).

Tantangan kedua terletak pada ketidakterhubungan antara wisatawan dengan inisiatif pelestarian ekosistem pesisir (Blue Economy). Meskipun kesadaran akan keberlanjutan mulai tumbuh, program konservasi seperti penanaman mangrove dan restorasi terumbu karang yang diinisiasi oleh komunitas nelayan lokal kurang mendapatkan eksposur dan pendanaan yang memadai. Akibatnya, ekosistem laut dan masyarakat pesisir menjadi pihak yang paling rentan menanggung eksternalitas negatif dari pariwisata massal. Apabila permasalahan ini tidak segera dimitigasi, akumulasi emisi karbon akan terus membebani daya dukung lingkungan, sementara komunitas pesisir kehilangan potensi ekonomi dari pariwisata berkelanjutan, sehingga visi Indonesia menuju pariwisata regeneratif akan sulit terealisasi.

---

## B. Pendekatan Sistem yang Dirancang

Untuk mengatasi disparitas antara mobilitas pariwisata dan keberlanjutan ekosistem, diusulkan Ekuitraplan, sebuah sistem Al Travel Planner komprehensif yang mengintegrasikan perencanaan perjalanan, kalkulasi emisi, dan aksi restorasi alam. Sistem ini beroperasi melalui dua pilar fungsional utama:

1. Al Trip Planner yang digerakkan oleh kapabilitas analitik Gemini 2.5 Pro untuk menyusun itinerary harian secara presisi berdasarkan preferensi pengguna (segmen wisata, durasi, anggaran) dengan memprioritaskan rekomendasi ekowisata.
2. Carbon Calculator yang terintegrasi dengan Carbon Interface API guna menghitung jejak karbon sektor transportasi secara real-time. Kalkulasi ini mencakup emisi penerbangan maupun jalur darat, dengan penambahan regeneration buffer (+10%) untuk memastikan bahwa upaya mitigasi memberikan dampak surplus ekologis.

Lebih lanjut, sistem ini mengimplementasikan fitur Eco-Activity Matcher menggunakan teknologi Google Search Grounding. Modul komputasi ini secara dinamis memindai dan merekomendasikan kegiatan konservasi lokal seperti pembersihan pantai atau penanaman karang langsung ke dalam jadwal wisatawan tanpa memerlukan pemeliharaan basis data statis. Dibangun menggunakan arsitektur teknologi modern (Next.js, Tailwind CSS, dan PostgreSQL), Ekuitraplan menawarkan keunggulan komparatif yang signifikan dibandingkan Online Travel Agent (OTA) konvensional yang murni berorientasi pada transaksi. Sistem ini secara proaktif memfasilitasi pengguna untuk mengukur, mereduksi, dan mengompensasi emisi perjalanan mereka secara terintegrasi dalam satu platform terpusat.

---

## C. Justifikasi Keberadaan Sistem & Target Pengguna

Eksistensi Ekuitraplan didasarkan pada urgensi pergeseran paradigma dari pariwisata ekstraktif menuju "Kepengelolaan Planet" (Planetary Stewardship). Sistem ini menggunakan model bisnis B2B2C yang menghubungkan tiga kelompok pemangku kepentingan utama. Pertama, Wisatawan Domestik (B2C) dari berbagai segmen (keluarga, solo, dan korporat) yang membutuhkan instrumen perencanaan perjalanan yang efisien sekaligus sarana mitigasi emisi. Kedua, Mitra Bisnis dan Eco-Resort (B2B) yang mendapatkan visibilitas strategis melalui skema premium listing. Ketiga, Komunitas Pesisir dan Pengelola Konservasi yang memperoleh manfaat langsung berupa peningkatan partisipasi sukarelawan dan penyaluran dana restorasi yang terukur dari upaya carbon offset wisatawan.

Secara strategis, pengembangan platform digital ini berkontribusi langsung pada implementasi solusi berbasis alam (Nature-Based Solutions) dan penguatan Blue Economy. Dengan mendemokratisasi akses terhadap data emisi karbon dan aksi pelestarian, Ekuitraplan berupaya mengubah wisatawan domestik menjadi agen konservasi aktif. Apabila sistem ini berhasil diimplementasikan, proyeksi dalam 3-5 tahun ke depan akan menunjukkan dampak sistemik yang konkret: reduksi bertahap pada rasio emisi karbon pariwisata, peningkatan resiliensi ekonomi komunitas pesisir, dan pembentukan blueprint bagi industri travel tech bahwa inovasi teknologi mutlak diperlukan untuk mengawal pencapaian target emisi net-zero.
