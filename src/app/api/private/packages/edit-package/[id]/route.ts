import connectDB from "lib/db";
import { Package } from "models/Package";
import { Menu } from "models/Menu";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import mongoose from "mongoose";

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

    // =====================================================
    // PACKAGE ID
    // =====================================================

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "شناسه پکیج معتبر نیست.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await req.json();

    const {
      title,
      category,
      slug,
      menus,
    } = body ?? {};

    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "عنوان پکیج الزامی است.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      category !== "general-menu" &&
      category !==
        "sub-services-menu"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "دسته‌بندی پکیج معتبر نیست.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // PACKAGE EXISTS?
    // =====================================================

    const currentPackage =
      await Package.findById(id)
        .select("_id menus slug")
        .lean();

    if (!currentPackage) {
      return NextResponse.json(
        {
          success: false,
          message:
            "پکیج مورد نظر یافت نشد.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // SLUG
    // =====================================================

    const cleanSlug =
      typeof slug === "string"
        ? slug
            .trim()
            .toLowerCase()
            .replace(
              /[^a-z0-9-]/g,
              "-"
            )
            .replace(/-+/g, "-")
            .replace(
              /^-+|-+$/g,
              ""
            )
        : "";

    if (!cleanSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "اسلاگ پکیج الزامی است.",
        },
        {
          status: 400,
        }
      );
    }

    const duplicateSlug =
      await Package.findOne({
        slug: cleanSlug,

        _id: {
          $ne: id,
        },
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
        {
          status: 409,
        }
      );
    }

    // =====================================================
    // MENUS — VERY IMPORTANT
    // =====================================================

    /*
      قبلاً:
      
      menus: Array.isArray(menus)
        ? menus
        : []

      داشتیم.

      این یعنی request خراب می‌توانست
      تمام referenceها را پاک کند.

      دیگر اجازه این رفتار را نمی‌دهیم.
    */

    if (!Array.isArray(menus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "لیست منوهای پکیج ارسال نشده یا معتبر نیست. بروزرسانی متوقف شد.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      UI تو اجازه نمی‌دهد Package
      بدون Menu داشته باشیم.

      بنابراین [] را هم قبول نمی‌کنیم.
    */
    if (menus.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "پکیج نمی‌تواند بدون منو ذخیره شود. بروزرسانی متوقف شد.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedMenuIds = [
      ...new Set(
        menus.map((menuId: any) =>
          String(menuId)
        )
      ),
    ];

    // Duplicate ID
    if (
      normalizedMenuIds.length !==
      menus.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "شناسه تکراری در لیست منوهای پکیج وجود دارد.",
        },
        {
          status: 400,
        }
      );
    }

    // ObjectId validation
    const allIdsValid =
      normalizedMenuIds.every(
        (menuId) =>
          mongoose.Types.ObjectId.isValid(
            menuId
          )
      );

    if (!allIdsValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "یک یا چند شناسه منو معتبر نیست. بروزرسانی انجام نشد.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // MAKE SURE ALL MENUS REALLY EXIST
    // =====================================================

    const existingMenusCount =
      await Menu.countDocuments({
        _id: {
          $in: normalizedMenuIds,
        },
      });

    if (
      existingMenusCount !==
      normalizedMenuIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "یک یا چند منوی ارسالی در دیتابیس وجود ندارد. بروزرسانی پکیج متوقف شد.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // IMPORTANT SAFETY CHECK
    // =====================================================

    /*
      این check از حالت‌هایی جلوگیری می‌کند که
      به علت failure تصادفی frontend،
      ناگهان تعداد زیادی Menu از Package حذف شوند.

      اما حذف آگاهانه یک Menu از UI باید همچنان ممکن باشد.

      بنابراین فعلاً صرفاً صحت IDها را چک می‌کنیم
      و array معتبر را ذخیره می‌کنیم.

      بعداً اگر Versioning اضافه کردی،
      می‌توانیم حفاظت قوی‌تر هم اضافه کنیم.
    */

    // =====================================================
    // UPDATE
    // =====================================================

    const updatedPackage =
      await Package.findByIdAndUpdate(
        id,
        {
          title: title.trim(),

          category,

          slug: cleanSlug,

          menus:
            normalizedMenuIds,
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
          message:
            "پکیج مورد نظر یافت نشد.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // CACHE
    // =====================================================

    revalidateTag(
      "public-packages",
      "max"
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "پکیج با موفقیت بروزرسانی شد.",

        data: updatedPackage,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "Error updating package:",
      error
    );

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,

          message:
            "این اسلاگ قبلاً استفاده شده است.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,

        message:
          "خطای سرور در ویرایش پکیج",

        error:
          error?.message ||
          "Unknown server error",
      },
      {
        status: 500,
      }
    );
  }
}