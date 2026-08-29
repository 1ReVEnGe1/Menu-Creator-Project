
import { redirect } from "next/navigation";
import { getPackageNavigation } from "utils/publicPackages";

export default async function HomePage() {
  const packages = await getPackageNavigation();

  if (packages.length === 0) {
    return (
      <div className="min-h-screen bg-[#030204] flex items-center justify-center text-zinc-400 text-xs font-bold p-6 text-center">
        هنوز هیچ پکیجی برای نمایش ثبت نشده است.
      </div>
    );
  }

  redirect(`/packages/${packages[0].slug}`);
}