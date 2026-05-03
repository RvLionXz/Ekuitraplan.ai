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

export default function Home() {
  const [searchValue, setSearchValue] = useState("");

  const destinations = [
    {
      title: "Sustainable Retreat in Ubud",
      description: "Rasakan kedamaian di jantung hutan Bali dengan akomodasi yang 100% bertenaga surya.",
      image: "/images/ubud-resort.png",
      tag: "AI RECOMMENDED",
      eco: "Carbon Neutral"
    },
    {
      title: "Komodo Marine Park",
      description: "Jelajahi keindahan bawah laut dengan kapal wisata ramah lingkungan.",
      image: "/images/komodo-beach.png",
      tag: "TOP RATED",
      eco: "Carbon Neutral"
    },
    {
      title: "Tea Highlands Java",
      description: "Nikmati udara segar pegunungan di perkebunan teh berkelanjutan.",
      image: "/images/tea-plantation.png",
      tag: "LOW IMPACT",
      eco: "Low Impact"
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
            priority
          />
          {/* Horizontal gradient for left-aligned text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          {/* Top-down gradient for navbar contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent h-32" />
          {/* Bottom fade to content */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent opacity-80" />
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-3xl space-y-10 animate-slide-up">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 backdrop-blur-md border border-secondary/30 text-secondary text-[10px] font-black uppercase tracking-widest">
                AI-Powered Eco Travel
              </span>
              <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tight leading-[1.05] drop-shadow-sm">
                Mau liburan <br />
                <span className="text-secondary">ke mana</span> hari ini?
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
              Ceritakan gaya liburanmu, dan AI kami akan merancang perjalanan ramah lingkungan yang tak terlupakan di seluruh Nusantara.
            </p>

            {/* Redesigned Search Bar Area */}
            <div className="max-w-2xl">
              <div className="glass-heavy p-2 md:p-3 rounded-[32px] flex flex-col md:flex-row items-center gap-2 shadow-2xl border-white/20">
                <div className="flex-1 flex items-center gap-3 px-6 py-2 w-full">
                  <Search className="text-white/60" size={20} />
                  <input 
                    type="text" 
                    placeholder="Contoh: 4 hari di Bali budget 5 juta..."
                    className="bg-transparent border-none outline-none w-full text-white font-medium placeholder:text-white/40 py-2"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
                <button className="button-gradient text-white px-8 py-4 rounded-[24px] font-bold flex items-center gap-2 transition-all w-full md:w-auto shadow-lg active:scale-95 group">
                  <Zap size={18} className="fill-current group-hover:animate-pulse" />
                  Plan My Trip
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  { icon: Waves, label: "Ekowisata Laut" },
                  { icon: Leaf, label: "Rendah Karbon" },
                  { icon: Mic, label: "Voice Input" }
                ].map((item, i) => (
                  <button key={i} className="bg-white/10 backdrop-blur-md py-2 px-5 rounded-full text-xs font-bold text-white/90 flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10">
                    <item.icon size={14} className="text-secondary" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Centered and Animated */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-80 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-secondary to-transparent" />
        </div>
      </section>

      {/* Recommended Destinations */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <span className="text-secondary font-black tracking-widest uppercase text-xs">Premium Experience</span>
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
                  alt="AI Intelligence"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/5 transition-all" />
                <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-3xl border-white/30 translate-y-2 group-hover:translate-y-0 transition-all">
                   <h4 className="text-primary font-bold mb-1">Tea Highlands Java</h4>
                   <p className="text-primary/60 text-xs font-medium">Eco-Certified Destination</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-2/3 space-y-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold text-text-primary mb-6">Bagaimana AI Kami Bekerja?</h2>
                <p className="text-text-secondary leading-relaxed">
                  Algoritma canggih kami memproses ribuan data destinasi untuk mencocokkan preferensi Anda dengan pilihan yang paling ramah lingkungan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Eco Accuracy", value: "98%", desc: "Precise matching" },
                  { label: "Stays Verified", value: "5k+", desc: "Curated eco-lodges" },
                  { label: "Personalized", value: "100%", desc: "Tailored to you" }
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
