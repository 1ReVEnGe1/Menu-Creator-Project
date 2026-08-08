"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InitialDataType {
  _id?: string;
  name: string;
  description: string;
  module: string;
}

type PermissionFormCompProps = {
  initialData?: InitialDataType;
  mode: "create" | "edit";
};

// لیست چند ماژول پیش‌فرض برای راحتی انتخاب کاربر (می‌توانی تغییرش دهی)
const AVAILABLE_MODULES = ["users", "packages"];

const PermissionFormComp = ({ initialData, mode }: PermissionFormCompProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // وضعیت فیلدهای فرم
  const [formData, setFormData] = useState<Omit<InitialDataType, "_id">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    module: initialData?.module || "users", // ماژول پیش‌فرض
  });

  // ارسال داده‌ها به API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.module.trim()) {
      return alert("لطفاً نام دسترسی و ماژول را مشخص کنید.");
    }

    setLoading(true);
    try {
      const url = mode === "create"
        ? "/api/private/permissions/add-permission/"
        : `/api/private/permissions/edit-permission/${initialData?._id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // استانداردسازی نام پرمیشن (مثال: read:users یا CREATE_PRODUCT)
          name: formData.name.trim(), 
          module: formData.module.toLowerCase().trim()
        }),
      });

      if (res.ok) {
        router.push("/dashboard/access-control/permissions");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "خطایی رخ داد.");
      }
    } catch (error) {
      console.error(error);
      alert("اتصال با سرور برقرار نشد.");
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
            {mode === "create" ? "ایجاد سطح دسترسی (Permission) جدید" : `ویرایش دسترسی ${initialData?.name}`}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            یک کلید دسترسی جدید برای فیلتر کردن عملیات کاربران در سیستم بسازید.
          </p>
        </div>
        <Link 
          href="/dashboard/access-control/permissions" 
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl transition-all"
        >
          بازگشت
        </Link>
      </div>

      {/* باکس اصلی فرم */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        
        {/* ۱. نام کلید دسترسی */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            کلید دسترسی (System Name)
          </label>
          <input
            type="text"
            placeholder="users:read or products:write"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-left"
            dir="ltr"
          />
        </div>

        {/* ۲. انتخاب یا نوشتن ماژول */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            ماژول مربوطه (Module)
          </label>
          <div className="flex gap-2">
            <select
              value={AVAILABLE_MODULES.includes(formData.module) ? formData.module : "custom"}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  setFormData({ ...formData, module: e.target.value });
                }
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500"
            >
              {AVAILABLE_MODULES.map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
              <option value="custom">سایر ماژول‌ها...</option>
            </select>

            <input
              type="text"
              placeholder="نام ماژول (مثلا: پادکست)"
              value={formData.module}
              onChange={(e) => setFormData({ ...formData, module: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-left"
            />
          </div>
        </div>

        {/* ۳. توضیحات فارسی */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            توضیحات (جهت نمایش به مدیر در ماتریکس دسترسی‌ها)
          </label>
          <input
            type="text"
            placeholder="مثال: اجازه مشاهده لیست کاربران سیستم"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-right"
          />
        </div>

      </div>

      {/* دکمه‌ها */}
      <div className="flex items-center justify-end gap-3 pt-2">
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
          {loading ? "در حال ثبت..." : mode === "create" ? "ایجاد پرمیشن" : "اعمال تغییرات"}
        </button>
      </div>

    </form>
  );
};

export default PermissionFormComp;