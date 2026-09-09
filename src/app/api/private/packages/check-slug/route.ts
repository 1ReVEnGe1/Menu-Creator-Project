import connectDB from "lib/db";
import { Package } from "models/Package";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: Request
) {
  try {
    await connectDB();

    const { searchParams } = new URL(
      req.url
    );

    const rawSlug =
      searchParams.get("slug");

    const currentId =
      searchParams.get("currentId");

    // =====================================================
    // SLUG
    // =====================================================

    if (!rawSlug) {
      return NextResponse.json(
        {
          isUnique: false,
          message:
            "Slug required",
        },
        {
          status: 400,
        }
      );
    }

    const slug = rawSlug
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
      );

    if (!slug) {
      return NextResponse.json(
        {
          isUnique: false,
          message:
            "Slug is invalid",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CURRENT ID
    // =====================================================

    if (
      currentId &&
      !mongoose.Types.ObjectId.isValid(
        currentId
      )
    ) {
      return NextResponse.json(
        {
          isUnique: false,
          message:
            "Current package id is invalid",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CHECK
    // =====================================================

    const existingPackage =
      await Package.findOne({
        slug,

        ...(currentId
          ? {
              _id: {
                $ne: currentId,
              },
            }
          : {}),
      })
        .select("_id")
        .lean();

    return NextResponse.json(
      {
        isUnique:
          !existingPackage,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "Error checking slug:",
      error
    );

    return NextResponse.json(
      {
        isUnique: false,

        error:
          error?.message ||
          "Error checking slug",
      },
      {
        status: 500,
      }
    );
  }
}