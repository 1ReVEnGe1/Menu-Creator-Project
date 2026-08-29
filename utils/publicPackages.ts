import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { Package } from "models/Package";

import { cacheLife, cacheTag } from "next/cache";

import type { IPackageData } from "@/types/publicPackages";

export interface IPackageNavigation {
  _id: string;
  title: string;
  slug: string;
}

/* =========================================================
   PACKAGE NAVIGATION

   فقط اطلاعاتی که Navigation بالا نیاز دارد.
   menus و prices و items دریافت نمی‌شوند.
========================================================= */

export async function getPackageNavigation(): Promise<
  IPackageNavigation[]
> {
  "use cache";

  // فعلاً هر یک ساعت امکان refresh خودکار
  cacheLife("hours");

  // تمام داده‌های مربوط به پکیج‌ها زیر این Tag قرار می‌گیرند
  cacheTag("public-packages");

  await connectDB();

  const packages = await Package.find({})
    .select("_id title slug")
    .lean();

  return packages.map((pkg: any) => ({
    _id: String(pkg._id),
    title: pkg.title,
    slug: pkg.slug,
  }));
}

/* =========================================================
   SINGLE PACKAGE

   فقط Package موردنظر را بر اساس slug می‌گیریم.
========================================================= */

export async function getPublicPackageBySlug(
  slug: string
): Promise<IPackageData | null> {
  "use cache";

  cacheLife("hours");

  // Tag مشترک
  cacheTag("public-packages");

  // Tag اختصاصی همین Package
  // فعلاً برای آینده نگه می‌داریم.
  cacheTag(`public-package-${slug}`);

  await connectDB();

  const pkg: any = await Package.findOne({
    slug,
  })
    .populate({
      path: "menus",
      model: Menu,
    })
    .lean();

  if (!pkg) {
    return null;
  }

  return {
    _id: String(pkg._id),

    title: pkg.title,

    category: pkg.category,

    slug: pkg.slug,

    menus: Array.isArray(pkg.menus)
      ? pkg.menus.map((menu: any) => ({
          _id: String(menu._id),

          title: menu.title,

          items: Array.isArray(menu.items)
            ? menu.items.map((item: any) => ({
                title: item.title,
                description: item.description || "",
              }))
            : [],

          pricingTiers: Array.isArray(menu.pricingTiers)
            ? menu.pricingTiers.map((tier: any) => ({
                guestCapacity: tier.guestCapacity,
                price: tier.price,
              }))
            : [],

          subtitle: menu.subtitle,

          badge: menu.badge,

          description: menu.description || "",
        }))
      : [],
  };
}