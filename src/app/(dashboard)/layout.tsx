import DashHeader from "@/components/Dashboard/Header/DashHeaderComp";
import DashSidebarComp from "@/components/Dashboard/Sidebar/DashSidebarComp";

import React from "react";

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

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
    <section className="flex flex-col md:flex-row-reverse min-h-screen bg-slate-50 text-slate-800" dir="rtl">
      {/* سایدبار */}
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 p-6 flex flex-col justify-between">
        <div>
          {/* لوگو */}
          <div className="mb-8 px-4">
            <h2 className="text-xl font-bold text-indigo-600">پنل مدیریت</h2>
            <p className="text-xs text-slate-400 mt-1">مدیریت هوشمند سیستم</p>
            <Link className="mt-4 block bg-gray-100 w-fit py-1 px-3 hover:bg-gray-200 text-sm rounded-xl text-blue-600" href={'/'}>مشاهده سایت</Link>
          </div>
          <hr className="border border-gray-200" />

          {/* منوی ناوبری پویا */}
          <DashSidebarComp
            role={session.user.role}
            permissions={session.user.permissions}
          />
        </div>

        {/* فوتر سایدبار */}
        <div className="hidden md:block pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          ورژن ۱.۰.۰
        </div>
      </aside>

      {/* محتوای اصلی */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <DashHeader fullname={session.user.fullname} />

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-100">
          {children}
        </div>
      </main>
    </section>
  );
}