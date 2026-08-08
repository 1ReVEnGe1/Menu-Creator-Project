"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RoleType {
  _id: string;
  name: string;
  description: string;
}

interface UserInitialDataType {
  _id?: string;
  fullname: string;
  phone: string;
  email?: string;
  role: string;
  isActive: boolean;
}

type UserFormCompProps = {
  allRoles: RoleType[];
  initialData?: UserInitialDataType;
  mode: "create" | "edit";
};

const UserFormComp = ({ allRoles, initialData, mode }: UserFormCompProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullname: initialData?.fullname || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی اولیه فرانت‌اند
    if (!formData.fullname.trim()) return alert("لطفاً نام و نام خانوادگی را وارد کنید.");
    if (!formData.phone.trim()) return alert("لطفاً شماره همراه را وارد کنید.");
    
    // ولیدیشن فرمت شماره موبایل ایران
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      return alert("لطفاً یک شماره همراه معتبر ۱۱ رقمی (مثل 09123456789) وارد کنید.");
    }

    if (!formData.role) return alert("لطفاً نقش کاربر را انتخاب کنید.");

    if (mode === "create" && !formData.password) {
      return alert("تعیین کلمه عبور برای کاربر جدید الزامی است.");
    }

    setLoading(true);

    try {
      const url =
        mode === "create"
          ? "/api/private/users/add-user"
          : `/api/private/users/edit-user/${initialData?._id}`;

      const method = mode === "create" ? "POST" : "PUT";

      // آماده‌سازی بدنه درخواست
      const payload: Record<string, any> = { ...formData };

      // اگر ایمیل خالی بود، کلاً آن را از روی کلید حذف کن تا در DB مقدار undefined بگیرد
      if (!payload.email || payload.email.trim() === "") {
        delete payload.email;
      }

      // در حالت ویرایش اگر کلمه عبور خالی بود آن را ارسال نکن
      if (mode === "edit" && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard/users");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "خطایی رخ داد.");
      }
    } catch (error) {
      console.error(error);
      alert("اتصال به سرور برقرار نشد.");
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
            {mode === "create"
              ? "ایجاد کاربر جدید"
              : `ویرایش حساب ${initialData?.fullname}`}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مشخصات فردی، شماره همراه و سطح دسترسی کاربر را مدیریت کنید.
          </p>
        </div>
        <Link
          href="/dashboard/users"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl transition-all"
        >
          بازگشت به لیست
        </Link>
      </div>

      {/* بخش اطلاعات اصلی کاربر */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* نام و نام خانوادگی */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            نام و نام خانوادگی <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="مثال: علی محمدی"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-right"
          />
        </div>

        {/* شماره همراه */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            شماره همراه <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="09123456789"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-left"
            dir="ltr"
          />
        </div>

        {/* ایمیل (اختیاری) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            آدرس ایمیل (اختیاری)
          </label>
          <input
            type="email"
            placeholder="example@domain.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-left"
            dir="ltr"
          />
        </div>

        {/* کلمه عبور */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            {mode === "edit"
              ? "کلمه عبور جدید (در صورت عدم تغییر خالی بگذارید)"
              : "کلمه عبور"}
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-left"
            dir="ltr"
          />
        </div>

        {/* انتخاب نقش */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            نقش کاربری <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm text-right bg-white"
          >
            <option value="">-- انتخاب نقش --</option>
            {allRoles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name} {role.description ? `(${role.description})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* وضعیت فعال / غیرفعال بودن کاربر */}
        <div className="md:col-span-2 pt-2 border-t border-slate-50 mt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
            />
            <div>
              <span className="text-xs font-bold text-slate-700 block">
                حساب کاربری فعال باشد
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                در صورت غیرفعال‌سازی، کاربر امکان ورود به سیستم را نخواهد داشت.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* دکمه‌های ثبت */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Link
          href="/dashboard/users"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all"
        >
          انصراف
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-md shadow-indigo-100"
        >
          {loading
            ? "در حال ثبت..."
            : mode === "create"
            ? "ذخیره و ایجاد کاربر"
            : "اعمال تغییرات"}
        </button>
      </div>
    </form>
  );
};

export default UserFormComp;