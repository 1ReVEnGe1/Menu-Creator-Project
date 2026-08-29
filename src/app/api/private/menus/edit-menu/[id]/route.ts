import connectDB from "lib/db";

import { Menu } from "models/Menu";

import { NextResponse } from "next/server";

import { revalidateTag } from "next/cache";

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

    const { id } =
      await params;

    const body =
      await req.json();

    const {
      title,
      pricingTiers,
      items,
      description,
    } = body;

    /* =========================================
       VALIDATION
    ========================================= */

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "عنوان منو الزامی است.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================
       PRICE TIERS
    ========================================= */

    const formattedTiers =
      Array.isArray(pricingTiers)
        ? pricingTiers

            .filter(
              (tier: any) =>
                tier &&
                (
                  typeof tier.guestCapacity ===
                    "string" ||
                  typeof tier.price ===
                    "string"
                )
            )

            .map(
              (tier: any) => ({
                guestCapacity:
                  typeof tier.guestCapacity ===
                  "string"
                    ? tier.guestCapacity.trim()
                    : "",

                price:
                  typeof tier.price ===
                  "string"
                    ? tier.price.trim()
                    : "",
              })
            )

        : [];

    /* =========================================
       ITEMS
    ========================================= */

    const formattedItems =
      Array.isArray(items)
        ? items

            .filter(
              (item: any) =>
                item &&
                typeof item.title ===
                  "string" &&
                item.title.trim() !== ""
            )

            .map(
              (item: any) => ({
                title:
                  item.title.trim(),

                description:
                  typeof item.description ===
                  "string"
                    ? item.description.trim()
                    : "",
              })
            )

        : [];

    /* =========================================
       UPDATE MENU
    ========================================= */

    const updatedMenu =
      await Menu.findByIdAndUpdate(
        id,

        {
          title:
            title.trim(),

          pricingTiers:
            formattedTiers,

          items:
            formattedItems,

          description:
            typeof description ===
            "string"
              ? description.trim()
              : "",
        },

        {
          new: true,
          runValidators: true,
        }
      );

    /* =========================================
       MENU NOT FOUND
    ========================================= */

    if (!updatedMenu) {
      return NextResponse.json(
        {
          success: false,
          message:
            "منوی مورد نظر یافت نشد.",
        },
        {
          status: 404,
        }
      );
    }

    /* =========================================
       INVALIDATE PUBLIC CACHE
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

        message:
          "منو با موفقیت بروزرسانی شد.",

        data:
          updatedMenu,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "Error updating menu:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "خطای سرور در ویرایش منو",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}