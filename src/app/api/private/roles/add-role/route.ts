import { NextResponse } from "next/server";
import connectDB from "lib/db";
import { Role } from "models/Role";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    // ⚡ اضافه کردن isSystemRole به مخازن ورودی
    const { name, description, permissions, isSystemRole } = body;

    // ۱. ولیدیشن فیلدهای اجباری
    if (!name) {
      return NextResponse.json(
        { message: "نام نقش الزامی است." },
        { status: 400 }
      );
    }

    // ۲. بررسی تکراری نبودن نام نقش
    const sanitizedName = name.toUpperCase().replace(/\s+/g, "_");
    const existingRole = await Role.findOne({ name: sanitizedName });
    
    if (existingRole) {
      return NextResponse.json(
        { message: "نقشی با این نام قبلاً در سیستم ثبت شده است." },
        { status: 400 }
      );
    }

    // ۳. 🔒 گارد امنیتی برای نقش‌های سیستمی
    let finalIsSystemRole = false;
    
    if (isSystemRole === true) {
      
      const isUserSuperAdmin = true; // این متغیر را بر اساس سیستم احراز هویت خودت مقداردهی کن
      
      if (!isUserSuperAdmin) {
        return NextResponse.json(
          { message: "شما سطح دسترسی لازم برای ایجاد نقش سیستمی را ندارید." },
          { status: 403 }
        );
      }
      finalIsSystemRole = true;
    }

    // ۴. ایجاد نقش جدید در دیتابیس
    const newRole = await Role.create({
      name: sanitizedName,
      description: description || "",
      permissions: permissions || [],
      isSystemRole: finalIsSystemRole, // ⚡ اعمال مقدار تایید شده
    });

    return NextResponse.json(
      { message: "نقش جدید با موفقیت ایجاد شد.", data: newRole },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { message: "خطایی در سرور رخ داده است.", error: error.message },
      { status: 500 }
    );
  }
}