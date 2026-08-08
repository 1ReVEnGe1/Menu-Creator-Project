import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { title, price, guestCapacity, items } = body;

    // اعتبارسنجی اولیه داده‌های ورودی
    if (!title || price === undefined || !guestCapacity) {
      return NextResponse.json(
        { success: false, error: 'لطفاً تمامی فیلدهای الزامی منو را وارد کنید.' },
        { status: 400 }
      );
    }

    const newMenu = await Menu.create({
      title,
      price: price,
      guestCapacity,
      items: Array.isArray(items) ? items : [],
    });

    return NextResponse.json({ success: true, data: newMenu }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}