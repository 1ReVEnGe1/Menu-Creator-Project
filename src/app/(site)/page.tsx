"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface MenuItem {
  id: number;
  category: string;
  name: string;
  subtitle: string;
  price: string;
  badge?: string;
  description: string;
  features: string[];
}

const CATEGORIES = [
  "بار و بارتندری",
  "تولد",
  "عروسی",
  "فینگرفود",
  "میز مزه",
  "ویژه",
];

const INITIAL_MENUS: MenuItem[] = [
  {
    id: 1,
    category: "بار و بارتندری",
    name: "ECO",
    subtitle: "Essential Bar Experience",
    price: "20,500,000",
    badge: "",
    description:
      "یک پکیج اقتصادی و کاربردی برای اجرای یک بار حرفه‌ای در مراسم شما.",
    features: [
      "یک نفر بارتندر حرفه‌ای",
      "سرویس لیوان و گیلاس",
      "۶ الی ۸ مدل سیروپ",
      "لوازم کار و دیزاین بار",
      "۴ الی ۶ مدل کوکتل تک ستاره",
    ],
  },
  {
    id: 2,
    category: "بار و بارتندری",
    name: "MENU 01",
    subtitle: "Classic Bar Experience",
    price: "28,500,000",
    badge: "",
    description: "تجربه کلاسیک بارتندری برای مهمانی‌های شما.",
    features: [
      "بارتندر حرفه‌ای",
      "سرویس لیوان و گیلاس",
      "آبمیوه و ملزومات",
      "یخ بهداشتی",
      "۶ الی ۸ مدل سیروپ",
      "کوکتل‌های تک ستاره",
    ],
  },
  {
    id: 3,
    category: "تولد",
    name: "MENU 02",
    subtitle: "Signature Bar Experience",
    price: "36,500,000",
    badge: "POPULAR",
    description: "یک تجربه کامل‌تر همراه با تجهیزات و اجرای نمایشی.",
    features: [
      "بارتندر حرفه‌ای",
      "بلندر مخصوص اسموتی",
      "Fire Show",
      "Cloud Show",
      "۶ الی ۸ کوکتل",
      "انتخاب از کوکتل‌های IBA",
    ],
  },
  {
    id: 4,
    category: "عروسی",
    name: "MENU 03",
    subtitle: "Premium Bar Experience",
    price: "55,500,000",
    badge: "PREMIUM",
    description: "پکیج پریمیوم با کوکتل‌های ویژه و سرویس کامل.",
    features: [
      "بارتندر حرفه‌ای",
      "۴ الی ۶ مدل لیوان",
      "بلندر",
      "میوه و پاستیل",
      "۸ کوکتل دو ستاره",
      "Fire Show",
      "Cloud Show",
    ],
  },
  {
    id: 5,
    category: "ویژه",
    name: "MENU 04",
    subtitle: "Luxury Bar Experience",
    price: "72,000,000",
    badge: "LUXURY",
    description: "تجربه لوکس بارتندری با اجرای ویژه.",
    features: [
      "بارتندر حرفه‌ای + فلر",
      "خاویار طعم‌دار",
      "بلندر",
      "10 الی 12 کوکتل سه ستاره",
      "Fire Show ویژه",
      "ماکتیل ایتالیایی و فرانسوی",
    ],
  },
  {
    id: 6,
    category: "ویژه",
    name: "MENU 05",
    subtitle: "Signature Barman Experience",
    price: "98,000,000",
    badge: "CIP",
    description: "بالاترین سطح تجربه Barman برای مراسم‌های خاص.",
    features: [
      "شات با خاویار بلوگا",
      "طلای ۲۴ عیار خوراکی",
      "میکس‌های تصفیه‌شده",
      "کوکتل‌های اختصاصی",
      "تجربه Signature Barman",
    ],
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("بار و بارتندری");
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/packages");

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData.message || "خطا در دریافت پکیج ها");
      }

      const data = await res.json();
      console.log(data);
      setPackages(data.packages);
    })();
  }, []);

  // ۱. فراخوانی هوک‌های Next.js
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ۲. استخراج آیدی آیتم از Query Parameter (مثلاً ?menu=3)
  const menuIdParam = searchParams.get("menu");

  // ۳. محاسبه آیتم انتخاب‌شده به‌جای ذخیره مستقیم در useState
  const selectedMenu =
    INITIAL_MENUS.find((item) => item.id.toString() === menuIdParam) || null;

  // ۴. تابع باز کردن Drawer (اضافه کردن به URL و Browser History)
  const handleOpenMenu = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("menu", id.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ۵. تابع بستن Drawer (عقب رفتن در History مرورگر)
  const handleCloseMenu = () => {
    router.back();
  };

  const filteredMenus = INITIAL_MENUS.filter(
    (item) => item.category === activeCategory,
  );

  return (
    <>
      {/* App Shell Container */}

      {/* Liquid Categories Bar */}
      <section className="py-3 sticky top-20 z-30 bg-[#030204]/60 backdrop-blur-2xl border-b border-white/10">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 py-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-none px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 relative whitespace-nowrap border ${
                  isActive
                    ? "text-white bg-gradient-to-r from-[#85004E]/90 to-[#b5006b]/90 border-white/40 shadow-[0_4px_20px_rgba(133,0,78,0.5)] backdrop-blur-xl scale-[1.02]"
                    : "text-zinc-400 bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Menu Cards Feed */}
      <section className="p-5 flex-1 mt-20">
        <div className="flex justify-between items-center mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-black text-white tracking-tight">
              منوی {activeCategory}
            </h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/10">
              {filteredMenus.length}
            </span>
          </div>
          <span className="text-[10px] font-bold text-zinc-400">
            قیمت به تومان
          </span>
        </div>

        <div className="space-y-4.5">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu) => {
              const isHighlight =
                menu.badge === "POPULAR" ||
                menu.badge === "LUXURY" ||
                menu.badge === "CIP";

              return (
                <article
                  key={menu.id}
                  onClick={() => handleOpenMenu(menu.id)}
                  className={`group relative rounded-3xl p-5 transition-all duration-300 cursor-pointer overflow-hidden border backdrop-blur-2xl backdrop-saturate-150 active:scale-[0.98] ${
                    isHighlight
                      ? "bg-gradient-to-b from-[#85004E]/25 via-white/[0.05] to-white/[0.02] border-[#85004E]/60 shadow-[0_8px_32px_0_rgba(133,0,78,0.25)] hover:border-[#b5006b]"
                      : "bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <div className="flex justify-between items-center gap-2 mb-2.5">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      {menu.subtitle}
                    </span>
                    {menu.badge && (
                      <span className="text-[9px] font-black tracking-widest text-white px-3 py-1 rounded-full bg-gradient-to-r from-[#85004E] to-[#b5006b] border border-white/30 shadow-[0_2px_10px_rgba(133,0,78,0.5)]">
                        {menu.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-[#f4a1d5] transition-colors tracking-tight">
                    {menu.name}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 my-3.5">
                    {menu.features.slice(0, 3).map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium text-zinc-200 bg-white/[0.06] border border-white/10 px-2.5 py-1 rounded-xl backdrop-blur-md"
                      >
                        {feat}
                      </span>
                    ))}
                    {menu.features.length > 3 && (
                      <span className="text-[10px] font-bold text-zinc-400 bg-white/[0.02] border border-white/5 px-2 py-1 rounded-xl">
                        +{menu.features.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-3.5" />

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-medium mb-0.5">
                        سرمایه‌گذاری پکیج
                      </span>
                      <span className="text-xl font-black text-white tracking-tight">
                        {menu.price}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center group-hover:bg-[#85004E] group-hover:border-[#b5006b] transition-all duration-300 shadow-lg shadow-black/20 group-hover:shadow-[0_0_15px_#85004E]">
                      <svg
                        className="w-4 h-4 rotate-180"
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
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center py-16 rounded-3xl border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-xl">
              <p className="text-zinc-400 text-xs font-medium">
                در این دسته‌بندی پکیجی قرار ندارد.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Liquid Glass Footer */}
      <footer className="p-5 text-center text-[10px] text-zinc-500 border-t border-white/10 bg-white/[0.01] backdrop-blur-xl">
        طراحی شده برای سرویس VIP بارمن • تمامی حقوق محفوظ است
      </footer>

      {/* Liquid Sheet Drawer Modal */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-2xl z-50 transition-all duration-300 flex items-end justify-center ${
          selectedMenu
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleCloseMenu}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md bg-[#0a060d]/80 border-t border-white/20 rounded-t-[36px] p-6 pb-8 max-h-[85vh] overflow-y-auto backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out relative ${
            selectedMenu ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full bg-white/30 blur-[1px]" />

          <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-6" />

          {selectedMenu && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-[#e250a2] tracking-widest uppercase block mb-1">
                    {selectedMenu.category} • {selectedMenu.subtitle}
                  </span>
                  <h2 className="text-2xl font-black text-white">
                    {selectedMenu.name}
                  </h2>
                </div>
                <button
                  onClick={handleCloseMenu}
                  className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 text-zinc-300 flex items-center justify-center text-xs hover:text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>

              <p className="text-zinc-200 text-xs leading-relaxed bg-white/[0.04] p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                {selectedMenu.description}
              </p>

              <div>
                <h4 className="text-xs font-black text-zinc-400 mb-3.5">
                  جزئیات و خدمات پکیج:
                </h4>
                <div className="space-y-2.5">
                  {selectedMenu.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200 backdrop-blur-md"
                    >
                      <div className="w-6 h-6 rounded-xl bg-[#85004E]/40 text-[#f4a1d5] flex items-center justify-center text-xs font-black border border-[#85004E]/60 shrink-0 shadow-sm">
                        ✓
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="flex items-baseline justify-between mb-4 px-1">
                  <span className="text-xs text-zinc-400 font-medium">
                    سرمایه‌گذاری کل:
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {selectedMenu.price}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold mr-1.5">
                      تومان
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(`درخواست رزرو برای ${selectedMenu.name} ثبت شد.`)
                  }
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#85004E] via-[#b5006b] to-[#85004E] text-white text-sm font-black shadow-[0_10px_30px_rgba(133,0,78,0.5)] active:scale-[0.98] transition-all border border-white/30 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                  درخواست و رزرو این پکیج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
