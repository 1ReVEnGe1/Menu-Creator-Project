import connectDB from "lib/db";

import { Package } from "models/Package";

import { NextResponse } from "next/server";

import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      title,
      category,
      slug,
      menus,
    } = body;

    /* =========================================
       VALIDATION
    ========================================= */

    if (!title || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "عنوان و نوع پکیج الزامی است.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================
       SLUG
    ========================================= */

    const generatedSlug =
      slug ||
      title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    /* =========================================
       CREATE PACKAGE
    ========================================= */

    const newPackage =
      await Package.create({
        title,
        category,
        slug: generatedSlug,

        menus: Array.isArray(menus)
          ? menus
          : [],
      });

    /* =========================================
       POPULATE
    ========================================= */

    const populatedPackage =
      await Package.findById(
        newPackage._id
      ).populate("menus");

    /* =========================================
       INVALIDATE PUBLIC CACHE

       Package جدید ساخته شده.
       Navigation و صفحات Public باید
       اطلاعات جدید را دریافت کنند.
    ========================================= */

    revalidateTag(
      "public-packages",
      "max"
    );

    /* =========================================
       RESPONSE
    ========================================= */

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

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "خطا در ساخت پکیج",
      },
      {
        status: 400,
      }
    );
  }
}