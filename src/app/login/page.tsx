import { signIn } from "@/auth";
import { TreePine, ArrowLeft, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Masuk | Ekuitraplan.ai",
  description: "Masuk ke Ekuitraplan.ai untuk merencanakan perjalanan berkelanjutan Anda.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-surface">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/login-bg.png"
          alt="Indonesia Rice Terrace"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-primary/40 to-transparent" />
      </div>

      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md mx-4 py-12">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Kembali ke Beranda</span>
        </Link>

        {/* Login Card */}
        <div className="glass rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/20 backdrop-blur-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="bg-primary text-white p-2.5 rounded-2xl shadow-lg shadow-primary/20">
                <TreePine size={28} />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Ekuitraplan<span className="text-accent">.ai</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Selamat Datang
            </h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Masuk untuk melanjutkan petualangan ramah lingkungan Anda di Indonesia.
            </p>
          </div>

          {/* Social Login */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-2xl border border-white/10 transition-all duration-300 group mb-6"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">atau</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form placeholder */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">
                Alamat Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="traveler@wisexplorer.id"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <button className="text-xs text-accent hover:text-accent/80 font-medium transition-colors">
                  Lupa sandi?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  disabled
                />
              </div>
            </div>

            <button
              disabled
              className="w-full button-gradient text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-2"
            >
              Masuk Sekarang
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-white/50 mt-8">
            Belum bergabung?{" "}
            <Link
              href="/login"
              className="text-accent font-bold hover:underline transition-all"
            >
              Mulai Perjalanan Gratis
            </Link>
          </p>
        </div>

        {/* Bottom Legal */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 px-4">
          <Link href="/terms" className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest">
            Syarat & Ketentuan
          </Link>
          <Link href="/privacy" className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest">
            Kebijakan Privasi
          </Link>
          <Link href="/contact" className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest">
            Bantuan
          </Link>
        </div>
      </div>
    </main>
  );
}
