import PermissionListComp from "@/components/Dashboard/AccessControlPage/PermissionListComp";

import connectDB from "lib/db";

import { Permission } from "models/Permission";

import Link from "next/link";

import { Suspense } from "react";

import { connection } from "next/server";


/* =========================================================
   DATABASE DATA
========================================================= */

async function getAllPermissions() {
  await connectDB();

  const permissions = await Permission.find({})
    .sort({
      module: 1,
      name: 1,
    })
    .lean();

  return permissions.map((p: any) => ({
    _id: p._id.toString(),

    name: p.name,

    description:
      p.description || "",

    module:
      p.module,
  }));
}


/* =========================================================
   PAGE
========================================================= */

export default function PermissionsPage() {
  return (
    <Suspense
      fallback={
        <PermissionsLoading />
      }
    >
      <PermissionsContent />
    </Suspense>
  );
}


/* =========================================================
   RUNTIME CONTENT
========================================================= */

async function PermissionsContent() {

  /*
   * خیلی مهم:
   *
   * این connection مربوط به Next.js است.
   * یعنی:
   *
   * این بخش را هنگام BUILD اجرا نکن.
   * وقتی request واقعی آمد اجرا کن.
   */
  await connection();


  const permissions =
    await getAllPermissions();


  return (
    <div
      className="p-4 sm:p-6 mx-auto space-y-6"
      dir="rtl"
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">

        <div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            مدیریت سطوح دسترسی (Permissions)
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            لیست کلیدهای دسترسی تعریف شده در سیستم به تفکیک ماژول‌های برنامه‌نویسی.
          </p>

        </div>


        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">

          <Link
            href="/dashboard/access-control"
            className="w-full sm:w-auto text-center text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all border border-slate-200/60"
          >
            مدیریت نقش‌ها (Roles)
          </Link>


          <Link
            href="/dashboard/access-control/permissions/new-permission"
            className="w-full sm:w-auto text-center text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:opacity-95"
            style={{
              backgroundColor:
                "#85004E",
            }}
          >
            + افزودن پرمیشن جدید
          </Link>

        </div>

      </div>


      {/* =====================================
          PERMISSIONS
      ===================================== */}

      <PermissionListComp
        initialPermissions={
          permissions
        }
      />

    </div>
  );
}


/* =========================================================
   LOADING UI
========================================================= */

function PermissionsLoading() {

  return (
    <div
      className="p-4 sm:p-6 mx-auto space-y-6"
      dir="rtl"
    >

      {/* Header */}

      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-5">

        <div className="space-y-2">

          <div className="h-7 w-64 bg-slate-200 rounded-lg animate-pulse" />

          <div className="h-4 w-96 max-w-full bg-slate-100 rounded-lg animate-pulse" />

        </div>


        <div className="flex gap-2">

          <div className="h-10 w-36 bg-slate-100 rounded-xl animate-pulse" />

          <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse" />

        </div>

      </div>


      {/* Permissions skeleton */}

      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">

        <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />

        <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />

        <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />

        <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />

        <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />

      </div>

    </div>
  );
}