import connectDB from "lib/db";
import { Role } from "models/Role";
import User from "models/User";
import { NextResponse } from "next/server";


export async function DELETE(
  _ : Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: roleId } = await params;

    const roleToDelete = await Role.findById(roleId);

    if (!roleToDelete) {
      return NextResponse.json(
        { message: "نقش مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    // ۱. عدم اجازه حذف نقش‌های سیستمی
    if (roleToDelete.isSystemRole) {
      return NextResponse.json(
        { message: "نقش‌های سیستمی قابل حذف نیستند." },
        { status: 400 }
      );
    }

    // ۲. بررسی تعداد کاربران دارای این نقش (Dependency Check)
    const assignedUsersCount = await User.countDocuments({ role: roleId });

    if (assignedUsersCount > 0) {
      return NextResponse.json(
        {
          message: `امکان حذف این نقش وجود ندارد. ${assignedUsersCount} کاربر فعال دارای این نقش هستند. ابتدا نقش آن‌ها را تغییر دهید.`,
          usersCount: assignedUsersCount,
        },
        { status: 409 } // کد ۴۰۹ برای Conflict در دیتابیس
      );
    }

    // ۳. حذف در صورت عدم وجود وابستگی
    await Role.findByIdAndDelete(roleId);

    return NextResponse.json(
      { message: "نقش با موفقیت حذف شد." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE Role:", error);
    return NextResponse.json(
      { message: "خطای سرور در حذف نقش" },
      { status: 500 }
    );
  }
}