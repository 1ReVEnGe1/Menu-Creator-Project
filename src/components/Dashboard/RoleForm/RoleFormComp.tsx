"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PermissionType {
  _id: string;
  name: string;
  description: string;
  module: string;
}

interface InitialDataType {
  _id?: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole?: boolean; // فیلد بازگشتی از دیتابیس
}

type RoleFormCompProps = {
  allPermissions: PermissionType[];
  initialData?: InitialDataType;
  mode: "create" | "edit";
  // یک پراپ اختیاری که مشخص می‌کند کاربر فعلی ادمین اصلی سایت است یا خیر
  isSuperAdmin?: boolean; 
};

const RoleFormComp = ({ allPermissions, initialData, mode, isSuperAdmin = true }: RoleFormCompProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // اضافه کردن وضعیت اسکیما به فیلدهای فرم
  const [formData, setFormData] = useState<InitialDataType>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    permissions: initialData?.permissions || [],
    isSystemRole: initialData?.isSystemRole || false, // مقداردهی اولیه
  });

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, PermissionType[]>);

  const handlePermissionChange = (permId: string) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.permissions.includes(permId);
      const updatedPermissions = isAlreadySelected
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId];

      return { ...prev, permissions: updatedPermissions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("لطفاً نام نقش را وارد کنید.");
    
    setLoading(true);
    try {
      const url = mode === "create" 
        ? "/api/private/roles/add-role" 
        : `/api/private/roles/edit-role/${initialData?._id}`;
        
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name.toUpperCase().replace(/\s+/g, "_"),
        }),
      });

      if (res.ok) {
        router.push("/dashboard/access-control");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "خطایی رخ داد.");
      }
    } catch (error) {
      console.error(error);
      alert("اتصال برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      
      {/* هدر فرم */}
      <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {mode === "create" ? "ایجاد نقش کاربری جدید" : `ویرایش نقش ${initialData?.name}`}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مشخصات نقش و سطوح دسترسی مربوط به آن را تنظیم کنید.
          </p>
        </div>
        <Link 
          href="/dashboard/access-control" 
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl transition-all"
        >
          بازگشت به لیست
        </Link>
      </div>

      {/* بخش اول: اطلاعات اصلی نقش */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">عنوان نقش (به انگلیسی)</label>
          <input
            type="text"
            placeholder="مثال: CONTENT_MANAGER"
            disabled={mode === "edit" && initialData?.isSystemRole}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-left"
            dir='ltr'
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">توضیحات نقش (فارسی)</label>
          <input
            type="text"
            placeholder="مثال: دسترسی به بخش مدیریت مقالات و پادکست‌ها"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-right"
          />
        </div>

        {/* ⚡ چک‌باکس تعیین نقش سیستمی - مخصوص سوپر ادمین */}
        {isSuperAdmin && (
          <div className="md:col-span-2 pt-2 border-t border-slate-50 mt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isSystemRole}
                // اگر نقش از قبل سیستمی بوده، قفلش کن تا کسی نتواند از حالت سیستمی خارجش کند
                disabled={mode === "edit" && initialData?.isSystemRole}
                onChange={(e) => setFormData({ ...formData, isSystemRole: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600 dynamic-checkbox"
              />
              <div>
                <span className="text-xs font-bold text-rose-700 block">این یک نقش سیستمی (System Role) است</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  نقش‌های سیستمی هسته اصلی دسترسی‌ها هستند و توسط کاربران عادی قابل حذف یا تغییر نام نیستند.
                </span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* بخش دوم: ماتریکس دسترسی‌ها */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700">تنظیم سطوح دسترسی (پرمیشن‌ها)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
            <div key={moduleName} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-700">ماژول: {moduleName.toUpperCase()}</span>
                <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-md border">
                  {perms.length} دسترسی
                </span>
              </div>
              
              <div className="p-4 space-y-3">
                {perms.map((perm) => {
                  const isChecked = formData.permissions.includes(perm._id);
                  return (
                    <label 
                      key={perm._id} 
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all duration-150 ${
                        isChecked 
                          ? "border-indigo-100 bg-indigo-50/30" 
                          : "border-slate-100/70 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handlePermissionChange(perm._id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700 block">{perm.name}</span>
                        <span className="text-[11px] text-slate-400 block leading-relaxed">{perm.description || "بدون توضیح"}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* دکمه‌های ثبت عملیات */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Link 
          href="/dashboard/access-control" 
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all"
        >
          انصراف
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-md shadow-indigo-100"
        >
          {loading ? "در حال ثبت..." : mode === "create" ? "ذخیره و ایجاد نقش" : "اعمال تغییرات"}
        </button>
      </div>

    </form>
  );
};

export default RoleFormComp;