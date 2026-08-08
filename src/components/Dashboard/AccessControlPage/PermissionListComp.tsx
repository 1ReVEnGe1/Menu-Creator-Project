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

  // گروه‌بندی پرمیشن‌ها بر اساس ماژول برای نمایش کارآمدتر
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, PermissionType[]>);

  // عملیات حذف پرمیشن
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف دسترسی "${name}" مطمئن هستید؟ این عمل غیرقابل بازگشت است.`)) return;

    try {
      const res = await fetch(`/api/private/permissions/delete-permission/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // حذف آیتم از استیت فرانت‌اند برای تجربه کاربری سریع‌تر
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
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
        <p className="text-sm text-slate-400">هیچ سطح دسترسی هنوز در سیستم تعریف نشده است.</p>
        <Link
          href="/dashboard/access-control/permissions/new-permission"
          className="text-xs text-indigo-600 font-bold mt-3 inline-block hover:underline"
        >
          اولین پرمیشن را بسازید ←
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
        <div key={moduleName} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* هدر ماژول */}
          <div className="bg-slate-50/70 px-5 py-3.5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ماژول: {moduleName}
              </h2>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
              {perms.length} دسترسی
            </span>
          </div>

          {/* جدول دسترسی‌های این ماژول */}
          <div className="overflow-x-auto">
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
                    {/* نام سیستمیک */}
                    <td className="p-4 pr-6">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                        {perm.name}
                      </span>
                    </td>
                    
                    {/* توضیحات */}
                    <td className="p-4">
                      <span className="text-xs text-slate-500 leading-relaxed">
                        {perm.description || "—"}
                      </span>
                    </td>

                    {/* دکمه‌های اکشن */}
                    <td className="p-4 pl-6 text-left space-x-2 space-x-reverse flex justify-end gap-2 ">
                      <Link
                        href={`/dashboard/access-control/permissions/edit-permission/${perm._id}`}
                        className=" text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all block w-fit"
                      >
                        ویرایش
                      </Link>
                      <button
                        onClick={() => handleDelete(perm._id, perm.name)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all inline-block"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ))}
    </div>
  );
};

export default PermissionListComp;