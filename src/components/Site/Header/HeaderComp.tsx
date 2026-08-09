"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderComp() {
  const pathname = usePathname();

  // عدم نمایش هدر در صفحات مربوط به داشبورد
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-3 px-5 md:px-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl backdrop-saturate-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden transition-all duration-300">
        
        {/* Glow Line Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* سمت راست: لوگو */}
        <Link href="/" className="flex items-center gap-3 group z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/30 p-0.5 shadow-lg shadow-[#85004E]/20 backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#b5006b] to-[#85004E] flex items-center justify-center font-black text-sm text-white shadow-inner">
              B
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white tracking-tight group-hover:text-[#f4a1d5] transition-colors">
              بارمن VIP
            </span>
            <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">
              Menu Generator
            </span>
          </div>
        </Link>

        {/* سمت چپ: دکمه داشبورد */}
        <div className="flex items-center gap-3 z-10">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#85004E] via-[#b5006b] to-[#85004E] text-white text-xs font-black shadow-[0_4px_20px_rgba(133,0,78,0.4)] hover:shadow-[0_6px_25px_rgba(181,0,107,0.6)] active:scale-[0.97] transition-all duration-300 border border-white/30 overflow-hidden"
          >
            {/* Shimmer Light Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <span>داشبورد</span>
            
            <svg
              className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}