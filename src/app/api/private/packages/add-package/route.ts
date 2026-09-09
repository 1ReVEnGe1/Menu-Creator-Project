import connectDB from "lib/db";
import { Package } from "models/Package";
import { Menu } from "models/Menu";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import mongoose from "mongoose";

export async function POST(
  req: Request
) {
  try {
    await connectDB();

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
          error:
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
          error:
            "نوع پکیج معتبر نیست.",
        },
        {
          status: 400,
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
          error:
            "اسلاگ پکیج الزامی است.",
        },
        {
          status: 400,
        }
      );
    }

    const existingSlug =
      await Package.findOne({
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
        {
          status: 409,
        }
      );
    }

    // =====================================================
    // MENUS ARRAY
    // =====================================================

    if (
      !Array.isArray(menus) ||
      menus.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "پکیج باید حداقل یک منوی معتبر داشته باشد.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedMenuIds = [
      ...new Set(
        menus.map((id: any) =>
          String(id)
        )
      ),
    ];

    /*
      اگر frontend به هر دلیلی ID تکراری
      بفرستد، request را رد می‌کنیم.
    */
    if (
      normalizedMenuIds.length !==
      menus.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "شناسه تکراری در لیست منوها وجود دارد.",
        },
        {
          status: 400,
        }
      );
    }

    const allIdsValid =
      normalizedMenuIds.every(
        (id) =>
          mongoose.Types.ObjectId.isValid(
            id
          )
      );

    if (!allIdsValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "یک یا چند شناسه منو معتبر نیست.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // MAKE SURE ALL MENUS EXIST
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
          error:
            "یک یا چند منوی ارسالی در دیتابیس وجود ندارد. ساخت پکیج متوقف شد.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CREATE PACKAGE
    // =====================================================

    const newPackage =
      await Package.create({
        title: title.trim(),

        category,

        slug: cleanSlug,

        menus:
          normalizedMenuIds,
      });

    const populatedPackage =
      await Package.findById(
        newPackage._id
      ).populate("menus");

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
        data: populatedPackage,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "Error creating package:",
      error
    );

    /*
      اگر روی Schema برای slug unique index داری،
      این حالت هم duplicate را پوشش می‌دهد.
    */
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error:
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
        error:
          error?.message ||
          "خطا در ساخت پکیج",
      },
      {
        status: 500,
      }
    );
  }
}