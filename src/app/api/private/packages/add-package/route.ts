import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { Package } from "models/Package";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { revalidatePackageCache } from "utils/revalidatePackageCache";
import { normalizeMenuPayload } from "utils/menuPayload";

export async function POST(req: Request) {
  let createdMenuId: mongoose.Types.ObjectId | null = null;

  try {
    await connectDB();

    const body = await req.json();
    const { title, category, slug, menu } = body ?? {};

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "عنوان پکیج الزامی است.",
        },
        { status: 400 }
      );
    }

    if (
      category !== "general-menu" &&
      category !== "sub-services-menu"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "نوع پکیج معتبر نیست.",
        },
        { status: 400 }
      );
    }

    const cleanSlug =
      typeof slug === "string"
        ? slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "")
        : "";

    if (!cleanSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "اسلاگ پکیج الزامی است.",
        },
        { status: 400 }
      );
    }

    const existingSlug = await Package.findOne({
      slug: cleanSlug,
    })
      .select("_id")
      .lean();

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error:
            "این اسلاگ قبلاً استفاده شده است.",
        },
        { status: 409 }
      );
    }

    /*
      اولین Menu همراه Package ساخته می‌شود تا اولین Save هم
      تک‌منویی باشد و Package خالی / Menu orphan تولید نشود.
    */
    const normalized = normalizeMenuPayload(menu);

    if (!normalized.success) {
      return NextResponse.json(
        {
          success: false,
          error: normalized.error,
        },
        { status: 400 }
      );
    }

    const newMenu = await Menu.create(normalized.data);
    createdMenuId = newMenu._id;

    const newPackage = await Package.create({
      title: title.trim(),
      category,
      slug: cleanSlug,
      menus: [newMenu._id],
    });

    /* Package ساخته شد؛ دیگر rollback مربوط به Menu لازم نیست. */
    createdMenuId = null;

    const populatedPackage = await Package.findById(
      newPackage._id
    ).populate("menus");

    revalidatePackageCache(cleanSlug);

    return NextResponse.json(
      {
        success: true,
        data: populatedPackage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (createdMenuId) {
      try {
        await Menu.deleteOne({ _id: createdMenuId });
      } catch (rollbackError) {
        console.error(
          "Failed to rollback first menu:",
          rollbackError
        );
      }
    }

    console.error("Error creating package:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "این اسلاگ قبلاً استفاده شده است.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message || "خطا در ساخت پکیج",
      },
      { status: 500 }
    );
  }
}
