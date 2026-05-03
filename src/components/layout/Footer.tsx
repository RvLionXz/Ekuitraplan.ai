import Link from 'next/link';
import Image from 'next/image';
import { Globe, Share2, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-deep-forest text-text-inverse pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-48 h-12">
                <Image 
                  src="/images/Logo-Putih.png"
                  alt="Ekuitraplan Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-text-inverse/60 text-sm leading-relaxed max-w-xs">
              Merevolusi perjalanan melalui kecerdasan ekologis. Bergabunglah dengan kami dalam menjaga destinasi terindah di dunia untuk generasi mendatang.
            </p>
            <div className="flex gap-4">
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary transition-all border border-white/10 group">
                  <Icon size={18} className="text-text-inverse/60 group-hover:text-text-inverse" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-secondary">Layanan</h4>
            <ul className="flex flex-col gap-4 text-sm font-bold text-text-inverse/60">
              <li><Link href="/" className="hover:text-text-inverse transition-colors">Jelajahi</Link></li>
              <li><Link href="/" className="hover:text-text-inverse transition-colors">Rencana AI</Link></li>
              <li><Link href="/" className="hover:text-text-inverse transition-colors">Komunitas</Link></li>
              <li><Link href="/" className="hover:text-text-inverse transition-colors">Verifikasi Eco</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-secondary">Perusahaan</h4>
            <ul className="flex flex-col gap-4 text-sm font-bold text-text-inverse/60">
              <li><Link href="/" className="hover:text-text-inverse transition-colors">Misi Kami</Link></li>
              <li><Link href="/" className="hover:text-text-inverse transition-colors">Mitra</Link></li>
              <li><Link href="/" className="hover:text-text-inverse transition-colors">Karir</Link></li>
              <li><Link href="/" className="hover:text-text-inverse transition-colors">Media Kit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-secondary">Buletin</h4>
            <p className="text-xs text-text-inverse/40 mb-6 font-bold uppercase tracking-wider">Dapatkan tips perjalanan eco terbaru.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-secondary transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 button-gradient text-white px-4 rounded-xl transition-all">
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-text-inverse/30 uppercase tracking-[0.2em]">
            &copy; 2026 Ekuitraplan AI. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-8 text-[10px] font-bold text-text-inverse/30 uppercase tracking-[0.2em]">
            <Link href="/" className="hover:text-text-inverse transition-colors">Kebijakan Privasi</Link>
            <Link href="/" className="hover:text-text-inverse transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
