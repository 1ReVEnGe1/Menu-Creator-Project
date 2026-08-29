import DashHeader from "@/components/Dashboard/Header/DashHeaderComp";
import DashSidebarComp from "@/components/Dashboard/Sidebar/DashSidebarComp";

import React from "react";

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import MobileSidebarComp from "@/components/Dashboard/MobileSIdebar/MobileSidebarComp";
import { DashboardProvider } from "@/components/Providers/DashboardContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <DashboardProvider>
      <section className="flex flex-col md:flex-row-reverse min-h-screen bg-slate-50 text-slate-800">
        {/* سایدبار */}
        <aside className="w-full md:w-64 bg-white border-l border-slate-200 p-6 hidden md:flex flex-col justify-between">
          <div>
            {/* لوگو */}
            <div className="mb-8 px-4">
              <h2
                className="text-xl font-bold"
                style={{ color: "#85004E" }}
              >
                پنل مدیریت
              </h2>
              <p className="text-xs text-slate-400 mt-1">مدیریت هوشمند سیستم</p>
              <Link
                className="mt-4 inline-block font-semibold py-1.5 px-3 hover:opacity-90 text-xs rounded-xl transition-all"
                style={{
                  backgroundColor: "#85004E12",
                  color: "#85004E",
                }}
                href={"/"}
              >
                مشاهده سایت
              </Link>
            </div>
            <hr className="border border-slate-100" />

            {/* منوی ناوبری پویا */}
            <DashSidebarComp
              role={session.user.role}
              permissions={session.user.permissions}
              isOnMobile={false}
            />
          </div>

          {/* فوتر سایدبار */}
          <div className="hidden md:block pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            ورژن ۱.۰.۰
          </div>
        </aside>

        {/* Mobile Menu */}
        <MobileSidebarComp
          role={session.user.role}
          permissions={session.user.permissions}
        />

        {/* محتوای اصلی */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <DashHeader fullname={session.user.fullname} />

          <div className="bg-white rounded-2xl p-2 md:p-6 shadow-sm border border-slate-100 min-h-100">
            {children}
          </div>
        </main>
      </section>
    </DashboardProvider>
  );
}