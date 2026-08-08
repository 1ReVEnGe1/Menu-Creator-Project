import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const menus = await Menu.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: menus });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}