import { NextResponse } from "next/server";
import connectDB from "lib/db";
import { Permission } from "models/Permission";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const { name, description, module } = body;

    // ۱. بررسی وجود پرمیشن در دیتابیس
    const currentPermission = await Permission.findById(id);
    if (!currentPermission) {
      return NextResponse.json(
        { message: "سطح دسترسی مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    // ۲. ولیدیشن فیلدهای اجباری
    if (!name || !module) {
      return NextResponse.json(
        { message: "نام دسترسی و ماژول الزامی هستند." },
        { status: 400 }
      );
    }

    const formattedName = name.toLowerCase().trim().replace(/\s+/g, "_");
    const formattedModule = module.toLowerCase().trim();

    // ۳. بررسی اینکه نام جدید با پرمیشن‌های دیگر تداخل نداشته باشد
    const duplicate = await Permission.findOne({
      name: formattedName,
      _id: { $ne: id }, // همه به جز خودش
    });
    
    if (duplicate) {
      return NextResponse.json(
        { message: `نام دسترسی "${formattedName}" توسط پرمیشن دیگری رزرو شده است.` },
        { status: 400 }
      );
    }

    // ۴. اعمال تغییرات و بروزرسانی
    currentPermission.name = formattedName;
    currentPermission.module = formattedModule;
    currentPermission.description = description?.trim() || "";

    await currentPermission.save();

    return NextResponse.json(
      { message: "تغییرات با موفقیت اعمال شد.", data: currentPermission },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating permission:", error);
    return NextResponse.json(
      { message: "خطایی در سرور رخ داده است.", error: error.message },
      { status: 500 }
    );
  }
}