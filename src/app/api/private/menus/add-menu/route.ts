import connectDB from "lib/db";

import { Menu } from "models/Menu";

import { NextResponse } from "next/server";

import { revalidateTag } from "next/cache";

export async function POST(
  req: Request
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const {
      title,
      pricingTiers,
      items,
      description,
    } = body;

    /* =========================================
       TITLE VALIDATION
    ========================================= */

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "لطفاً عنوان منو را وارد کنید.",
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
       MENU ITEMS
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
       CREATE MENU
    ========================================= */

    const newMenu =
      await Menu.create({
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
      });

    /* =========================================
       INVALIDATE CACHE
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
        data: newMenu,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "Error creating menu:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error.message ||
          "خطا در ثبت منو",
      },
      {
        status: 400,
      }
    );
  }
}