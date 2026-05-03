import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TreePine, Map, Leaf, LogOut } from "lucide-react";
import { signOut } from "@/auth";

export const metadata = {
  title: "Dashboard | Ekuitraplan.ai",
  description: "Kelola perjalanan berkelanjutan Anda.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Halo, {session.user.name?.split(" ")[0] ?? "Traveler"} 👋
            </h1>
            <p className="text-slate-600 mt-1">
              Siap merencanakan perjalanan berkelanjutan berikutnya?
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/chat"
            className="glass p-6 rounded-2xl border-white/60 shadow-sm hover:shadow-lg transition-all duration-200 group"
          >
            <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-emerald-700 group-hover:scale-110 transition-transform">
              <Map size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Rencana Baru
            </h3>
            <p className="text-slate-600 text-sm">
              Mulai merencanakan perjalanan dengan AI assistant.
            </p>
          </Link>

          <Link
            href="/trips"
            className="glass p-6 rounded-2xl border-white/60 shadow-sm hover:shadow-lg transition-all duration-200 group"
          >
            <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-emerald-700 group-hover:scale-110 transition-transform">
              <TreePine size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Perjalanan Saya
            </h3>
            <p className="text-slate-600 text-sm">
              Lihat dan kelola rencana perjalanan yang sudah dibuat.
            </p>
          </Link>

          <Link
            href="/carbon"
            className="glass p-6 rounded-2xl border-white/60 shadow-sm hover:shadow-lg transition-all duration-200 group"
          >
            <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-emerald-700 group-hover:scale-110 transition-transform">
              <Leaf size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Jejak Karbon
            </h3>
            <p className="text-slate-600 text-sm">
              Pantau dan offset jejak karbon dari perjalanan Anda.
            </p>
          </Link>
        </div>

        {/* Empty State */}
        <div className="glass rounded-3xl p-12 text-center border-white/60 shadow-sm">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-700">
            <Map size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Belum ada perjalanan
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Mulai rencanakan perjalanan berkelanjutan pertama Anda bersama AI assistant kami.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-full shadow-sm transition-colors"
          >
            <Map size={18} />
            Mulai Merencanakan
          </Link>
        </div>
      </div>
    </main>
  );
}
