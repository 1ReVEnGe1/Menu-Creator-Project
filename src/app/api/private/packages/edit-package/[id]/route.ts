import connectDB from "lib/db";
import { Package } from "models/Package";
import { NextResponse } from "next/server";


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { title, category, slug, menus } = body;

    if (!title || !category) {
      return NextResponse.json(
        { success: false, message: "عنوان و دسته‌بندی پکیج الزامی است." },
        { status: 400 }
      );
    }

    // آپدیت سند پکیج
    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      {
        title,
        category,
        slug,
        menus: Array.isArray(menus) ? menus : [],
      },
      { new: true, runValidators: true }
    ).populate("menus"); // اگر نیاز به دریافت داده کامل منوها در پاسخ دارید

    if (!updatedPackage) {
      return NextResponse.json(
        { success: false, message: "پکیج مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "پکیج با موفقیت بروزرسانی شد.",
        data: updatedPackage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور در ویرایش پکیج", error: error.message },
      { status: 500 }
    );
  }
}