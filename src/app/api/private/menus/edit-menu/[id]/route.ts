import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { title, price, guestCapacity, items } = body;

    // اعتبارسنحی اولیه داده‌ها
    if (!title || price === undefined) {
      return NextResponse.json(
        { success: false, message: "عنوان و قیمت منو الزامی است." },
        { status: 400 }
      );
    }

    // آپدیت سند منو
    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      {
        title,
        price,
        guestCapacity,
        items: Array.isArray(items) ? items : [],
      },
      { new: true, runValidators: true }
    );

    if (!updatedMenu) {
      return NextResponse.json(
        { success: false, message: "منوی مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "منو با موفقیت بروزرسانی شد.",
        data: updatedMenu,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور در ویرایش منو", error: error.message },
      { status: 500 }
    );
  }
}