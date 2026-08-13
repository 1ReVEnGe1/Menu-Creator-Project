import { NextRequest, NextResponse } from "next/server";
import connectDB from "lib/db";
import User from "models/User";
import { auth } from "@/auth";


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    // ۱. بررسی لاگین بودن کاربر
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "احراز هویت انجام نشده است." },
        { status: 401 }
      );
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id; // فرضی: داشتن id کاربر در session
    const userRole = session.user.role;
    const userPermissions: string[] = session.user.permissions || [];

    // ۲. بررسی سطح دسترسی (SuperAdmin یا داشتن مجوز users:delete)
    const canDelete =
      userRole === "SUPER_ADMIN" || userPermissions.includes("users:delete");

    if (!canDelete) {
      return NextResponse.json(
        { success: false, message: "شما مجوز حذف کاربر را ندارید." },
        { status: 403 }
      );
    }

    // ۳. جلوگیری از حذف حساب جاری (Self-Deletion)
    if (currentUserId && currentUserId === targetUserId) {
      return NextResponse.json(
        { success: false, message: "شما نمی‌توانید حساب کاربری خودتان را حذف کنید." },
        { status: 400 }
      );
    }

    await connectDB();

    // ۴. یافتن و حذف کاربر
    const deletedUser = await User.findByIdAndDelete(targetUserId);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "کاربر مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "کاربر با موفقیت حذف شد." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور در حذف کاربر", error: error.message },
      { status: 500 }
    );
  }
}