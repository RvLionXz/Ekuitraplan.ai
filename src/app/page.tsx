"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Leaf, 
  Mic, 
  Waves, 
  ArrowRight,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const destinations = [
    {
      title: "Resor Berkelanjutan di Ubud",
      description: "Rasakan kedamaian di jantung hutan Bali dengan akomodasi yang 100% bertenaga surya.",
      image: "/images/ubud-resort.png",
      tag: "REKOMENDASI AI",
      eco: "Netral Karbon"
    },
    {
      title: "Taman Laut Komodo",
      description: "Jelajahi keindahan bawah laut dengan kapal wisata ramah lingkungan.",
      image: "/images/komodo-beach.png",
      tag: "RATING TERTINGGI",
      eco: "Netral Karbon"
    },
    {
      title: "Dataran Tinggi Teh Jawa",
      description: "Nikmati udara segar pegunungan di perkebunan teh berkelanjutan.",
      image: "/images/tea-plantation.png",
      tag: "DAMPAK RENDAH",
      eco: "Rendah Emisi"
    }
  ];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Strategic Gradient */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-v2.png"
            alt="Aerial view of tropical coastline"
            fill
            className="object-cover scale-105"
            sizes="100vw"
            priority
          />
          {/* Centralized focused overlay */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FDFBF7]" />
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-12 animate-slide-up">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-tight">
                Halo, <br className="md:hidden" />
                <span className="text-secondary">mau liburan ke mana</span> hari ini?
              </h1>
              <p className="text-base md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Ceritakan impianmu pada Liora, biarkan kurator AI kami merajut perjalanan regeneratif yang personal untuk jiwa penjelajahmu.
              </p>
            </div>
            
            {/* AI Chat Input - Layla Style */}
            <div className="max-w-3xl mx-auto">
              <div className="glass-heavy p-4 rounded-[32px] shadow-2xl border-white/30 text-left">
                <textarea 
                  rows={3}
                  placeholder="Contoh: Rekomendasi liburan 4 hari di Bali dengan budget 5 juta, fokus ke wisata alam..."
                  className="bg-transparent border-none outline-none w-full text-white font-medium placeholder:text-white/40 p-4 resize-none text-lg"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 md:gap-4 px-2">
                    <button className="text-white/60 hover:text-white transition-colors p-2" title="Gunakan Suara">
                      <Mic size={18} className="md:w-5 md:h-5" />
                    </button>
                    <button className="text-white/60 hover:text-white transition-colors p-2" title="Lokasi Terdekat">
                      <Waves size={18} className="md:w-5 md:h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => router.push(`/planner?q=${encodeURIComponent(searchValue)}`)}
                    disabled={!searchValue.trim()}
                    className="button-gradient text-white px-5 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 group disabled:opacity-50"
                  >
                    <Zap size={16} className="md:w-[18px] md:h-[18px] fill-current group-hover:animate-pulse" />
                    Rancang Liburan
                  </button>
                </div>
              </div>

              {/* Quick Action Chips */}
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {[
                  "Buat rencana baru",
                  "Inspirasi destinasi",
                  "Gunakan suara",
                  "Wisata Eco-Green"
                ].map((label, i) => (
                  <button 
                    key={i} 
                    onClick={() => router.push(`/planner?q=${encodeURIComponent(label)}`)}
                    className="bg-white/10 backdrop-blur-md py-2.5 px-6 rounded-full text-xs font-bold text-white/90 hover:bg-white/20 transition-all border border-white/20"
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 text-white/40 text-xs font-medium animate-pulse">
                Lihat bagaimana saya bisa membantumu ↓
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Recommended Destinations */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <span className="text-secondary font-black tracking-widest uppercase text-xs">Pengalaman Premium</span>
              <h2 className="text-4xl font-bold text-text-primary mt-2">Destinasi Berkelanjutan Pilihan AI</h2>
            </div>
            <Link href="/destinations" className="flex items-center gap-2 text-text-primary font-bold hover:gap-3 transition-all group">
              Lihat Semua <ArrowRight size={20} className="group-hover:text-secondary" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((item, i) => (
              <div key={i} className="group relative rounded-[32px] overflow-hidden aspect-[4/5] subtle-shadow card-hover">
                <Image 
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                
                <div className="absolute top-6 left-6">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-white/20">
                    • {item.tag}
                  </span>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/70 text-sm mb-6 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-3">
                    <button className="bg-white text-primary px-6 py-2.5 rounded-full text-xs font-bold hover:bg-surface transition-all">
                      Detail Trip
                    </button>
                    <button className="bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-white/30 transition-all border border-white/20">
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Stats */}
      <section className="py-24 bg-surface/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/3">
              <div className="relative aspect-square rounded-[40px] overflow-hidden subtle-shadow group">
                <Image 
                  src="/images/rice-terrace.png"
                  alt="Kecerdasan AI"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/5 transition-all" />
                <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-3xl border-white/30 translate-y-2 group-hover:translate-y-0 transition-all">
                   <h4 className="text-primary font-bold mb-1">Dataran Tinggi Teh Jawa</h4>
                   <p className="text-primary/60 text-xs font-medium">Destinasi Terverifikasi Eco</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-2/3 space-y-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold text-text-primary mb-6">Bagaimana AI Kami Bekerja?</h2>
                <p className="text-text-secondary leading-relaxed">
                  Liora, kurator AI kami, memproses ribuan data destinasi untuk mencocokkan preferensi Anda dengan pilihan yang paling ramah lingkungan melalui diskusi mendalam.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Akurasi Eco", value: "98%", desc: "Pencocokan presisi" },
                  { label: "Penginapan", value: "5k+", desc: "Eco-lodge terkurasi" },
                  { label: "Personal", value: "100%", desc: "Sesuai keinginan" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-4xl font-black text-secondary">{stat.value}</div>
                    <div className="text-sm font-bold text-text-primary uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight">
              Siap untuk petualangan berikutnya?
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Mulai perjalanan cerdas Anda hari ini dan jadilah bagian dari revolusi pariwisata berkelanjutan.
            </p>
            <button className="button-gradient text-white px-12 py-5 rounded-full text-lg font-bold transition-all shadow-2xl hover:-translate-y-1 active:scale-95">
              Rancang Perjalanan Sekarang
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
