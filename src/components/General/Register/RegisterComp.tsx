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
    const fullname = formData.get("fullname") as string;
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
        body: JSON.stringify({ fullname, phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطایی در ثبت‌نام رخ داد");
      }

      // ۴. مدیریت هوشمند اولین کاربر (مدیر سیستم)
      if (data.isAdminCreated) {
        router.push("/login?registered=true&init=admin");
      } else {
        router.push("/login?registered=true");
      }
      
    } catch (err: any) {
      setError(err.message || "خطایی در برقراری ارتباط با سرور رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030204] text-[#f3edf2] antialiased selection:bg-[#85004E] selection:text-white dir-rtl relative overflow-x-hidden flex items-center justify-center p-4">
      {/* Liquid Organic Fluid Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[450px] h-[450px] bg-[#85004E]/30 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute top-[40%] -right-[20%] w-[380px] h-[380px] bg-[#b5006b]/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#50002e]/30 rounded-full blur-[150px]" />
      </div>

      {/* Main Glass Card Container */}
      <div className="w-full max-w-md space-y-6 rounded-[32px] bg-white/[0.03] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-2xl backdrop-saturate-200 relative z-10">
        
        {/* Top Glow Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* هدر */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">ایجاد حساب کاربری</h2>
          <p className="text-xs font-medium text-zinc-400">خوش آمدید! لطفاً اطلاعات خود را وارد کنید.</p>
        </div>

        {/* باکس خطا */}
        {error && (
          <div className="rounded-2xl bg-red-500/10 p-4 text-xs font-semibold text-red-300 border border-red-500/20 text-right backdrop-blur-md shadow-inner">
            {error}
          </div>
        )}

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          
          {/* فیلد نام و نام خانوادگی */}
          <div className="space-y-1.5">
            <label htmlFor="fullname" className="text-xs font-bold text-zinc-300 mr-1">
              نام و نام خانوادگی
            </label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              placeholder="نام و نام خانوادگی خود را وارد کنید"
              disabled={loading}
              className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-[#b5006b] focus:bg-white/[0.07] focus:shadow-[0_0_15px_rgba(181,0,107,0.3)] disabled:opacity-50"
            />
          </div>

          {/* فیلد شماره همراه */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-bold text-zinc-300 mr-1">
              شماره همراه
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="09123456789"
              dir="ltr"
              disabled={loading}
              className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-[#b5006b] focus:bg-white/[0.07] focus:shadow-[0_0_15px_rgba(181,0,107,0.3)] disabled:opacity-50 text-left"
            />
          </div>

          {/* فیلد رمز عبور */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-zinc-300 mr-1">
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              dir="ltr"
              placeholder="••••••••"
              disabled={loading}
              className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-[#b5006b] focus:bg-white/[0.07] focus:shadow-[0_0_15px_rgba(181,0,107,0.3)] disabled:opacity-50 text-left"
            />
          </div>

          {/* فیلد تکرار رمز عبور */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-300 mr-1">
              تکرار رمز عبور
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              dir="ltr"
              placeholder="••••••••"
              disabled={loading}
              className="w-full rounded-2xl bg-[#ffffff0a] border border-white/10 px-4 py-3.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-[#b5006b] focus:bg-white/[0.07] focus:shadow-[0_0_15px_rgba(181,0,107,0.3)] disabled:opacity-50 text-left"
            />
          </div>

          {/* دکمه سابمیت */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-[#85004E] via-[#b5006b] to-[#85004E] text-white text-xs font-black shadow-[0_10px_30px_rgba(133,0,78,0.5)] active:scale-[0.98] transition-all duration-300 border border-white/30 relative overflow-hidden disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
            {loading ? "در حال ثبت‌نام..." : "ثبت نام و ایجاد حساب"}
          </button>
        </form>

        {/* لینک به صفحه ورود */}
        <div className="text-center text-xs text-zinc-400 pt-2 border-t border-white/10">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="font-bold text-[#f4a1d5] hover:text-white transition-colors underline-offset-4 hover:underline">
            ورود به حساب
          </Link>
        </div>

      </div>
    </div>
  );
}