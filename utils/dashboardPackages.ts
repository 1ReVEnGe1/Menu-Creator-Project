import connectDB from "lib/db";
import { Menu } from "models/Menu";
import { Package } from "models/Package";

export async function getDashboardPackages() {
  await connectDB();

  const packages = await Package.find({})
    .select("_id title slug category menus createdAt")
    .populate({
      path: "menus",
      model: Menu,
      select: "_id title pricingTiers items description",
    })
    .sort({ createdAt: -1 })
    .lean();

  return packages.map((pkg: any) => ({
    _id: String(pkg._id),
    title: pkg.title,
    slug: pkg.slug,
    category: pkg.category,
    menus: Array.isArray(pkg.menus)
      ? pkg.menus.map((menu: any) => ({
          _id: String(menu._id),
          title: menu.title,
          description: menu.description || "",
          pricingTiers: Array.isArray(menu.pricingTiers)
            ? menu.pricingTiers.map((tier: any) => ({
                guestCapacity: tier.guestCapacity || "",
                price: tier.price || "",
              }))
            : [],
          items: Array.isArray(menu.items)
            ? menu.items.map((item: any) => ({
                title: item.title || "",
                description: item.description || "",
              }))
            : [],
        }))
      : [],
  }));
}
