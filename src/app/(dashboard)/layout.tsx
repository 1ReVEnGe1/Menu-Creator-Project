import DashHeader from "@/components/Dashboard/Header/DashHeaderComp";
import DashSidebarComp from "@/components/Dashboard/Sidebar/DashSidebarComp";
import MobileSidebarComp from "@/components/Dashboard/MobileSIdebar/MobileSidebarComp";

import { DashboardProvider } from "@/components/Providers/DashboardContext";

import React, { Suspense } from "react";

import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <Suspense fallback={<DashboardLoading />}>
        <AuthenticatedDashboardLayout>
          {children}
        </AuthenticatedDashboardLayout>
      </Suspense>
    </DashboardProvider>
  );
}


async function AuthenticatedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * auth() عمداً cache نمی‌شود.
   * چون session برای هر کاربر متفاوت است.
   *
   * این Component داخل Suspense قرار دارد.
   */
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <section className="flex flex-col md:flex-row-reverse min-h-screen bg-slate-50 text-slate-800">

      {/* Desktop Sidebar */}
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 p-6 hidden md:flex flex-col justify-between">

        <div>

          {/* Logo / Dashboard title */}
          <div className="mb-8 px-4">

            <h2
              className="text-xl font-bold"
              style={{
                color: "#85004E",
              }}
            >
              پنل مدیریت
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              مدیریت هوشمند سیستم
            </p>

            <Link
              className="mt-4 inline-block font-semibold py-1.5 px-3 hover:opacity-90 text-xs rounded-xl transition-all"
              style={{
                backgroundColor: "#85004E12",
                color: "#85004E",
              }}
              href="/"
            >
              مشاهده سایت
            </Link>

          </div>


          <hr className="border border-slate-100" />


          {/* Sidebar Navigation */}
          <DashSidebarComp
            role={session.user.role}
            permissions={session.user.permissions}
            isOnMobile={false}
          />

        </div>


        {/* Sidebar Footer */}
        <div className="hidden md:block pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          ورژن ۱.۰.۰
        </div>

      </aside>


      {/* Mobile Sidebar */}
      <MobileSidebarComp
        role={session.user.role}
        permissions={session.user.permissions}
      />


      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

        <DashHeader
          fullname={session.user.fullname}
        />


        <div className="bg-white rounded-2xl p-2 md:p-6 shadow-sm border border-slate-100 min-h-100">
          {children}
        </div>

      </main>

    </section>
  );
}


/*
 * چیزی که تا زمان دریافت Session نمایش داده می‌شود.
 */
function DashboardLoading() {
  return (
    <section className="flex min-h-screen bg-slate-50">

      <aside className="hidden md:block w-64 bg-white border-l border-slate-200 p-6">
        <div className="h-7 w-32 bg-slate-200 rounded-lg animate-pulse mb-3" />
        <div className="h-3 w-40 bg-slate-100 rounded animate-pulse mb-10" />

        <div className="space-y-3">
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </aside>


      <main className="flex-1 p-6 md:p-10">

        <div className="h-14 bg-white rounded-2xl animate-pulse mb-6" />

        <div className="bg-white rounded-2xl p-6 min-h-[400px] border border-slate-100">

          <div className="h-7 w-44 bg-slate-200 rounded-lg animate-pulse mb-8" />

          <div className="space-y-4">
            <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          </div>

        </div>

      </main>

    </section>
  );
}