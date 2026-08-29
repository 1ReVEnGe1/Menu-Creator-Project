import AccessControlPageComp from "@/components/Dashboard/AccessControlPage/AccessControlPageComp";

import connectDB from "lib/db";

import { Permission } from "models/Permission";
import { Role } from "models/Role";

import Link from "next/link";

import { Suspense } from "react";
import { connection } from "next/server";

const LIMIT = 10;

/* =========================================================
   DATABASE DATA
========================================================= */

const getRolesData = async () => {
  await connectDB();

  /*
   * Queryها مستقل هستند.
   * پس همزمان اجرا می‌کنیم تا سریع‌تر شود.
   */
  const [totalRoles, systemRoles, roles] =
    await Promise.all([
      Role.countDocuments(),

      Role.countDocuments({
        isSystemRole: true,
      }),

      Role.find()
        .limit(LIMIT)
        .populate({
          path: "permissions",
          model: Permission,
        })
        .lean(),
    ]);

  const customRoles =
    totalRoles - systemRoles;

  const serializedRoles = roles.map(
    (role: any) => ({
      _id: role._id.toString(),

      name: role.name,

      description: role.description,

      permissions: Array.isArray(
        role.permissions
      )
        ? role.permissions.map(
            (p: any) => ({
              _id: p._id.toString(),
              name: p.name,
              description: p.description,
              module: p.module,
            })
          )
        : [],

      isSystemRole:
        role.isSystemRole,

      createdAt: role.createdAt
        ? new Date(
            role.createdAt
          ).toLocaleDateString(
            "fa-IR"
          )
        : "ثبت نشده",

      updatedAt: role.updatedAt
        ? new Date(
            role.updatedAt
          ).toLocaleDateString(
            "fa-IR"
          )
        : "ثبت نشده",
    })
  );

  return {
    roles: serializedRoles,

    stats: {
      total: totalRoles,
      system: systemRoles,
      custom: customRoles,
    },
  };
};

/* =========================================================
   PAGE
========================================================= */

export default function AccessControlPage() {
  return (
    <Suspense
      fallback={
        <AccessControlLoading />
      }
    >
      <AccessControlContent />
    </Suspense>
  );
}

/* =========================================================
   RUNTIME CONTENT
========================================================= */

async function AccessControlContent() {
  /*
   * خیلی مهم:
   *
   * به Next می‌گوییم این قسمت
   * در Build اجرا نشود.
   *
   * فقط وقتی Request واقعی آمد
   * اجرا شود.
   */
  await connection();

  const { roles, stats } =
    await getRolesData();

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 text-right min-h-screen bg-slate-50 text-slate-800 rounded-2xl space-y-6"
      dir="rtl"
    >
      {/* Header */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            مدیریت نقش‌ها و دسترسی‌ها
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            تنظیم و مانیتورینگ سطوح دسترسی کاربران سیستم
          </p>
        </div>

        <div className="flex flex-col items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/dashboard/access-control/roles/new-role"
            className="w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-white shadow-md hover:shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold"
            style={{
              backgroundColor:
                "#85004E",
            }}
          >
            <span className="text-base sm:text-lg leading-none">
              +
            </span>

            <span>
              افزودن نقش جدید
            </span>
          </Link>

          <Link
            href="/dashboard/access-control/permissions"
            className="w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold border border-slate-200"
          >
            <span>
              مدیریت دسترسی‌ها
            </span>
          </Link>
        </div>
      </div>

      {/* Client Component */}

      <AccessControlPageComp
        initialRoles={roles}
        stats={stats}
      />
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function AccessControlLoading() {
  return (
    <div
      className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50 rounded-2xl space-y-6"
      dir="rtl"
    >
      {/* Header Skeleton */}

      <div className="bg-white p-6 rounded-3xl border border-slate-100">
        <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse mb-3" />

        <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />

        <div className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />

        <div className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />
      </div>

      {/* List */}

      <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4">
        <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />

        <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />

        <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />

        <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}