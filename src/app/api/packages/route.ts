import connectDB from "lib/db";
import { Package } from "models/Package";
import { Menu } from "models/Menu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const packages = await Package.find({}).populate("menus");
    return NextResponse.json({ packages }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در دریافت داده‌ها" },
      { status: 500 },
    );
  }
}
