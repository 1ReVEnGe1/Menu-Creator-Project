import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import connectDB from "lib/db";
import User from "models/User";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: userId } = await params;
    const body = await req.json();

    const { fullname, phone, email, password, role, isActive } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "کاربر مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    // ۱. بررسی یکتا بودن شماره همراه
    if (phone !== user.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return NextResponse.json(
          { message: "این شماره همراه قبلاً توسط کاربر دیگری ثبت شده است." },
          { status: 400 }
        );
      }
    }

    // ۲. بررسی یکتا بودن ایمیل (تنها در صورتی که ایمیل ارسال شده باشد)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return NextResponse.json(
          { message: "این ایمیل قبلاً توسط کاربر دیگری ثبت شده است." },
          { status: 400 }
        );
      }
    }

    // به‌روزرسانی فیلدها
    user.fullname = fullname;
    user.phone = phone;
    user.email = email || undefined; // جهت سازگاری با sparse index مونیگوز
    user.role = role;
    user.isActive = isActive;

    // تنها در صورت ارسال کلمه عبور جدید، آن را هش کن
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    return NextResponse.json(
      { message: "اطلاعات کاربر با موفقیت به‌روزرسانی شد." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in PUT Edit User:", error);
    
    // مدیریت خطای تکراری بودن در سطح دیتابیس (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = field === "phone" 
        ? "شماره همراه تکراری است." 
        : "ایمیل تکراری است.";
      return NextResponse.json({ message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "خطای سرور در ویرایش کاربر" },
      { status: 500 }
    );
  }
}