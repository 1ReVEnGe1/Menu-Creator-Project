import connectDB from "lib/db";
import { Package } from "models/Package";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePackageCache } from "utils/revalidatePackageCache";

export async function DELETE(
  _req: NextRequest,
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

    const pkg = await Package.findById(id)
      .select("_id title slug")
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

    /*
      Menuها حذف نمی‌شوند.
      یک Menu می‌تواند همزمان در چند Package استفاده شود،
      بنابراین حذف Package نباید داده مشترک را از بین ببرد.
    */
    await Package.findByIdAndDelete(id);

    revalidatePackageCache(pkg.slug);

    return NextResponse.json(
      {
        success: true,
        message:
          "پکیج حذف شد. منوهای آن برای جلوگیری از حذف داده مشترک حفظ شدند.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete package error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطای سرور در حذف پکیج",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
