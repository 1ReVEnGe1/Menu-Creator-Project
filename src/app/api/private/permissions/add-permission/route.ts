import { NextResponse } from "next/server";

import { Permission } from "models/Permission";
import connectDB from "lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, description, module } = body;

    // ۱. ولیدیشن فیلدهای اجباری
    if (!name || !module) {
      return NextResponse.json(
        { message: "نام دسترسی و ماژول الزامی هستند." },
        { status: 400 }
      );
    }

    // ۲. استانداردسازی نام پرمیشن (تبدیل به حروف کوچک، حذف فاصله‌ها و فرمت module:action)
    const formattedName = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_"); // تبدیل فاصله‌ها به اسنیک‌کیس در صورت وجود

    const formattedModule = module.toLowerCase().trim();

    // ۳. بررسی تکراری نبودن نام پرمیشن
    const exists = await Permission.findOne({ name: formattedName });
    if (exists) {
      return NextResponse.json(
        { message: `دسترسی با نام "${formattedName}" قبلاً ثبت شده است.` },
        { status: 400 }
      );
    }

    // ۴. ذخیره در دیتابیس
    const newPermission = await Permission.create({
      name: formattedName,
      description: description?.trim() || "",
      module: formattedModule,
    });

    return NextResponse.json(
      { message: "سطح دسترسی با موفقیت ایجاد شد.", data: newPermission },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating permission:", error);
    return NextResponse.json(
      { message: "خطایی در سرور رخ داده است.", error: error.message },
      { status: 500 }
    );
  }
}