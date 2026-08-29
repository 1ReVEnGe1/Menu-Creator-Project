"use client";

import type {
  IMenuData,
  IPackageData,
} from "@/types/publicPackages";

import Link from "next/link";

import { useSearchParams } from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useSession } from "next-auth/react";


interface PackageNavigationItem {
  _id: string;
  title: string;
  slug: string;
}


interface PackageDetailsClientProps {
  packages: PackageNavigationItem[];
  activePackage: IPackageData;
}


export default function PackageDetailsClientComp({
  packages,
  activePackage,
}: PackageDetailsClientProps) {

  const searchParams =
    useSearchParams();

  const { status } =
    useSession();

  const activePackageLinkRef =
    useRef<HTMLAnchorElement | null>(
      null
    );

  const initializedMenuHistory =
    useRef(false);


  /* ==========================================
     CURRENT PACKAGE
  ========================================== */

  const currentMenus =
    activePackage.menus || [];


  /* ==========================================
     POPUP STATE
  ========================================== */

  const initialMenuId =
    searchParams.get("menu");


  const [
    selectedMenuId,
    setSelectedMenuId,
  ] = useState<string | null>(
    initialMenuId
  );


  const selectedMenu:
    IMenuData | null =
    selectedMenuId

      ? currentMenus.find(
          (menu) =>
            menu._id ===
            selectedMenuId
        ) || null

      : null;


  /* ==========================================
     NAVIGATION SCROLL
  ========================================== */

  useEffect(() => {
    activePackageLinkRef
      .current
      ?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "center",
      });
  }, [
    activePackage._id,
  ]);


  /* ==========================================
     URL BUILDER
  ========================================== */

  const buildMenuUrl = (
    menuId?: string | null
  ) => {

    const url =
      new URL(
        window.location.href
      );

    if (menuId) {

      url.searchParams.set(
        "menu",
        menuId
      );

    } else {

      url.searchParams.delete(
        "menu"
      );

    }

    return `${url.pathname}${url.search}${url.hash}`;
  };


  /* ==========================================
     DIRECT LINK HISTORY FIX

     اگر کاربر مستقیم وارد:
     ?menu=ID
     شد،

     اولین Back فقط Popup را می‌بندد.
  ========================================== */

  useEffect(() => {

    if (
      initializedMenuHistory.current
    ) {
      return;
    }

    initializedMenuHistory.current =
      true;


    const params =
      new URLSearchParams(
        window.location.search
      );


    const menuId =
      params.get(
        "menu"
      );


    if (!menuId) {
      return;
    }


    const menuUrl =
      buildMenuUrl(
        menuId
      );


    const baseUrl =
      buildMenuUrl(
        null
      );


    window.history.replaceState(
      null,
      "",
      baseUrl
    );


    window.history.pushState(
      null,
      "",
      menuUrl
    );

  }, []);


  /* ==========================================
     SEARCH PARAM → STATE
  ========================================== */

  useEffect(() => {

    const menuId =
      searchParams.get(
        "menu"
      );


    setSelectedMenuId(
      menuId
    );

  }, [
    searchParams,
  ]);


  /* ==========================================
     BROWSER BACK / FORWARD
  ========================================== */

  useEffect(() => {

    const handlePopState =
      () => {

        const params =
          new URLSearchParams(
            window.location.search
          );


        setSelectedMenuId(
          params.get(
            "menu"
          )
        );

      };


    window.addEventListener(
      "popstate",
      handlePopState
    );


    return () => {

      window.removeEventListener(
        "popstate",
        handlePopState
      );

    };

  }, []);


  /* ==========================================
     OPEN MENU
  ========================================== */

  const handleOpenMenu = (
    id: string
  ) => {

    const alreadyOpen =
      Boolean(
        selectedMenuId
      );


    /*
     * مهم‌ترین قسمت:
     *
     * Popup همین لحظه باز می‌شود.
     */
    setSelectedMenuId(
      id
    );


    const newUrl =
      buildMenuUrl(
        id
      );


    if (alreadyOpen) {

      /*
       * Menu A → Menu B
       *
       * History اضافه نساز.
       */
      window.history.replaceState(
        null,
        "",
        newUrl
      );

    } else {

      /*
       * صفحه → Popup
       *
       * History بساز تا Back
       * Popup را ببندد.
       */
      window.history.pushState(
        null,
        "",
        newUrl
      );

    }
  };


  /* ==========================================
     CLOSE MENU
  ========================================== */

  const handleCloseMenu =
    () => {

      /*
       * UI فوری
       */
      setSelectedMenuId(
        null
      );


      const baseUrl =
        buildMenuUrl(
          null
        );


      /*
       * Close Button نباید
       * کاربر را از سایت خارج کند.
       */
      window.history.replaceState(
        null,
        "",
        baseUrl
      );
    };


  // از اینجا return UI فعلی خودت

  return (
    <>
      {/* Liquid Categories Bar */}
      <section className="py-3 sticky top-0 z-30 bg-white/3 border-b border-white/10 backdrop-blur-2xl backdrop-saturate-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 py-0.5">
          {packages.map((pkg) => {
            const isActive = activePackage._id === pkg._id;

            return (
              <a
                key={pkg._id}
                ref={isActive ? activePackageLinkRef : undefined}
                href={`/packages/${pkg.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={`flex-none px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 relative whitespace-nowrap border ${
                  isActive
                    ? "text-white bg-gradient-to-r from-[#85004E]/90 to-[#b5006b]/90 border-white/40 shadow-[0_4px_20px_rgba(133,0,78,0.5)] backdrop-blur-xl scale-[1.02]"
                    : "text-zinc-400 bg-white/3 border-white/10 hover:bg-white/8 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {pkg.title}
              </a>
            );
          })}
        </div>
      </section>

      {/* Menu Cards Feed */}
      <section className="p-5 flex-1 mt-0">
        <div className="flex justify-between items-center mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-black text-white tracking-tight">
              منوی {activePackage.title}
            </h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/10">
              {currentMenus.length}
            </span>
          </div>
          <span className="text-[10px] font-bold text-zinc-400">
            قیمت به تومان
          </span>
        </div>

        <div className="space-y-4.5">
          {currentMenus.length > 0 ? (
            currentMenus.map((menu) => {
              const isHighlight =
                menu.badge === "POPULAR" ||
                menu.badge === "LUXURY" ||
                menu.badge === "CIP";

              return (
                <article
                  key={menu._id}
                  onClick={() => handleOpenMenu(menu._id)}
                  className={`group relative rounded-3xl p-5 transition-all duration-300 cursor-pointer overflow-hidden border backdrop-blur-2xl backdrop-saturate-150 active:scale-[0.98] ${
                    isHighlight
                      ? "bg-gradient-to-b from-[#85004E]/25 via-white/5 to-white/2 border-[#85004E]/60 shadow-[0_8px_32px_0_rgba(133,0,78,0.25)] hover:border-[#b5006b]"
                      : "bg-white/3 border-white/10 hover:border-white/25 hover:bg-white/6 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <div className="flex justify-between items-center gap-2 mb-2.5">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      {/* {menu.subtitle || menu.guestCapacity} */}
                    </span>
                    {menu.badge && (
                      <span className="text-[9px] font-black tracking-widest text-white px-3 py-1 rounded-full bg-gradient-to-r from-[#85004E] to-[#b5006b] border border-white/30 shadow-[0_2px_10px_rgba(133,0,78,0.5)]">
                        {menu.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-[#f4a1d5] transition-colors tracking-tight">
                    {menu.title}
                  </h3>

                  {menu.description && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed whitespace-pre-line">
                      {menu.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 my-3.5">
                    {menu.items.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium text-zinc-200 bg-white/6 border border-white/10 px-2.5 py-1 rounded-xl backdrop-blur-md"
                      >
                        {item.title}
                      </span>
                    ))}
                    {menu.items.length > 3 && (
                      <span className="text-[10px] font-bold text-zinc-400 bg-white/2 border border-white/5 px-2 py-1 rounded-xl">
                        +{menu.items.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-3.5" />

                  <div className="flex justify-between items-end">
                    <div>
                      {menu.pricingTiers && menu.pricingTiers.length > 0 ? (
                        menu.pricingTiers.map((item, index) => (
                          <div key={item.price || index}>
                            <span className="text-[10px] text-zinc-400 block font-medium mb-0.5">
                              قیمت ({item.guestCapacity})
                            </span>
                            <span className="text-xl font-black text-white tracking-tight">
                              {item.price}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">
                          قیمت ثبت نشده
                        </span>
                      )}
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
            <div className="text-center py-16 rounded-3xl border border-dashed border-white/10 bg-white/1 backdrop-blur-xl">
              <p className="text-zinc-400 text-xs font-medium">
                در این دسته‌بندی پکیجی قرار ندارد.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-3 p-5 text-center text-[10px] text-zinc-500 border-t border-white/10 bg-white/1 backdrop-blur-xl">
        <span>Developed With 💖 By AMIRREZA</span>
        {status === "authenticated" ? (
          <Link className="underline text-blue-500" href="/dashboard">
            داشبورد
          </Link>
        ) : null}
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
                  <h2 className="text-2xl font-black text-white">
                    {selectedMenu.title}
                  </h2>
                </div>
                <button
                  onClick={handleCloseMenu}
                  className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 text-zinc-300 flex items-center justify-center text-xs hover:text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>

              {selectedMenu.description && (
                <p className="whitespace-pre-line text-zinc-200 text-xs leading-relaxed bg-white/4 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                  {selectedMenu.description}
                </p>
              )}

              <div>
                <h4 className="text-xs font-black text-zinc-400 mb-3.5">
                  جزئیات و آیتم‌های منو:
                </h4>
                <div className="space-y-2.5">
                  {selectedMenu.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/3 border border-white/10 text-xs text-zinc-200 backdrop-blur-md"
                    >
                      <div className="w-6 h-6 rounded-xl bg-[#85004E]/40 text-[#f4a1d5] flex items-center justify-center text-xs font-black border border-[#85004E]/60 shrink-0 shadow-sm mt-0.5">
                        ✓
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-white block">
                          {item.title}
                        </span>
                        {item.description && (
                          <p className="text-[11px] text-zinc-400 font-normal mt-1 leading-relaxed whitespace-pre-line">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="flex items-baseline justify-between mb-4 px-1">
                  <span className="text-xs text-zinc-400 font-medium">
                    قیمت :
                  </span>
                  <div className="text-right">
                    {selectedMenu.pricingTiers.map((item, idx) => (
                      <div key={item.price || idx}>
                        <span className="text-[10px] text-zinc-400 font-bold mr-1.5">
                          {item.guestCapacity}{" "}
                        </span>
                        <span className="text-2xl font-black text-white tracking-tight">
                          {item.price}{" "}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold mr-1.5">
                          تومان
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
