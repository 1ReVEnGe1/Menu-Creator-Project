import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import connectDB from "lib/db";
import User from "models/User";
import { Role } from "models/Role";

export async function POST(req: Request) {
  try {
    // ۱. اتصال به دیتابیس
    await connectDB();

    // ۲. دریافت اطلاعات از بدنه درخواست
    const { fullname, phone, password } = await req.json();

    // ۳. ولیدیشن‌های سمت سرور
    if (!fullname || !phone || !password) {
      return NextResponse.json(
        { message: "لطفاً تمامی فیلدهای اجباری را وارد کنید" },
        { status: 400 }
      );
    }

    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: "لطفاً یک شماره همراه معتبر وارد کنید" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    // ۴. بررسی تکراری نبودن شماره همراه
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json(
        { message: "این شماره همراه قبلاً در سیستم ثبت شده است" },
        { status: 409 }
      );
    }

    // ۵. ⚡ هسته منطق جدید: چک کردن اینکه آیا اولین کاربر سیستم است؟
    const isFirstUser = (await User.countDocuments()) === 0;
    
    let assignedRole;

    if (isFirstUser) {
      // اگر اولین نفر است، نقش SUPER_ADMIN (یا ADMIN) اختصاص داده می‌شود
      assignedRole = await Role.findOne({ name: "SUPER_ADMIN" });
      
      if (!assignedRole) {
        assignedRole = await Role.create({
          name: "SUPER_ADMIN",
          description: "مدیر ارشد و توسعه‌دهنده سیستم با دسترسی کامل",
          permissions: [], // بعداً در پنل ادمین پرسپکتیو مجوزها کامل می‌شود
          isSystemRole: true,
        });
      }
    } else {
      // اگر اولین نفر نیست، نقش معمولی USER اختصاص داده می‌شود
      assignedRole = await Role.findOne({ name: "USER" });
      
      if (!assignedRole) {
        assignedRole = await Role.create({
          name: "USER",
          description: "نقش پیش‌فرض کاربران ثبت‌نامی",
          permissions: [],
          isSystemRole: true,
        });
      }
    }

    // ۶. امن‌سازی پسورد
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ۷. ایجاد سند کاربر در MongoDB
    await User.create({
      fullname,
      phone,
      password: hashedPassword,
      role: assignedRole._id,
      isActive: true,
    });

    return NextResponse.json(
      { 
        message: "ثبت‌نام با موفقیت انجام شد",
        isAdminCreated: isFirstUser // یک پرچم اختیاری برای مانیتورینگ فرانت‌اند
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Register API Error: ", error);
    return NextResponse.json(
      { message: "خطایی در سمت سرور رخ داده است" },
      { status: 500 }
    );
  }
}