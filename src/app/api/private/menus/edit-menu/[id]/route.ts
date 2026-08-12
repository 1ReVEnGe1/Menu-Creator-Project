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

    const { title, price, guestCapacity, items, description } = body;

    // اعتبارسنجی اولیه
    if (!title?.trim() || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, message: "عنوان و قیمت منو الزامی است." },
        { status: 400 }
      );
    }

    // تمیزسازی آرایه آیتم‌ها
    const formattedItems = Array.isArray(items)
      ? items
          .filter((item: any) => item && typeof item.title === "string" && item.title.trim() !== "")
          .map((item: any) => ({
            title: item.title.trim(),
            description: typeof item.description === "string" ? item.description.trim() : "",
          }))
      : [];

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        price: String(price).trim(),
        guestCapacity: typeof guestCapacity === "string" ? guestCapacity.trim() : "",
        items: formattedItems,
        description: typeof description === "string" ? description.trim() : "",
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