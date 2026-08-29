import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { Package } from "models/Package";

import type { IPackageData } from "@/types/publicPackages";

export async function getPublicPackages(): Promise<IPackageData[]> {
  await connectDB();

  const packages = await Package.find({})
    .populate({
      path: "menus",
      model: Menu,
    })
    .lean();

  return packages.map((pkg: any) => ({
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
  }));
}