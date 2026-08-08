import connectDB from "lib/db";
import { Package } from "models/Package";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { title, category, slug, menus } = body;

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'عنوان و نوع پکیج الزامی است.' },
        { status: 400 }
      );
    }

    // ساخت اسلاگ یکتا در صورت عدم ارسال
    const generatedSlug =
      slug || title.toLowerCase().trim().replace(/\s+/g, '-');

    const newPackage = await Package.create({
      title,
      category,
      slug: generatedSlug,
      menus: Array.isArray(menus) ? menus : [],
    });

    // دریافت نسخه کامل به همراه populate جهت بازگرداندن به فرانت
    const populatedPackage = await Package.findById(newPackage._id).populate('menus');

    return NextResponse.json(
      { success: true, data: populatedPackage },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}