import connectDB from "lib/db";
import { Package } from "models/Package";
import { Menu } from "models/Menu"; // ایمپورت معمولی
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    
    // مشخص کردن دقیق مدل در متد populate
    const packages = await Package.find({}).populate({
      path: "menus",
      model: Menu, // یا اسم رشته‌ای "Menu" در صورتی که بالا ایمپورت شده باشد
    });

    return NextResponse.json({ packages }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}