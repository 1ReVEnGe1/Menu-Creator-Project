import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { Package } from "models/Package";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { revalidatePackageCache } from "utils/revalidatePackageCache";
import { normalizeMenuPayload } from "utils/menuPayload";

function validateIds(
  packageId: string,
  menuId: string
) {
  if (
    !packageId ||
    !mongoose.Types.ObjectId.isValid(packageId)
  ) {
    return "شناسه پکیج معتبر نیست.";
  }

  if (
    !menuId ||
    !mongoose.Types.ObjectId.isValid(menuId)
  ) {
    return "شناسه منو معتبر نیست.";
  }

  return null;
}


export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      packageId: string;
      menuId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { packageId, menuId } = await params;
    const idError = validateIds(packageId, menuId);

    if (idError) {
      return NextResponse.json(
        { success: false, message: idError },
        { status: 400 }
      );
    }

    const pkg = await Package.findOne({
      _id: packageId,
      menus: menuId,
    })
      .select("_id")
      .lean();

    if (!pkg) {
      return NextResponse.json(
        {
          success: false,
          message:
            "این منو به پکیج مورد نظر متصل نیست یا پکیج وجود ندارد.",
        },
        { status: 404 }
      );
    }

    const menu = await Menu.findById(menuId).lean();

    if (!menu) {
      return NextResponse.json(
        { success: false, message: "منوی مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: menu },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error reading package-scoped menu:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "خطای سرور در دریافت منو",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      packageId: string;
      menuId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { packageId, menuId } = await params;
    const idError = validateIds(packageId, menuId);

    if (idError) {
      return NextResponse.json(
        { success: false, message: idError },
        { status: 400 }
      );
    }

    const pkg = await Package.findOne({
      _id: packageId,
      menus: menuId,
    })
      .select("_id slug")
      .lean();

    if (!pkg) {
      return NextResponse.json(
        {
          success: false,
          message:
            "این منو به پکیج مورد نظر متصل نیست یا پکیج وجود ندارد.",
        },
        { status: 404 }
      );
    }

    const body = await req.json();
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

    const updatedMenu = await Menu.findByIdAndUpdate(
      menuId,
      normalized.data,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedMenu) {
      return NextResponse.json(
        {
          success: false,
          message: "منوی مورد نظر یافت نشد.",
        },
        { status: 404 }
      );
    }

    revalidatePackageCache(pkg.slug);

    return NextResponse.json(
      {
        success: true,
        message: "منو با موفقیت بروزرسانی شد.",
        data: updatedMenu,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Error updating package-scoped menu:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "خطای سرور در ویرایش منو",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      packageId: string;
      menuId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { packageId, menuId } = await params;
    const idError = validateIds(packageId, menuId);

    if (idError) {
      return NextResponse.json(
        { success: false, message: idError },
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

    const isAttached = pkg.menus.some(
      (id) => String(id) === menuId
    );

    if (!isAttached) {
      return NextResponse.json(
        {
          success: false,
          message:
            "این منو در پکیج مورد نظر وجود ندارد.",
        },
        { status: 404 }
      );
    }

    if (pkg.menus.length <= 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "پکیج باید حداقل یک منو داشته باشد؛ آخرین منو قابل حذف از پکیج نیست.",
        },
        { status: 400 }
      );
    }

    await Package.updateOne(
      { _id: packageId },
      { $pull: { menus: menuId } }
    );

    /*
      خود Menu document عمداً حذف نمی‌شود.
      چون ممکن است همین Menu در Package دیگری هم استفاده شود.
    */

    revalidatePackageCache(pkg.slug);

    return NextResponse.json(
      {
        success: true,
        message:
          "منو فقط از این پکیج جدا شد و خود منو حذف نشد.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Error unlinking menu from package:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "خطای سرور در حذف منو از پکیج",
      },
      { status: 500 }
    );
  }
}
