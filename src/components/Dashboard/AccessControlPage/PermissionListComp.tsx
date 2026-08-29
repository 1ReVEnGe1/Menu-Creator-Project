"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PermissionType {
  _id: string;
  name: string;
  description: string;
  module: string;
}

type PermissionListCompProps = {
  initialPermissions: PermissionType[];
};

const PermissionListComp = ({ initialPermissions }: PermissionListCompProps) => {
  const router = useRouter();
  const [permissions, setPermissions] = useState<PermissionType[]>(initialPermissions);

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, PermissionType[]>);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف دسترسی "${name}" مطمئن هستید؟ این عمل غیرقابل بازگشت است.`)) return;

    try {
      const res = await fetch(`/api/private/permissions/delete-permission/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPermissions((prev) => prev.filter((p) => p._id !== id));
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "خطایی در حذف رخ داد.");
      }
    } catch (error) {
      console.error(error);
      alert("اتصال با سرور برقرار نشد.");
    }
  };

  if (permissions.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-sm">
        <p className="text-sm text-slate-400">هیچ سطح دسترسی هنوز در سیستم تعریف نشده است.</p>
        <Link
          href="/dashboard/access-control/permissions/new-permission"
          className="text-xs font-bold mt-3 inline-block hover:underline"
          style={{ color: "#85004E" }}
        >
          اولین پرمیشن را بسازید ←
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
        <div key={moduleName} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* هدر ماژول */}
          <div className="bg-slate-50/70 px-4 sm:px-5 py-3.5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#85004E" }}
              />
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ماژول: {moduleName}
              </h2>
            </div>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: "#85004E12", color: "#85004E" }}
            >
              {perms.length} دسترسی
            </span>
          </div>

          {/* جدول دسکتاپ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold bg-slate-50/30">
                  <th className="p-4 pr-6">کلید سیستم (System Name)</th>
                  <th className="p-4">توضیحات دسترسی</th>
                  <th className="p-4 pl-6 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {perms.map((perm) => (
                  <tr key={perm._id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="p-4 pr-6">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg transition-colors">
                        {perm.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-slate-500 leading-relaxed">
                        {perm.description || "—"}
                      </span>
                    </td>
                    <td className="p-4 pl-6 text-left">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/dashboard/access-control/permissions/edit-permission/${perm._id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          ویرایش
                        </Link>
                        <button
                          onClick={() => handleDelete(perm._id, perm.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* نمایش کارت در موبایل */}
          <div className="block md:hidden divide-y divide-slate-100">
            {perms.map((perm) => (
              <div key={perm._id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {perm.name}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {perm.description || "توضیحاتی ثبت نشده"}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link
                    href={`/dashboard/access-control/permissions/edit-permission/${perm._id}`}
                    className="flex-1 text-center py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    ویرایش
                  </Link>
                  <button
                    onClick={() => handleDelete(perm._id, perm.name)}
                    className="flex-1 text-center py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionListComp;