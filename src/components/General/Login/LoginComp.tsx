"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginComp() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // استفاده از تایپ ترکیبی جدید ری‌اکت ۱۹ برای دوری از دپریکیشن
  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // خواندن بومی و فوق‌سریع داده‌ها از DOM
    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    // ولیدیشن اولیه در کلاینت
    if (!phone || !password) {
      setError("لطفا شماره همراه و رمز عبور را وارد کنید");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("خطایی در برقراری ارتباط با سرور رخ داد");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dir-rtl">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        {/* هدر */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            ورود به پنل مدیریت
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            خوش آمدید! لطفا اطلاعات خود را وارد کنید.
          </p>
        </div>

        {/* باکس خطا */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 text-right">
            {error}
          </div>
        )}

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {/* فیلد شماره همراه */}
          <div className="space-y-1">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
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

          {/* دکمه سابمیت */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-black py-3 font-medium text-white transition-all hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400"
          >
            {loading ? "در حال بررسی..." : "ورود به حساب کاربری"}
          </button>
        </form>

        {/* لینک به صفحه ورود */}
        <div className="text-center text-sm text-gray-500">
          قبلاً ثبت‌نام نکرده‌اید؟{" "}
          <Link
            href="/register"
            className="font-medium text-black hover:underline"
          >
            ثبت نام
          </Link>
        </div>
      </div>
    </div>
  );
}
