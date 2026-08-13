import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import connectDB from "lib/db";
import { Permission } from "models/Permission";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ۱. بررسی احراز هویت و سطوح دسترسی کاربر
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "احراز هویت انجام نشده است." },
        { status: 401 }
      );
    }

    const userRole = session.user.role;
    const userPermissions: string[] = session.user.permissions || [];

    // بررسی مجوز: فقط SUPER_ADMIN یا کاربری که دسترسی مدیریت پرمیشن‌ها را دارد
    const canDeletePermission =
      userRole === "SUPER_ADMIN" ||
      userPermissions.includes("permissions:delete") ||
      userPermissions.includes("access_control:manage");

    if (!canDeletePermission) {
      return NextResponse.json(
        { success: false, message: "شما مجوز حذف سطح دسترسی را ندارید." },
        { status: 403 }
      );
    }

    // ۲. استخراج و اعتبارسنجی ID ارسال شده
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "شناسه (ID) پرمیشن معتبر نیست." },
        { status: 400 }
      );
    }

    // ۳. اتصال به دیتابیس
    await connectDB();

    // ۴. یافتن و حذف پرمیشن
    const deletedPermission = await Permission.findByIdAndDelete(id);

    if (!deletedPermission) {
      return NextResponse.json(
        { success: false, message: "سطح دسترسی مورد نظر یافت نشد یا قبلاً حذف شده است." },
        { status: 404 }
      );
    }

    // ۵. بازگرداندن پاسخ موفقیت‌آمیز
    return NextResponse.json(
      {
        success: true,
        message: `سطح دسترسی "${deletedPermission.name}" با موفقیت حذف شد.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Permission Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "خطای سرور در هنگام حذف سطح دسترسی.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}