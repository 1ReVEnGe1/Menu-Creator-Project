import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { Package } from "models/Package";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // پیدا کردن پکیج جهت دسترسی به لیست آی‌دی منوهای آن
    const pkg = await Package.findById(id);

    if (!pkg) {
      return NextResponse.json(
        { success: false, message: "پکیج مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    // ۱. حذف تمامی منوهای زیرمجموعه مرتبط با این پکیج
    if (pkg.menus && pkg.menus.length > 0) {
      await Menu.deleteMany({ _id: { $in: pkg.menus } });
    }

    // ۲. حذف خود پکیج
    await Package.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "پکیج و تمام منوهای زیرمجموعه آن با موفقیت حذف شدند.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete package error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور در حذف پکیج", error: error.message },
      { status: 500 }
    );
  }
}