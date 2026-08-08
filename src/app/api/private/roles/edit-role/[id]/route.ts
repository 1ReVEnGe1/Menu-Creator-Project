import { NextResponse } from "next/server";
import connectDB from "lib/db";
import { Role } from "models/Role";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const id = (await params).id;
    const body = await req.json();
    // ⚡ اضافه کردن isSystemRole به ورودی‌ها
    const { name, description, permissions, isSystemRole } = body;

    // ۱. پیدا کردن نقش فعلی
    const currentRole = await Role.findById(id);
    if (!currentRole) {
      return NextResponse.json(
        { message: "نقش مورد نظر یافت نشد." },
        { status: 404 },
      );
    }

    // ۲. پردازش و هماهنگ‌سازی نام نقش
    const sanitizedName = name.toUpperCase().replace(/\s+/g, "_");

    // ۳. بررسی تغییر نام نقش‌های سیستمی
    if (currentRole.isSystemRole && currentRole.name !== sanitizedName) {
      return NextResponse.json(
        { message: "امکان تغییر نام انگلیسی نقش‌های سیستمی وجود ندارد." },
        { status: 403 },
      );
    }

    // ۴. 🔒 کنترل فیلد isSystemRole در لایه بک‌اَند
    const isUserSuperAdmin = true; // این متغیر را بر اساس سیستم احراز هویت خودت دوقطبی کن (true/false)

    if (currentRole.isSystemRole) {
      // اگر نقش از قبل سیستمی بوده، به هیچ وجه اجازه نده به حالت غیرسیستمی تغییر کند
      if (isSystemRole === false) {
        return NextResponse.json(
          { message: "امکان خارج کردن این نقش از حالت سیستمی وجود ندارد." },
          { status: 403 },
        );
      }
    } else {
      // اگر نقش معمولی بوده و الان درخواست شده که سیستمی شود، حتماً باید سوپر ادمین باشد
      if (isSystemRole === true && !isUserSuperAdmin) {
        return NextResponse.json(
          { message: "شما اجازه تبدیل این نقش به یک نقش سیستمی را ندارید." },
          { status: 403 },
        );
      }
    }

    // ۵. بررسی تکراری نبودن نام جدید (به جز آیدی فعلی خودش)
    const duplicateRole = await Role.findOne({
      name: sanitizedName,
      _id: { $ne: id },
    });

    if (duplicateRole) {
      return NextResponse.json(
        { message: "این نام نقش قبلاً به نقش دیگری تخصیص داده شده است." },
        { status: 400 },
      );
    }

    // ۶. اعمال تغییرات در دیتابیس
    currentRole.name = sanitizedName;
    currentRole.description = description || "";
    currentRole.permissions = permissions || [];

    // اگر کاربر سوپر ادمین بود و نقش قبلاً سیستمی نبوده، اجازه تغییر وضعیت داده می‌شود
    if (isUserSuperAdmin && !currentRole.isSystemRole) {
      currentRole.isSystemRole = isSystemRole || false;
    }

    await currentRole.save();

    return NextResponse.json(
      { message: "تغییرات نقش با موفقیت اعمال شد.", data: currentRole },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { message: "خطایی در سرور رخ داده است.", error: error.message },
      { status: 500 },
    );
  }
}
