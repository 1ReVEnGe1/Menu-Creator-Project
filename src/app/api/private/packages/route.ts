import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { Package } from "models/Package";
import { NextResponse } from "next/server";

// دریافت لیست پکیج‌ها به همراه منوهای متصل شده
export async function GET() {
  try {
    await connectDB();
    
    const packages = await Package.find({})
      .populate({
        path : "menus",
        model : Menu
      }) // جایگزین کردن ObjectId با شیء کامل Menu
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, data: packages });
  } catch (error: any) {
    console.log(error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}