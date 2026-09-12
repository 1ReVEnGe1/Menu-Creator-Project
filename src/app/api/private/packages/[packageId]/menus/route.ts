import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { Package } from "models/Package";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { revalidatePackageCache } from "utils/revalidatePackageCache";
import { normalizeMenuPayload } from "utils/menuPayload";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      packageId: string;
    }>;
  }
) {
  let createdMenuId: mongoose.Types.ObjectId | null = null;

  try {
    await connectDB();

    const { packageId } = await params;

    if (
      !packageId ||
      !mongoose.Types.ObjectId.isValid(packageId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "شناسه پکیج معتبر نیست.",
        },
        { status: 400 }
      );
    }

    const pkg = await Package.findById(packageId)
      .select("_id slug menus")
      .lean();

    if (!pkg) {
      return NextResponse.json(
        {
          success: false,
          message: "پکیج مورد نظر یافت نشد.",
        },
        { status: 404 }
      );
    }

    const body = await req.json();

    /*
      این endpoint دو حالت دارد:
      1) ساخت یک Menu جدید و اتصال آن به همین Package
      2) اتصال یک Menu موجود با menuId (برای reuse بین Packageها)
    */
    if (
      typeof body?.menuId === "string" &&
      body.menuId.trim() !== ""
    ) {
      const menuId = body.menuId.trim();

      if (!mongoose.Types.ObjectId.isValid(menuId)) {
        return NextResponse.json(
          {
            success: false,
            message: "شناسه منو معتبر نیست.",
          },
          { status: 400 }
        );
      }

      const existingMenu = await Menu.findById(menuId);

      if (!existingMenu) {
        return NextResponse.json(
          {
            success: false,
            message: "منوی مورد نظر یافت نشد.",
          },
          { status: 404 }
        );
      }

      await Package.updateOne(
        { _id: packageId },
        { $addToSet: { menus: existingMenu._id } }
      );

    revalidatePackageCache(pkg.slug);

      return NextResponse.json(
        {
          success: true,
          message: "منو به پکیج متصل شد.",
          data: existingMenu,
        },
        { status: 200 }
      );
    }

    const normalized = normalizeMenuPayload(body);

    if (!normalized.success) {
      return NextResponse.json(
        {
          success: false,
          message: normalized.error,
        },
        { status: 400 }
      );
    }

    const newMenu = await Menu.create(normalized.data);
    createdMenuId = newMenu._id;

    const attachResult = await Package.updateOne(
      { _id: packageId },
      { $addToSet: { menus: newMenu._id } }
    );

    if (attachResult.matchedCount !== 1) {
      await Menu.deleteOne({ _id: newMenu._id });
      createdMenuId = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "پکیج هنگام اتصال منو پیدا نشد. منوی ساخته‌شده rollback شد.",
        },
        { status: 404 }
      );
    }

    createdMenuId = null;

    revalidatePackageCache(pkg.slug);

    return NextResponse.json(
      {
        success: true,
        message: "منو با موفقیت ساخته و به پکیج متصل شد.",
        data: newMenu,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (createdMenuId) {
      try {
        await Menu.deleteOne({ _id: createdMenuId });
      } catch (rollbackError) {
        console.error(
          "Failed to rollback menu creation:",
          rollbackError
        );
      }
    }

    console.error(
      "Error creating package-scoped menu:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "خطای سرور در ساخت منو",
      },
      { status: 500 }
    );
  }
}
