
import { redirect } from "next/navigation";
import { getPublicPackages } from "utils/publicPackages";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    menu?: string | string[];
  }>;
}

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const packages = await getPublicPackages();

  if (packages.length === 0) {
    return (
      <div className="min-h-screen bg-[#030204] flex items-center justify-center text-zinc-400 text-xs font-bold p-6 text-center">
        هنوز هیچ پکیجی برای نمایش ثبت نشده است.
      </div>
    );
  }

  const params = await searchParams;

  const rawMenuId = params.menu;

  const menuId = Array.isArray(rawMenuId)
    ? rawMenuId[0]
    : rawMenuId;

  /*
   * سازگاری با لینک‌های قدیمی:
   *
   * /?menu=MENU_ID
   *
   * سیستم پیدا می‌کند این منو متعلق به چه پکیجی است
   * و منتقلش می‌کند به:
   *
   * /packages/slug?menu=MENU_ID
   */
  if (menuId) {
    const packageForMenu = packages.find((pkg) =>
      pkg.menus.some((menu) => menu._id === menuId)
    );

    if (packageForMenu) {
      redirect(
        `/packages/${packageForMenu.slug}?menu=${encodeURIComponent(
          menuId
        )}`
      );
    }
  }

  /*
   * اگر فقط خود دامنه باز شود:
   *
   * example.com
   *
   * وارد اولین پکیج می‌شود.
   */
  redirect(`/packages/${packages[0].slug}`);
}