"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlanner = pathname === "/planner";

  return (
    <>
      {!isPlanner && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isPlanner && <Footer />}
    </>
  );
}
