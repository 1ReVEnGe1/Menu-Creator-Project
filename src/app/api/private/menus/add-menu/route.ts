import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { title, pricingTiers, items, description } = body;

    // اعتبارسنجی فیلدهای اصلی
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: "لطفاً عنوان منو را وارد کنید." },
        { status: 400 }
      );
    }

    // اعتبارسنجی و تمیزسازی پله‌های قیمت [{ guestCapacity, price }]
    const formattedTiers = Array.isArray(pricingTiers)
      ? pricingTiers
          .filter(
            (tier: any) =>
              tier &&
              (typeof tier.guestCapacity === "string" || typeof tier.price === "string")
          )
          .map((tier: any) => ({
            guestCapacity: typeof tier.guestCapacity === "string" ? tier.guestCapacity.trim() : "",
            price: typeof tier.price === "string" ? tier.price.trim() : "",
          }))
      : [];

    // اعتبارسنجی و تمیزسازی ساختار آیتم‌ها [{ title, description }]
    const formattedItems = Array.isArray(items)
      ? items
          .filter(
            (item: any) =>
              item && typeof item.title === "string" && item.title.trim() !== ""
          )
          .map((item: any) => ({
            title: item.title.trim(),
            description:
              typeof item.description === "string" ? item.description.trim() : "",
          }))
      : [];

    const newMenu = await Menu.create({
      title: title.trim(),
      pricingTiers: formattedTiers,
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