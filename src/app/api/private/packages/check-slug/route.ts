import connectDB from "lib/db";
import { Package } from "models/Package";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const currentId = searchParams.get("currentId");

    if (!slug) {
      return NextResponse.json({ isUnique: false, message: "Slug required" }, { status: 400 });
    }

    // بررسی وجود اسلاگ، با نادیده گرفتن آی‌دی فعلی در حالت ویرایش
    const existingPackage = await Package.findOne({
      slug,
      ...(currentId ? { _id: { $ne: currentId } } : {}),
    });

    return NextResponse.json({ isUnique: !existingPackage }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ isUnique: false, error: error.message }, { status: 500 });
  }
}