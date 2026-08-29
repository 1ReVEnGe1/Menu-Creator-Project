import { auth } from "@/auth";
import PackagesPageComp from "@/components/Dashboard/PackagesPage/PackagesPageComp";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getDashboardPackages } from "utils/dashboardPackages";

export default function PackagesPage() {
  return (
    <Suspense fallback={<PackagesLoading />}>
      <PackagesContent />
    </Suspense>
  );
}

async function PackagesContent() {
  // This page is admin/runtime data. Do not prerender it at build time.
  await connection();

  // Run auth and the MongoDB read in parallel.
  const [session, packages] = await Promise.all([
    auth(),
    getDashboardPackages(),
  ]);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <PackagesPageComp
      userPermissions={session.user.permissions || []}
      initialPackages={packages}
    />
  );
}

function PackagesLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      <div className="h-24 bg-slate-100 rounded-3xl animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    </div>
  );
}
