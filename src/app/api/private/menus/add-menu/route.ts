import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { title, price, guestCapacity, items, description } = body;

    // اعتبارسنجی فیلدهای اصلی
    if (!title?.trim() || price === undefined || price === null || !guestCapacity?.trim()) {
      return NextResponse.json(
        { success: false, error: "لطفاً تمامی فیلدهای الزامی (عنوان، قیمت و ظرفیت) را وارد کنید." },
        { status: 400 }
      );
    }

    // اعتبارسنجی و تمیزسازی ساختار جدید آیتم‌ها [{ title, description }]
    const formattedItems = Array.isArray(items)
      ? items
          .filter((item: any) => item && typeof item.title === "string" && item.title.trim() !== "")
          .map((item: any) => ({
            title: item.title.trim(),
            description: typeof item.description === "string" ? item.description.trim() : "",
          }))
      : [];

    const newMenu = await Menu.create({
      title: title.trim(),
      price: String(price).trim(),
      guestCapacity: guestCapacity.trim(),
      items: formattedItems,
      description: typeof description === "string" ? description.trim() : "",
    });

    return NextResponse.json({ success: true, data: newMenu }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { success: false, error: error.message || "خطا در ثبت منو" },
      { status: 400 }
    );
  }
}