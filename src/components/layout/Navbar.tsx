"use client";

import Link from "next/link";
import { Menu, X, Globe, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-lg border-b border-black/5 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? "text-gradient" : "text-white drop-shadow-md"}`}>
            Ekuitraplan.ai
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <div className={`flex items-center gap-8 text-sm font-medium transition-colors ${scrolled ? "text-text-primary" : "text-white"}`}>
            <Link href="/explore" className="hover:text-secondary transition-colors underline-offset-8 hover:underline">Explore</Link>
            <Link href="/sustainability" className="hover:text-secondary transition-colors underline-offset-8 hover:underline">Sustainability</Link>
            <Link href="/eco-certifications" className="hover:text-secondary transition-colors underline-offset-8 hover:underline">Eco-Certifications</Link>
            <Link href="/itineraries" className="hover:text-secondary transition-colors underline-offset-8 hover:underline">Itineraries</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/signin" className={`text-sm font-medium transition-colors hover:text-secondary ${scrolled ? "text-text-primary" : "text-white"}`}>
              Sign In
            </Link>
            <button className="button-gradient text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg">
              Plan Your Trip
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`md:hidden p-2 transition-colors ${scrolled ? "text-text-primary" : "text-white"}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass border-b border-black/5 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          <Link href="/explore" className="text-lg font-medium text-text-primary">Explore</Link>
          <Link href="/sustainability" className="text-lg font-medium text-text-primary">Sustainability</Link>
          <Link href="/eco-certifications" className="text-lg font-medium text-text-primary">Eco-Certifications</Link>
          <Link href="/itineraries" className="text-lg font-medium text-text-primary">Itineraries</Link>
          <hr />
          <Link href="/signin" className="text-lg font-medium text-text-primary">Sign In</Link>
          <button className="button-gradient text-white py-4 rounded-xl font-bold">
            Plan Your Trip
          </button>
        </div>
      )}
    </nav>
  );
}
