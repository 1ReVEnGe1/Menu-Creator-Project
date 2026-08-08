"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterComp() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // استفاده از تایپ SyntheticEvent دقیق ری‌آکت ۱۹
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // استخراج بومی و سریع داده‌ها از DOM
    const formData = new FormData(e.currentTarget);
    const fullname = formData.get("fullname") as string; // 👈 فیلد جدید
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // ۱. ولیدیشن پر کردن تمام فیلدها
    if (!fullname || !phone || !password || !confirmPassword) {
      setError("لطفاً تمام فیلدها را وارد کنید");
      setLoading(false);
      return;
    }

    // ولیدیشن فرمت شماره همراه ایران قبل از ارسال به سرور
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError("لطفاً یک شماره همراه معتبر (مثل 09123456789) وارد کنید");
      setLoading(false);
      return;
    }

    // ۲. ولیدیشن تطابق رمز عبور
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن با هم مطابقت ندارند");
      setLoading(false);
      return;
    }

    // ۳. ولیدیشن طول رمز عبور
    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      setLoading(false);
      return;
    }

    try {
      // ارسال داده‌ها به ای‌پ‌آی مسیر ساین‌آپ
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, phone, password }), // 👈 ارسال نام کامل به سرور
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطایی در ثبت‌نام رخ داد");
      }

      // ۴. مدیریت هوشمند اولین کاربر (مدیر سیستم)
      if (data.isAdminCreated) {
        // اگر اولین نفر بود، می‌توان او را مستقیماً با یک پرچم خاص به لاگین فرستاد تا پیام خوش‌آمدگویی ادمین ببیند
        router.push("/login?registered=true&init=admin");
      } else {
        // کاربران عادی بعدی
        router.push("/login?registered=true");
      }
      
    } catch (err: any) {
      setError(err.message || "خطایی در برقراری ارتباط با سرور رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dir-rtl">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        
        {/* هدر */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">ایجاد حساب کاربری</h2>
          <p className="mt-2 text-sm text-gray-500">خوش آمدید! لطفاً اطلاعات خود را وارد کنید.</p>
        </div>

        {/* باکس خطا */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 text-right">
            {error}
          </div>
        )}

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          
          {/* فیلد نام و نام خانوادگی */}
          <div className="space-y-1">
            <label htmlFor="fullname" className="text-sm font-medium text-gray-700">
              نام و نام خانوادگی
            </label>
            <input
              id="fullname"
              name="fullname" // 👈 کلید استخراج در FormData
              type="text"
              placeholder="نام و نام خانوادگی خود را وارد کنید"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-right placeholder-gray-400 outline-none transition-all focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50"
            />
          </div>

          {/* فیلد شماره همراه */}
          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              شماره همراه
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="09123456789"
              dir="ltr"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left placeholder-gray-400 outline-none transition-all focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50"
            />
          </div>

          {/* فیلد رمز عبور */}
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              dir="ltr"
              placeholder="••••••••"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left placeholder-gray-400 outline-none transition-all focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50"
            />
          </div>

          {/* فیلد تکرار رمز عبور */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              تکرار رمز عبور
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              dir="ltr"
              placeholder="••••••••"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left placeholder-gray-400 outline-none transition-all focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50"
            />
          </div>

          {/* دکمه سابمیت */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-black py-3 font-medium text-white transition-all hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400"
          >
            {loading ? "در حال ثبت‌نام..." : "ثبت نام و ایجاد حساب"}
          </button>
        </form>

        {/* لینک به صفحه ورود */}
        <div className="text-center text-sm text-gray-500">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="font-medium text-black hover:underline">
            ورود به حساب
          </Link>
        </div>

      </div>
    </div>
  );
}