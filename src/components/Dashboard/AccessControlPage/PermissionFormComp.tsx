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

const AVAILABLE_MODULES = ["users", "packages"];

const PermissionFormComp = ({ initialData, mode }: PermissionFormCompProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Omit<InitialDataType, "_id">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    module: initialData?.module || "users",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.module.trim()) {
      return alert("لطفاً نام دسترسی و ماژول را مشخص کنید.");
    }

    setLoading(true);
    try {
      const url =
        mode === "create"
          ? "/api/private/permissions/add-permission/"
          : `/api/private/permissions/edit-permission/${initialData?._id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          module: formData.module.toLowerCase().trim(),
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
      {/* هدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {mode === "create"
              ? "ایجاد سطح دسترسی جدید"
              : `ویرایش دسترسی ${initialData?.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            یک کلید دسترسی جدید برای فیلتر کردن عملیات کاربران بسازید.
          </p>
        </div>
        <Link
          href="/dashboard/access-control/permissions"
          className="w-full sm:w-auto text-center text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl sm:rounded-2xl transition-all border border-slate-200"
        >
          بازگشت
        </Link>
      </div>

      {/* فرم */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4">
        {/* ۱. نام کلید دسترسی */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            کلید دسترسی (System Name)
          </label>
          <input
            type="text"
            placeholder="users:read یا packages:write"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none transition-all text-sm text-left"
            dir="ltr"
          />
        </div>

        {/* ۲. ماژول */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            ماژول مربوطه (Module)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={
                AVAILABLE_MODULES.includes(formData.module)
                  ? formData.module
                  : "custom"
              }
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  setFormData({ ...formData, module: e.target.value });
                }
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none shrink-0"
            >
              {AVAILABLE_MODULES.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
              <option value="custom">سایر ماژول‌ها...</option>
            </select>

            <input
              type="text"
              placeholder="نام ماژول..."
              value={formData.module}
              onChange={(e) =>
                setFormData({ ...formData, module: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none transition-all text-sm text-left"
              dir="ltr"
            />
          </div>
        </div>

        {/* ۳. توضیحات */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            توضیحات (جهت نمایش به مدیر در ماتریکس دسترسی‌ها)
          </label>
          <input
            type="text"
            placeholder="مثال: اجازه مشاهده لیست کاربران سیستم"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none transition-all text-sm text-right"
          />
        </div>
      </div>

      {/* دکمه‌ها */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/dashboard/access-control/permissions"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all"
        >
          انصراف
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="text-white px-6 py-2.5 rounded-xl sm:rounded-2xl text-sm font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
          style={{ backgroundColor: "#85004E" }}
        >
          {loading
            ? "در حال ثبت..."
            : mode === "create"
            ? "ایجاد پرمیشن"
            : "اعمال تغییرات"}
        </button>
      </div>
    </form>
  );
};

export default PermissionFormComp;