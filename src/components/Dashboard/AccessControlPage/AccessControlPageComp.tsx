"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface PermissionType {
  _id: string;
  name: string;
  description?: string;
  module: string;
}

interface RoleType {
  _id: string;
  name: string;
  description?: string;
  permissions: PermissionType[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatsType {
  total: number;
  system: number;
  custom: number;
}

type AccessControlPageCompProps = {
  initialRoles: RoleType[];
  stats: StatsType;
};

const AccessControlPageComp = ({
  initialRoles,
  stats,
}: AccessControlPageCompProps) => {
  const [roles, setRoles] = useState<RoleType[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState("");


  // فیلتر آنی بر اساس نام نقش یا توضیحات آن
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeleteRole = async (roleId: string) => {
    try {
      const res = await fetch(`/api/private/roles/delete-role/${roleId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "خطا در حذف نقش");
      }

      const data = await res.json();
      toast.info(data.message);
      setRoles((prev) => {
        return prev.filter((role) => role._id !== roleId);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "خطای سرور در حذف نقش";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* بخش اول: کارت‌های خلاصه وضعیت */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              کل نقش‌های تعریف شده
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {stats.total} نقش
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-lg">
            🛡️
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              نقش‌های سیستمی (پیش‌فرض)
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {stats.system} نقش
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-lg">
            🔒
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">نقش‌های سفارشی</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.custom} نقش
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">
            ⚙️
          </div>
        </div>
      </div>

      {/* بخش دوم: نوار ابزار جستجو */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="جستجوی نام یا توضیحات نقش..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-slate-700 text-right"
          />
          <span className="absolute right-3 top-3 text-slate-400 text-sm">
            🔍
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          نمایش {filteredRoles.length} نقش از {roles.length} نقش لود شده
        </div>
      </div>

      {/* جدول دسکتاپ */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold">
                <th className="p-4 pr-6">عنوان نقش</th>
                <th className="p-4">توضیحات</th>
                <th className="p-4">دسترسی‌ها (پرمیشن‌ها)</th>
                <th className="p-4">نوع نقش</th>
                <th className="p-4">آخرین بروزرسانی</th>
                <th className="p-4 pl-6 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <tr
                    key={role._id}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    {/* نام نقش */}
                    <td className="p-4 pr-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 font-mono tracking-wide">
                          {role.name}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          شناسه: {role._id.slice(-6)}#
                        </span>
                      </div>
                    </td>

                    {/* توضیحات */}
                    <td className="p-4 max-w-xs">
                      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                        {role.description || "توضیحاتی ثبت نشده"}
                      </p>
                    </td>

                    {/* دسترسی‌ها */}
                    <td className="p-4 max-w-md">
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                        {role.permissions.length > 0 ? (
                          role.permissions.map((perm) => (
                            <span
                              key={perm._id}
                              title={perm.description || perm.module}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                            >
                              {perm.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            بدون دسترسی ویژه (محدود)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* نوع نقش (سیستمی یا سفارشی) */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          role.isSystemRole
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${role.isSystemRole ? "bg-amber-500" : "bg-emerald-500"}`}
                        />
                        {role.isSystemRole ? "سیستمی" : "سفارشی"}
                      </span>
                    </td>

                    {/* تاریخ بروزرسانی */}
                    <td className="p-4 text-xs text-slate-500">
                      {role.updatedAt}
                    </td>

                    {/* عملیات */}
                    <td className="p-4 pl-6 text-left">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/dashboard/access-control/roles/edit-role/${role._id}`}
                          className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        >
                          ویرایش
                        </Link>
                        {/* نقش‌های سیستمی نباید حذف شوند */}
                        <button
                          disabled={role.isSystemRole}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            role.isSystemRole
                              ? "text-slate-300 cursor-not-allowed"
                              : "text-rose-600 hover:bg-rose-50"
                          }`}
                          onClick={() => handleDeleteRole(role._id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    نقشی با این مشخصات یافت نشد. 😕
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* کارت‌های موبایل */}
      <div className="block md:hidden space-y-4">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
            <div
              key={role._id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 font-mono">
                    {role.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {role._id.slice(-6)}#
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    role.isSystemRole
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {role.isSystemRole ? "سیستمی" : "سفارشی"}
                </span>
              </div>

              <hr className="border-slate-50" />

              <p className="text-xs text-slate-500 leading-relaxed">
                {role.description || "توضیحاتی ثبت نشده"}
              </p>

              <div className="space-y-1.5">
                <span className="text-slate-400 text-xs block">دسترسی‌ها:</span>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.length > 0 ? (
                    role.permissions.map((perm) => (
                      <span
                        key={perm._id}
                        className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded"
                      >
                        {perm.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      بدون دسترسی
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 text-[11px] text-slate-500">
                <div>آخرین تغییر: {role.updatedAt}</div>
                <div className="text-left">ایجاد: {role.createdAt}</div>
              </div>

              <hr className="border-slate-50" />

              <div className="flex items-center justify-end gap-2">
                <button className="flex-1 text-center text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 py-2 rounded-xl text-xs font-semibold transition-all">
                  ویرایش دسترسی‌ها
                </button>
                <button
                  disabled={role.isSystemRole}
                  className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all ${
                    role.isSystemRole
                      ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                      : "text-rose-600 bg-rose-50/50 hover:bg-rose-50"
                  }`}
                >
                  حذف نقش
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
            نقشی با این مشخصات یافت نشد. 😕
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessControlPageComp;
