import connectDB from "lib/db";
import { Package } from "models/Package";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { revalidatePackageCache } from "utils/revalidatePackageCache";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "شناسه پکیج معتبر نیست.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, category, slug } = body ?? {};

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "عنوان پکیج الزامی است.",
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
          message: "دسته‌بندی پکیج معتبر نیست.",
        },
        { status: 400 }
      );
    }

    const currentPackage = await Package.findById(id)
      .select("_id slug")
      .lean();

    if (!currentPackage) {
      return NextResponse.json(
        {
          success: false,
          message: "پکیج مورد نظر یافت نشد.",
        },
        { status: 404 }
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
          message: "اسلاگ پکیج الزامی است.",
        },
        { status: 400 }
      );
    }

    const duplicateSlug = await Package.findOne({
      slug: cleanSlug,
      _id: { $ne: id },
    })
      .select("_id")
      .lean();

    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "این اسلاگ قبلاً استفاده شده است.",
        },
        { status: 409 }
      );
    }

    /*
      مهم: menus عمداً در این endpoint خوانده یا نوشته نمی‌شود.
      تغییر relation فقط از routeهای package-scoped منو انجام می‌شود.
    */
    const updatedPackage =
      await Package.findByIdAndUpdate(
        id,
        {
          title: title.trim(),
          category,
          slug: cleanSlug,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      ).populate("menus");

    if (!updatedPackage) {
      return NextResponse.json(
        {
          success: false,
          message: "پکیج مورد نظر یافت نشد.",
        },
        { status: 404 }
      );
    }

    revalidatePackageCache(currentPackage.slug, cleanSlug);

    return NextResponse.json(
      {
        success: true,
        message:
          "مشخصات پکیج با موفقیت بروزرسانی شد.",
        data: updatedPackage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating package:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "این اسلاگ قبلاً استفاده شده است.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "خطای سرور در ویرایش پکیج",
        error:
          error?.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
}
