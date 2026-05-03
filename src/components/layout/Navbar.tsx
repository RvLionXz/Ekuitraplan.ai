"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Globe, Share2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Explore", href: "/explore" },
    { name: "Sustainability", href: "/sustainability" },
    { name: "Eco-Certifications", href: "/eco-certifications" },
    { name: "Itineraries", href: "/itineraries" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-lg border-b border-black/5 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-40 h-10">
            <Image 
              src={scrolled ? "/images/Logo-Hijau.png" : "/images/Logo-Putih.png"}
              alt="Ekuitraplan Logo"
              fill
              className="object-contain transition-all duration-300"
              priority
            />
          </div>
        </Link>

        {/* Action Area */}
        <div className="flex items-center gap-4">
          <div className={`hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${scrolled ? "text-text-primary" : "text-white/80"}`}>
            <Globe size={14} />
            ID | EN
          </div>
          <Link 
            href="/login" 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              scrolled 
                ? "bg-primary text-white shadow-lg" 
                : "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30"
            }`}
          >
            <User size={16} />
            Masuk
          </Link>
        </div>
      </div>
    </nav>
  );
}
